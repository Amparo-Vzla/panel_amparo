<script>
    import { enhance } from '$app/forms';  
    import Ubicacion from '../Ubicacion.svelte';
    let { form = $bindable(), estatusPersona } = $props();
    let verificado = $state(false);
    let inputImgUrl = $state(form?.img || "");
    let imgError = $state(false);
    let imgCargando = $state(false);

    function validarImagen() {
        if (!inputImgUrl) {
            imgError = false;
            imgCargando = false;
            return;
        }
        imgCargando = true;
        imgError = false;
        
        const img = new Image();
        img.src = inputImgUrl;
        img.onload = () => {
            imgCargando = false;
            imgError = false;
        };
        img.onerror = () => {
            imgCargando = false;
            imgError = true;
        };
    }

    function romperVerificacion() {
        verificado = false;
        if (form) {
            form.coincidencias = null;
            form.bloqueo = false;
            form.error = null;
            form.exito = null;
        }
    }
</script>

<div id="registrar">
    <form 
        method="POST" 
        action="?/verificar" 
        use:enhance={({ action }) => {
            return async ({ result }) => {
                if (result.type === 'success' || result.type === 'failure') {
                    form = result.data;
                    if (action.search.includes('verificar') && result.type === 'success') {
                        verificado = true;
                    } else if (action.search.includes('registrarPersona') && result.type === 'success') {
                        verificado = false;
                        estadoSeleccionado = "";
                        municipioSeleccionado = "";
                        localidadSeleccionada = "";
                        inputImgUrl = "";
                    }
                }
            };
        }} 
        class="bg-white p-6 border border-stone-200 rounded-none space-y-4"
    >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1">
                <label for="nombre" class="text-[10px] font-black uppercase text-stone-600">Nombre del Ciudadano *</label>
                <input type="text" id="nombre" name="nombre" required value={form?.nombre ?? ''} oninput={romperVerificacion}
                     />
            </div>
            <div class="space-y-1">
                <label for="apellido" class="text-[10px] font-black uppercase text-stone-600">Apellido del Ciudadano *</label>
                <input type="text" name="apellido" required value={form?.apellido ?? ''} oninput={romperVerificacion}
                     />
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-1">
                <label for="cedula" class="text-[10px] font-black uppercase text-stone-600">Cédula de Identidad</label>
                <input type="text" name="cedula" value={form?.cedula ?? ''} oninput={romperVerificacion}
                     />
            </div>
            <div class="space-y-1">
                <label for="genero" class="text-[10px] font-black uppercase text-stone-600">Género *</label>
                <select name="genero" required value={form?.genero ?? ''}
                    >
                    <option value="">Seleccione Género...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                </select>
            </div>
            <div class="space-y-1">
                <label for="fechaNacimiento" class="text-[10px] font-black uppercase text-stone-600">Fecha de Nacimiento</label>
                <input type="date" name="fechaNacimiento" value={form?.fechaNacimiento ?? ''}/>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1">
                <label for="estatus" class="text-[10px] font-black uppercase text-stone-600">Estatus del Ciudadano *</label>
                <select name="estatus" required value={form?.estatus ?? 'desaparecido'}
                    >
                    {#if estatusPersona}
                        {#each estatusPersona as estatus}
                            <option value={estatus}>{estatus}</option>
                        {/each}
                    {/if}
                </select>
            </div>
            <Ubicacion />
        </div>



        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start border-t border-stone-100 pt-3">
            <div class="lg:col-span-8 space-y-1">
                <label for="direccionExacta" class="text-[10px] font-black uppercase text-stone-600">Dirección Exacta</label>
                <input type="text" name="direccionExacta" value={form?.direccionExacta ?? ''}/>
                <label for="img" class="text-[10px] font-black uppercase text-stone-600 block">Vínculo de Fotografía Externa (URL)</label>
                <p class="text-[10px] text-stone-400 font-mono leading-tight uppercase">
                    EL ARCHIVO DEBE SER UNA URL CARGADA PREVIAMENTE EN OTRAS PLATAFORMAS (COMO GOOGLE DRIVE DE ACCESO PÚBLICO, PROTON DRIVE O ALMACENAMIENTO DE IMÁGENES).
                </p>
                <input type="url" name="img" bind:value={inputImgUrl} oninput={validarImagen} placeholder="https://ejemplo.com/foto.jpg"
                    class="lowercase" />
              
            </div>

            <div class="lg:col-span-4 h-full border border-stone-200 bg-stone-50 flex items-center justify-center rounded-none relative overflow-hidden font-mono text-[9px] uppercase font-bold text-center p-2">
                {#if !inputImgUrl}
                    <span class="text-stone-400">Sin archivo para verificar</span>
                {:else if imgCargando}
                    <span class="text-stone-600 animate-pulse">Comprobando...</span>
                {:else if imgError}
                    <span class="text-red-600">\Ruta de imagen inválida o privada</span>
                {:else}
                    <img src={inputImgUrl} alt="Previsualización" class="absolute inset-0 w-full h-full object-cover" />
                    <span class="absolute bottom-0 inset-x-0 bg-emerald-800 text-white text-[8px] p-0.5">Vínculo correcto</span>
                {/if}
            </div>
        </div>

        <div class="space-y-1">
            <label for="caracteristicas" class="text-[10px] font-black uppercase text-stone-600">Características de Reconocimiento / Notas *</label>
            <textarea name="caracteristicas" required value={form?.caracteristicas ?? ''}
                ></textarea>
        </div>

        <div class="pt-2">
            {#if !verificado || form?.bloqueo}
                <button type="submit" 
                    class="w-full bg-stone-900 text-white p-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition rounded-none">
                    Verificar Datos y Posibles Duplicados
                </button>
            {:else}
                {#if form?.coincidencias?.length > 0}
                    <div class="p-2 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase mb-3 rounded-none">
                        SE ENCONTRARON NOMBRES SIMILARES. VALIDE EN LA TABLA INFERIOR QUE NO SEA LA MISMA PERSONA ANTES DE REGISTRAR.
                    </div>
                {/if}
                <button formaction="?/registrarPersona" type="submit" 
                    class="w-full bg-emerald-800 text-white p-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-900 transition rounded-none">
                    Confirmar y Registrar Persona
                </button>
            {/if}
        </div>
    </form>
</div>