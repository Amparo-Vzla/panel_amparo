<script>
    import { enhance } from '$app/forms';
    import Header from '$lib/components/Header.svelte';

    let { data, form } = $props();

    let vacanteSeleccionada = $state(null);
    let refDialog = $state();

    const abrirDetalle = (vacante) => {
        vacanteSeleccionada = vacante;
        refDialog?.showModal();
    };

    const cerrarDetalle = () => {
        refDialog?.close();
        vacanteSeleccionada = null;
    };
</script>

<Header 
    titulo="Cartelera de Vacantes" 
    descripcion="Plazas operativas disponibles en los diferentes centros y sedes de asistencia humanitaria." 
    info=""
    error={form?.error}
    exito={form?.exito}
/>

<div class="bg-white border border-stone-200 rounded-none overflow-hidden">
    <table class="w-full text-left border-collapse m-0">
        <thead>
            <tr class="bg-stone-50 border-b border-stone-200 text-[10px] font-black uppercase text-stone-600">
                <th class="p-2.5 pl-4">Código / Centro</th>
                <th class="p-2.5">Puesto Requerido</th>
                <th class="p-2.5">Área de Trabajo</th>
                <th class="p-2.5 text-right pr-4">Acción</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-stone-100 text-xs font-mono">
            {#await data.streamed.vacantes}
                <tr>
                    <td colspan="4" class="p-4 text-center text-[10px] text-stone-400 font-black uppercase animate-pulse">
                        Buscando requerimientos en la red nacional...
                    </td>
                </tr>
            {:then listaVacantes}
                {#each listaVacantes as vac}
                    <tr class="hover:bg-stone-50 transition">
                        <td class="p-2.5 pl-4">
                            <div class="font-black text-stone-900">{vac.codigo}</div>
                            <div class="text-[8px] text-stone-400 uppercase font-bold">Sede: {vac.entidadCodigo || 'N/A'}</div>
                        </td>
                        <td class="p-2.5 uppercase font-bold text-stone-700">
                            {vac.puestoRequerido || 'General / Multitarea'}
                        </td>
                        <td class="p-2.5 text-stone-500 uppercase text-[11px] font-sans">
                            {vac.areaRequerida || 'No especificada'}
                        </td>
                        <td class="p-2.5 text-right pr-4">
                            <button 
                                type="button" 
                                onclick={() => abrirDetalle(vac)} 
                                class="bg-stone-900 text-white text-[10px] font-black uppercase px-3 py-1 rounded-none hover:bg-black transition tracking-wider"
                            >
                                Analizar
                            </button>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="4" class="p-4 text-center text-stone-400 uppercase text-[10px]">
                            No hay vacantes abiertas en este momento.
                        </td>
                    </tr>
                {/each}
            {/await}
        </tbody>
    </table>
</div>

<dialog bind:this={refDialog} class="p-0 border border-stone-900 rounded-none shadow-2xl backdrop:backdrop-blur-xs w-full max-w-md bg-white">
    {#if vacanteSeleccionada}
        {@render plantillaDetalleVacante(vacanteSeleccionada)}
    {/if}
</dialog>

{#snippet plantillaDetalleVacante(v)}
    <div class="bg-stone-900 text-white p-3 flex justify-between items-center rounded-none">
        <div class="text-[10px] font-black uppercase tracking-wider">Detalles de Requerimiento</div>
        <button type="button" onclick={cerrarDetalle} class="text-white hover:text-stone-400 font-black text-xs">✕</button>
    </div>
    
    <div class="p-4 space-y-4 font-mono text-xs text-stone-800">
        <div class="grid grid-cols-2 gap-2 border-b border-stone-100 pb-2">
            <div>
                <span class="text-[9px] font-black text-stone-400 uppercase block">Código Asignado</span>
                <span class="font-bold text-stone-900 text-sm">{v.codigo}</span>
            </div>
            <div>
                <span class="text-[9px] font-black text-stone-400 uppercase block">Estatus Actual</span>
                <span class="px-1.5 py-0.5 text-[8px] font-black uppercase border bg-amber-50 border-amber-200 text-amber-800 inline-block mt-0.5">
                    {v.estatus}
                </span>
            </div>
        </div>

        <div class="space-y-2 text-[11px]">
            <div>
                <span class="text-[9px] font-black text-stone-400 uppercase block">Puesto Específico</span>
                <span class="uppercase font-bold text-stone-900 font-sans">{v.puestoRequerido || 'CUALQUIER PUESTO'}</span>
            </div>
            <div>
                <span class="text-[9px] font-black text-stone-400 uppercase block">Profesión Requerida</span>
                <span class="uppercase font-bold text-blue-700 font-sans">{v.profesionRequerida || 'CONOCIMIENTOS GENERALES'}</span>
            </div>
            <div>
                <span class="text-[9px] font-black text-stone-400 uppercase block">Área Institucional</span>
                <span class="uppercase text-stone-700 font-sans">{v.areaRequerida || 'TODAS LAS ÁREAS'}</span>
            </div>
        </div>

        <div class="bg-stone-50 p-2 border border-stone-200">
            <span class="text-[9px] font-black text-stone-500 uppercase block">Descripción del Perfil Buscado</span>
            <p class="font-sans text-[11px] text-stone-700 mt-1 leading-tight whitespace-pre-line">{v.descripcion}</p>
        </div>
        
        <form method="POST" action="?/postularse" use:enhance={async () => { cerrarDetalle(); }}>
            <input type="hidden" name="vacanteId" value={v.id} />
            <button 
                type="submit" 
                class="w-full bg-stone-950 text-white py-2 text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-stone-800 transition"
            >
                Confirmar Postulación Voluntaria
            </button>
        </form>
    </div>
{/snippet}