<script>
    import { error } from '@sveltejs/kit';
    import { enhance } from '$app/forms';
    import Header from '$lib/components/Header.svelte';
    import Ubicacion from '$lib/components/Ubicacion.svelte';
    import actualizaciones from '$lib/data/actualizaciones.json';

    let { form, data } = $props();
    let dialogRef = $state(null);
    let latitud = $state('8.000000');
    let longitud = $state('-66.000000');
    let cargando = $state(false);
    
    let estadoProgreso = $state("");
    let solicitudProcesada = $state(null);
    
    let mapElement = $state(null);
    let map = null;
    let marker = null;

    const URL_CLOUDFLARE_WORKER = "https://amparo-video-bridge.juanpablogzlp.workers.dev";

    // Función limpia: abre y enciende el mapa si ya cargó el motor
    function abrirModal() {
        dialogRef?.showModal();
        
        // Esperamos un instante a que la ventana se dibuje
        setTimeout(() => {
            if (!window.L || !mapElement) return;

            if (!map) {
                // Creamos el mapa centrado en Venezuela
                map = window.L.map(mapElement).setView([8.0, -66.0], 6);
                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                
                // Escuchamos el clic vecinal para marcar las coordenadas
                map.on('click', (e) => {
                    latitud = e.latlng.lat.toFixed(6);
                    longitud = e.latlng.lng.toFixed(6);
                    
                    if (marker) marker.setLatLng(e.latlng);
                    else marker = window.L.marker(e.latlng).addTo(map);
                });
            }
            // Esto le avisa al mapa que recalcule su tamaño ahora que es visible
            map.invalidateSize();
        }, 150);
    }
</script>

<svelte:head>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</svelte:head>

<dialog bind:this={dialogRef} class="m-auto w-[90%] max-w-4xl bg-white p-6 shadow-2xl rounded-none border border-stone-200 backdrop:bg-stone-900/60 backdrop-blur-sm">
    {#if solicitudProcesada}
        <div class="text-center py-10 space-y-4">
            <h3 class="font-black text-xs text-emerald-800 uppercase tracking-wider">¡Organización Registrada y Verificada!</h3>
            <p class="text-xs font-mono bg-stone-50 p-3 border border-stone-200 text-stone-800 max-w-md mx-auto">
                Código: <br><strong class="text-sm text-stone-900 tracking-widest">{solicitudProcesada}</strong>
            </p>
        </div>
    {:else}
        <form 
            method="POST" 
            action="?/crearEntidad" 
            enctype="multipart/form-data"
            use:enhance={({ formData }) => {
                cargando = true;
                estadoProgreso = "Guardando datos de la organización...";

                const archivoVideo = formData.get("video_verificacion");
                const nombreOrganizacion = formData.get("nombre");
                const tipoOrg = formData.get("tipo");
                const est = formData.get("estado");
                const mun = formData.get("municipio");
                const par = formData.get("localidad");
                
                formData.delete("video_verificacion");

                return async ({ update, result }) => {
                    if (result.type === 'success' && result.data?.codigo) {
                        const codigoAsignado = result.data.codigo;
                        estadoProgreso = "Subiendo video de verificación...";

                        const paqueteWorker = new FormData();
                        paqueteWorker.append("video", archivoVideo);
                        paqueteWorker.append("codigo", codigoAsignado);
                        paqueteWorker.append("nombre", nombreOrganizacion);
                        paqueteWorker.append("tipo", tipoOrg);
                        paqueteWorker.append("estado", est);
                        paqueteWorker.append("municipio", mun);
                        paqueteWorker.append("parroquia", par);
                        paqueteWorker.append("tema_id", "7");

                        try {
                            const respuestaWorker = await fetch(URL_CLOUDFLARE_WORKER, {
                                method: "POST",
                                body: paqueteWorker
                            });

                            if (respuestaWorker.ok) {
                                solicitudProcesada = codigoAsignado;
                            } else {
                                throw new Error();
                            }
                        } catch (err) {
                            const reversoForm = new FormData();
                            reversoForm.append("codigo", codigoAsignado);
                            await fetch("?/deshacerEntidad", { method: "POST", body: reversoForm });
                        }
                    } else {
                        await update(); 
                    }
                    cargando = false;
                    estadoProgreso = "";
                };
            }} 
            class="space-y-4"
        >
            <h3 class="font-black uppercase text-[10px] border-b border-stone-200 pb-2 mb-4 text-stone-600 tracking-wider">Postular Organización</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                    <label for="nombre" class="text-[10px] font-black uppercase text-stone-600">Nombre de la Organización</label>
                    <input name="nombre" required class="w-full" />
                </div>
                <div class="space-y-1">
                    <label for="emailContacto" class="text-[10px] font-black uppercase text-stone-600">Email de Contacto</label>
                    <input name="emailContacto" type="email" required class="lowercase"  />
                </div>
            </div>
            <div >
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="text-[10px] font-black uppercase text-stone-600">Teléfono Principal</label>
                        <div class="flex">
                            <select name="codigo1" required class="w-min" >
                                <option value="0412">0412</option>
                                <option value="0422">0422</option>
                                <option value="0414">0414</option>
                                <option value="0424">0424</option>
                                <option value="0416">0416</option>
                                <option value="0426">0426</option>
                            </select>
                            <input type="tel" id="phone1" name="telefonoPrincipal" required placeholder="0000000"/>
                        </div>
                    </div>
                    <div>
                        <label class="text-[10px] font-black uppercase text-stone-600">Teléfono Secundario</label>
                        <div class="flex">
                            <select name="codigo2" required class="w-min" >
                                <option value="0412">0412</option>
                                <option value="0422">0422</option>
                                <option value="0414">0414</option>
                                <option value="0424">0424</option>
                                <option value="0416">0416</option>
                                <option value="0426">0426</option>
                            </select>
                            <input type="tel" id="phone2" name="telefonoSecundario" placeholder="0000000"/>
                        </div>
                    </div>   
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div class="space-y-1">
                    <label for="tipo" class="text-[10px] font-black uppercase text-stone-600">Tipo</label>
                    <select name="tipo" class="w-full" required>
                        <option value="" disabled selected>SELECCIONE...</option>
                        {#if data.tipoEntidad}
                            {#each data.tipoEntidad as tipo}
                                <option value={tipo}>{tipo}</option>
                            {/each}
                        {/if}
                    </select>
                </div>
                <Ubicacion />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1 bg-stone-50 p-3 border border-stone-200">
                    <label for="video_verificacion" class="text-[10px] font-black uppercase text-stone-700 block">Video de Verificación (Obligatorio)</label>
                    <input type="file" name="video_verificacion" accept="video/*" required class="w-full text-xs" />
                </div>
                <textarea name="direccionExacta" placeholder="Dirección exacta o punto de referencia vecinal" class="w-full" required></textarea>
            </div>
            
            <div class="flex flex-col gap-2">
                <div bind:this={mapElement} class="w-full h-40 bg-stone-50 border border-stone-200 z-0"></div>
                <div class="grid grid-cols-2 gap-2 text-[9px] font-mono text-stone-400">
                    <div class="bg-stone-50 p-1 border border-stone-200">LAT: {latitud}</div>
                    <div class="bg-stone-50 p-1 border border-stone-200">LNG: {longitud}</div>
                </div>
                <input type="hidden" name="latitud" value={latitud} />
                <input type="hidden" name="longitud" value={longitud} />
            </div>           

            {#if estadoProgreso}
                <div class="p-2 bg-stone-900 text-white font-mono text-[9px] uppercase tracking-wider text-center">
                    {estadoProgreso}
                </div>
            {/if}

            <button type="submit" disabled={cargando} class="w-full bg-stone-900 text-white p-3 font-black uppercase text-xs hover:bg-stone-800 transition disabled:bg-stone-200 disabled:text-stone-400 rounded-none tracking-wider">
                {cargando ? 'PROCESANDO REGISTRO...' : 'Registrar Organización'}
            </button>
        </form>
    {/if}
</dialog>

<Header 
titulo="Esperamos que te encuentres bien" 
descripcion="" 
info="" 
error={form?.error}
exito={form?.exito}
 />

<section id="bitacora-cambios" class="w-full bg-stone-50 border border-stone-200 p-6 rounded-none space-y-6">
    <div class="flex flex-wrap justify-between items-center">
        <div class="bg-blue-700 text-white">
            <h3 class="text-xs p-3 font-black uppercase">Descubre lo nuevo</h3>
        </div>
        <div>
            {#if data.user && data.user.rol !== 'ENCARGADO' && data.user.rol !== 'ADMIN'}
                <button onclick={abrirModal} type="button" class="bg-stone-900 text-white font-black uppercase text-xs p-3 hover:bg-stone-800 transition flex justify-center items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building2-icon lucide-building-2"><path d="M10 12h4"/><path d="M10 8h4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/></svg> Postular Organización
                </button>
            {/if}
        </div>
    </div>

    <div class="w-full space-y-4 font-sans">
        {#each actualizaciones as item (item.titulo + item.fecha)}
            <div class="p-6 border rounded-none flex flex-col md:flex-row gap-6 justify-between items-start
                {item.categoria === 'Novedad' ? 'bg-emerald-600 border-emerald-700 text-white' : 
                 item.categoria === 'Arreglo' ? 'bg-red-600 border-red-700 text-white' : 
                 'bg-amber-400 border-amber-500 text-stone-950'}">
                
                <div class="space-y-3 md:w-48 w-full flex-shrink-0">
                    <div class="flex items-center gap-2">
                        <span class="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border border-current rounded-none">
                            {item.categoria}
                        </span>
                        <span class="text-[10px] font-mono font-bold opacity-80">
                            {item.fecha}
                        </span>
                    </div>
                    <div class="text-[11px] font-mono uppercase tracking-wider font-black opacity-90">
                        {item.referencia}
                        <br />
                        <span class="text-[10px] font-mono font-bold opacity-80">{item.autor}</span>
                    </div>
                </div>

                <div class="space-y-1.5 flex-1 w-full md:border-l md:border-current/20 md:pl-6">
                    <h4 class="text-sm font-black uppercase tracking-tight leading-tight">{item.titulo}</h4>
                    <p class="text-xs normal-case leading-relaxed font-medium opacity-95">{item.descripcion}</p>
                </div>
            </div>
        {/each}
    </div>
</section>