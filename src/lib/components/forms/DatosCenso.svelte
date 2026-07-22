<script>
    import { enhance } from '$app/forms';
    import Ubicacion from '../Ubicacion.svelte';

    let { perfilPromesa, personaAsociadaPromesa, estatusPersona } = $props();

</script>

<div class="space-y-4">
    {#await Promise.all([perfilPromesa, personaAsociadaPromesa])}
        <div class="bg-white border border-stone-200 p-4 rounded-none space-y-3 animate-pulse">
            <div class="h-3 bg-stone-200 w-1/3 rounded-none"></div>
            <div class="h-10 bg-stone-100 rounded-none"></div>
        </div>
    {:then [perfil, persona]}
        <!-- Alerta de Exclusión del Censo -->
        {#if !perfil.personaId}
            <div class="bg-amber-50 border border-amber-200 p-3 text-amber-800 text-[10px] font-black uppercase tracking-wide rounded-none flex items-center gap-2">
                ⚠️ ATENCIÓN: Esta cuenta no está vinculada al Censo. Complete e; formulario para sincronizar su estado operativo.
            </div>
        {/if}

        <!-- Bloque 3: Sincronización Territorial Geográfica -->
        <div class="bg-white border border-stone-200 p-4 rounded-none w-full">
            <h3 class="text-[10px] font-black uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2 mb-4">
                3. Ubicación
            </h3>
            <form method="POST" action="?/sincronizarCenso" use:enhance class="space-y-4">
                <div class="space-y-1">
                    <label for="estatusPersona" class="text-[10px] font-black uppercase text-stone-600">Estatus Operativo del Sujeto</label>
                    <select name="estatusPersona" value={persona?.estatus || 'BIEN'} >
                        {#each estatusPersona as est}
                            {#if est != "DESAPARECIDO" }
                                <option value={est}>{est}</option>
                            {/if}
                        {/each}
                    </select>
                </div>

                <Ubicacion />

                <div class="space-y-1">
                    <label for="direccionExacta" class="text-[10px] font-black uppercase text-stone-600">Dirección Exacta</label>
                    <textarea name="direccionExacta" rows="3" required >{persona?.direccionExacta || ''}</textarea>
                </div>

                <div class="space-y-1">
                    <label for="caracteristicas" class="text-[10px] font-black uppercase text-stone-600">Caracteristicas</label>
                    <textarea name="caracteristicas" rows="3" required >{persona?.caracteristicas || ''}</textarea>
                </div>

                <div class="flex justify-end">
                    <button type="submit" class="bg-stone-900 hover:bg-stone-800 text-white font-black uppercase text-[10px] tracking-wider px-5 py-2.5 rounded-none transition">
                        GUARDAR
                    </button>
                </div>
            </form>
        </div>
    {/await}
</div>