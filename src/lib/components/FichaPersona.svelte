<script>
    import { date } from 'drizzle-orm/mysql-core';
    import { toPng } from 'html-to-image';
    import { tick } from 'svelte';

    let { persona, open = $bindable(false) } = $props();
    let dialogRef = $state(null);
    let exportRef = $state(null);
    let procesandoImagen = $state(false);

    $effect(() => {
        if (!dialogRef) return;
        if (open) {
            if (!dialogRef.open) dialogRef.showModal();
        } else {
            if (dialogRef.open) dialogRef.close();
        }
    });

    async function generarReporteImagen() {
        if (!persona || persona.estatus === 'BIEN' || procesandoImagen) return;
        
        procesandoImagen = true;
        
        try {
            await tick();

            if (!exportRef) {
                alert("Error: El contenedor de exportación no está listo.");
                return;
            }

            // Ahora que las coordenadas son locales (0,0), el renderizado no saldrá en blanco
            const dataUrl = await toPng(exportRef, {
                width: 1080,
                height: 1350,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left'
                }
            });

            const link = document.createElement('a');
            link.download = `ALERTA_${persona.estatus}_${persona.nombre}_${persona.apellido}.png`.toUpperCase();
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Error detallado de html-to-image:", error);
            alert(`Error al generar la imagen: ${error.message}`);
        } finally {
            procesandoImagen = false;
        }
    }
</script>

<dialog 
    bind:this={dialogRef} 
    onclose={() => open = false}
    class="backdrop:bg-stone-900/40 backdrop:backdrop-blur-xs m-auto bg-white border border-stone-900 rounded-none w-[95%] max-w-4xl p-0 shadow-2xl"
>
    {#if persona}
        <div class="bg-slate-900 text-white p-4 flex justify-between items-center rounded-none border-b border-stone-800">
            <h3 class="text-xs font-black uppercase tracking-tight">Expediente de Población Civil</h3>
            <button onclick={() => open = false} type="button" class="text-stone-400 hover:text-white font-black text-sm transition-colors">✕</button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-12 text-xs font-sans text-stone-900">
            
            <div class="p-4 space-y-4 md:col-span-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-200">
                <div class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-stone-700 bg-stone-50 p-3 border border-stone-200 rounded-none">
                        <div class="space-y-0.5">
                            <span class="block text-[9px] font-black text-stone-400 uppercase">Ciudadano</span>
                            <p class="font-bold text-stone-900 uppercase text-xs">{persona.nombre} {persona.apellido}</p>
                        </div>
                        <div class="space-y-0.5">
                            <span class="block text-[9px] font-black text-stone-400 uppercase">Características</span>
                            <p class="text-stone-800 text-[11px] font-bold uppercase">
                                {persona.genero === 'M' ? 'MASCULINO' : 'FEMENINO'} | {persona.fechaNacimiento || 'N/A'}
                            </p>
                        </div>
                        <div class="space-y-0.5">
                            <span class="block text-[9px] font-black text-stone-400 uppercase">Estatus</span>
                            <div>
                                <span class="inline-block px-2 py-0.5 bg-stone-900 text-white text-[9px] font-black uppercase rounded-none">
                                    {persona.estatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-1">
                        <span class="block text-[9px] font-black text-stone-400 uppercase">Ubicación</span>
                        <p class="text-stone-900 font-bold uppercase text-[11px]">
                            Edo. {persona.estado} <span class="text-stone-300 font-mono">/</span> Mun. {persona.municipio || 'N/A'} <span class="text-stone-300 font-mono">/</span> Parroquia {persona.localidad || 'N/A'}
                        </p>
                        <div class="text-stone-700 bg-stone-50 p-2.5 border border-stone-200 font-mono text-[11px] uppercase rounded-none">
                            <span class="font-sans font-black text-[9px] text-stone-400 block">Dirección Exacta:</span>
                            "{persona.direccionExacta || 'SIN INDICACIÓN'}"
                        </div>
                    </div>

                    <div class="space-y-1">
                        <span class="block text-[9px] font-black text-stone-400 uppercase">Descripción</span>
                        <p class="bg-stone-50 p-3 border border-stone-200 text-stone-800 text-[11px] whitespace-pre-wrap uppercase leading-tight font-mono rounded-none max-h-36 overflow-y-auto">
                            {persona.caracteristicas}
                        </p>
                    </div>
                </div>

                {#if persona.estatus !== 'BIEN'}
                    <div class="pt-4 border-t border-stone-100 hidden md:block">
                        <button 
                            onclick={generarReporteImagen} 
                            type="button" 
                            disabled={procesandoImagen}
                            class="bg-blue-700 text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 disabled:bg-stone-400 transition rounded-none shadow-sm"
                        >
                            {procesandoImagen ? 'PROCESANDO REPORTE...' : 'DESCARGAR FICHA DE ALERTA (PNG)'}
                        </button>
                    </div>
                {/if}
            </div>

            <div class="md:col-span-5 bg-stone-50 flex flex-col justify-between p-4 space-y-3">
                <span class="block text-[9px] font-black text-stone-400 uppercase">Fotografía de Identificación</span>
                
                <div class="w-full flex-1 min-h-[260px] md:min-h-0 border border-stone-200 bg-white overflow-hidden flex items-center justify-center rounded-none relative">
                    {#if persona.img}
                        <img src={persona.img} crossorigin="anonymous" alt="Identificación del ciudadano" class="absolute inset-0 w-full h-full object-cover" />
                    {:else}
                        <div class="text-center font-mono text-stone-400 text-[10px] font-bold uppercase p-4">
                            Imagen no proporcionada
                        </div>
                    {/if}
                </div>

                {#if persona.estatus !== 'BIEN'}
                    <div class="block md:hidden pt-2">
                        <button 
                            onclick={generarReporteImagen} 
                            type="button" 
                            disabled={procesandoImagen}
                            class="w-full bg-blue-700 text-white py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-blue-800 disabled:bg-stone-400 transition rounded-none text-center"
                        >
                            {procesandoImagen ? 'PROCESANDO REPORTE...' : 'DESCARGAR FICHA DE ALERTA'}
                        </button>
                    </div>
                {/if}
            </div>

        </div>
    {/if}
</dialog>

{#if persona && persona.estatus !== 'BIEN'}
    <div style="position: absolute; top: 0; left: 0; width: 0; height: 0; overflow: hidden; pointer-events: none;">
        <div 
            bind:this={exportRef}
            style="background-color: #f4f4f4; color: #111111; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; padding: 45px; width: 1080px; height: 1350px; user-select: none; font-family: system-ui, -apple-system, sans-serif; overflow: hidden; border: 1px solid #cccccc;"
        >
            <div style="background-color: #cc0000; color: #ffffff; height: 90px; padding: 0 32px; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; width: 100%;">
                <span style="font-size: 42px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; margin: 0; padding: 0; line-height: 1; display: inline-block;">
                    {persona.estatus}
                </span>
                <span style="height: 50px; display: block; margin: 0; padding: 0;">
                    <img src="/img/logos/logo_borde.png" width="50" style="display: block; max-height: 50px; width: auto;" alt="Logo Borde">
                </span>
            </div>

            <div style="background-color: #ffffff; width: 100%; height: 620px; position: relative; overflow: hidden; margin-top: 20px; box-sizing: border-box;">
                {#if persona.img}
                    <img 
                        src={persona.img} 
                        crossorigin="anonymous" 
                        alt="Fotografía Principal" 
                        style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; object-fit: cover; object-position: center;" 
                    />
                {:else}
                    <div style="color: #888888; height: 100%; width: 100%; display: flex; align-items: center; justify-content: center; font-weight: 900; text-transform: uppercase; text-align: center; font-size: 26px; letter-spacing: 0.05em;">
                        INFORMACION NO PROPORCIONADA
                    </div>
                {/if}
            </div>

            <div style="margin-top: 20px; width: 100%; box-sizing: border-box; border-bottom: 4px solid #111111; padding-bottom: 14px; margin-bottom: 4px;">
                <h1 style="font-size: 44px; font-weight: 900; text-transform: uppercase; color: #111111; margin: 0; padding: 0; letter-spacing: -0.01em; line-height: 1;">
                    {persona.nombre || 'INFORMACION NO PROPORCIONADA'} {persona.apellido || ''}
                </h1>
            </div>

            <div style="display: grid; grid-template-columns: 400px 1fr; gap: 24px; width: 100%; box-sizing: border-box; flex: 1; margin-top: 16px; align-items: stretch; overflow: hidden;">
                
                <div style="display: flex; flex-direction: column; gap: 16px; height: 100%;">
                    
                    <div style="background-color: #ffffff; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px;">
                        <div>
                            <span style="color: #666666; font-size: 12px; font-weight: 900; letter-spacing: 0.05em; display: block; text-transform: uppercase; margin: 0; padding: 0; line-height: 1.2;">ESTADO</span>
                            <p style="font-size: 22px; font-weight: 800; color: #111111; margin: 0; text-transform: uppercase; line-height: 1.2;">
                                {persona.estado || 'INFORMACION NO PROPORCIONADA'}
                            </p>
                        </div>
                        <div style="border-top: 1px solid #eeeeee; padding-top: 8px;">
                            <span style="color: #666666; font-size: 12px; font-weight: 900; letter-spacing: 0.05em; display: block; text-transform: uppercase; margin: 0; padding: 0; line-height: 1.2;">MUNICIPIO</span>
                            <p style="font-size: 22px; font-weight: 800; color: #111111; margin: 0; text-transform: uppercase; line-height: 1.2;">
                                {persona.municipio || 'INFORMACION NO PROPORCIONADA'}
                            </p>
                        </div>
                        <div style="border-top: 1px solid #eeeeee; padding-top: 8px;">
                            <span style="color: #666666; font-size: 12px; font-weight: 900; letter-spacing: 0.05em; display: block; text-transform: uppercase; margin: 0; padding: 0; line-height: 1.2;">PARROQUIA</span>
                            <p style="font-size: 22px; font-weight: 800; color: #111111; margin: 0; text-transform: uppercase; line-height: 1.2;">
                                {persona.localidad || 'INFORMACION NO PROPORCIONADA'}
                            </p>
                        </div>
                    </div>

                    <div style="background-color: #ffffff; padding: 20px; box-sizing: border-box; flex: 1; display: flex; flex-direction: column; justify-content: flex-start;">
                        <span style="color: #666666; font-size: 12px; font-weight: 900; letter-spacing: 0.05em; display: block; text-transform: uppercase; margin: 0; padding: 0; line-height: 1.2;">DIRECCION EXACTA</span>
                        <p style="font-size: 18px; line-height: 1.4; color: #222222; margin: 0; margin-top: 6px; text-transform: uppercase; white-space: pre-wrap; word-break: break-word;">
                            {persona.direccionExacta ? `"${persona.direccionExacta}"` : 'INFORMACION NO PROPORCIONADA'}
                        </p>
                    </div>

                </div>
                
                <div style="display: flex; flex-direction: column; gap: 16px; height: 100%;">
                    
                    <div style="background-color: #ffffff; padding: 20px; box-sizing: border-box;">
                        <span style="color: #666666; font-size: 12px; font-weight: 900; letter-spacing: 0.05em; display: block; text-transform: uppercase; margin: 0; padding: 0; line-height: 1.2;">GENERO</span>
                        <p style="font-size: 22px; font-weight: 800; color: #111111; margin: 0; margin-top: 4px; text-transform: uppercase; line-height: 1.2;">
                            {persona.genero ? (persona.genero === 'M' ? 'MASCULINO' : 'FEMENINO') : 'INFORMACION NO PROPORCIONADA'} 
                        </p>
                        <span style="color: #666666; font-size: 12px; font-weight: 900; letter-spacing: 0.05em; display: block; text-transform: uppercase; margin: 0; padding: 0; line-height: 1.2;">FECHA DE NACIMIENTO</span>
                        <p style="font-size: 22px; font-weight: 800; color: #111111; margin: 0; margin-top: 4px; text-transform: uppercase; line-height: 1.2;">
                            {persona.fechaNacimiento || 'INFORMACION NO PROPORCIONADA'}
                        </p>
                    </div>

                    <div style="background-color: #ffffff; padding: 20px; box-sizing: border-box; flex: 1; display: flex; flex-direction: column; justify-content: flex-start;">
                        <span style="color: #666666; font-size: 12px; font-weight: 900; letter-spacing: 0.05em; display: block; text-transform: uppercase; margin: 0; padding: 0; line-height: 1.2;">DESCRIPCIÓN</span>
                        <p style="font-size: 20px; font-weight: 700; color: #111111; margin: 0; margin-top: 6px; text-transform: uppercase; line-height: 1.4; word-break: break-word;">
                           {persona.caracteristicas || 'INFORMACION NO PROPORCIONADA'}
                        </p>
                    </div>

                </div>
            </div>

            <div style="border-top: 4px solid #111111; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 15px; color: #666666; margin-top: 20px; width: 100%; box-sizing: border-box; font-weight: 700; letter-spacing: 0.02em;">
                <span style="margin: 0; padding: 0; line-height: 1.2;">{Date()}</span>
                <span style="font-weight: 900; color: #111111; margin: 0; padding: 0; line-height: 1.2;">AMPARO VENEZUELA</span>
            </div>
        </div>
    </div>
{/if}