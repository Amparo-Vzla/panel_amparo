<script>
    let { data } = $props();

    let tabActiva = $state('REPORTES'); 
    let itemDetalle = $state(null); 
</script>

<div class="bg-white border border-stone-200 rounded-none">
    <div class="border-b border-stone-200 bg-stone-50 flex text-[10px] font-black uppercase tracking-wider">
        <button type="button" onclick={() => tabActiva = 'REPORTES'}
            class="px-5 py-2.5 border-r border-stone-200 transition focus:outline-none rounded-none
            {tabActiva === 'REPORTES' ? 'bg-white text-stone-900 font-black' : 'text-stone-400 hover:bg-stone-100'}">
            Reportes
        </button>
        <button type="button" onclick={() => tabActiva = 'DENUNCIAS'}
            class="px-5 py-2.5 transition focus:outline-none rounded-none
            {tabActiva === 'DENUNCIAS' ? 'bg-white text-stone-900 font-black' : 'text-stone-400 hover:bg-stone-100'}">
            Denuncias
        </button>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left m-0">
            <thead>
                <tr class="bg-stone-100/40 border-b border-stone-200 text-[10px] font-black uppercase text-stone-600">
                    {#if tabActiva === 'REPORTES'}
                        <th class="p-2.5 pl-4">Usuario</th>
                        <th class="p-2.5">Resumen</th>
                        <th class="p-2.5">Fecha</th>
                    {:else}
                        <th class="p-2.5 pl-4">Categoría</th>
                        <th class="p-2.5">Ubicación</th>
                        <th class="p-2.5">Incidencia</th>
                    {/if}
                    <th class="p-2.5 pr-4 text-right">Acción</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-stone-100 text-xs font-mono text-stone-700">
                {#if tabActiva === 'REPORTES'}
                    {#await data.reportes}
                        <tr><td colspan="4" class="p-4 text-center text-[10px] font-black text-stone-400 uppercase tracking-widest animate-pulse">Cargando...</td></tr>
                    {:then lista}
                        {#each lista || [] as rep}
                            <tr class="hover:bg-stone-50/50 transition">
                                <td class="p-2.5 pl-4 font-sans font-bold text-stone-900 uppercase text-[11px]">
                                    {rep.usuarioNombre ? `${rep.usuarioNombre} ${rep.usuarioApellido}` : 'Anónimo'}
                                </td>
                                <td class="p-2.5 truncate max-w-xs font-mono text-stone-600 text-[11px]">{rep.descripcion}</td>
                                <td class="p-2.5 text-stone-400 text-[10px]">{new Date(rep.createdAt).toLocaleDateString()}</td>
                                <td class="p-2.5 pr-4 text-right">
                                    <button onclick={() => itemDetalle = { ...rep, tipo: 'REPORTE' }} class="text-[10px] font-black uppercase text-blue-700 hover:underline">Ver Más</button>
                                </td>
                            </tr>
                        {:else}
                            <tr><td colspan="4" class="p-4 text-center text-stone-400 uppercase text-[10px]">Cero fallas de plataforma reportadas.</td></tr>
                        {/each}
                    {/await}
                {:else}
                    {#await data.denuncias}
                        <tr><td colspan="4" class="p-4 text-center text-[10px] font-black text-stone-400 uppercase tracking-widest animate-pulse">Cargando...</td></tr>
                    {:then lista}
                        {#each lista || [] as den}
                            <tr class="hover:bg-stone-50/50 transition">
                                <td class="p-2.5 pl-4">
                                    <span class="bg-red-50 border border-red-100 text-red-700 text-[9px] font-black px-1.5 py-0.5 uppercase">{den.categoria}</span>
                                </td>
                                <td class="p-2.5 uppercase font-sans text-stone-500 font-bold text-[10px]">
                                    {den.estado} — MUNIC. {den.municipio} ({den.localidad})
                                </td>
                                <td class="p-2.5 font-sans font-black text-stone-900 uppercase text-[11px] tracking-tight">{den.titulo}</td>
                                <td class="p-2.5 pr-4 text-right">
                                    <button onclick={() => itemDetalle = { ...den, tipo: 'DENUNCIAS' }} class="text-[10px] font-black uppercase text-blue-700 hover:underline">Ver Más</button>
                                </td>
                            </tr>
                        {:else}
                            <tr><td colspan="4" class="p-4 text-center text-stone-400 uppercase text-[10px]">Cero afectaciones territoriales en el mapa.</td></tr>
                        {/each}
                    {/await}
                {/if}
            </tbody>
        </table>
    </div>
</div>

{#if itemDetalle}
    <div class="fixed inset-0 flex items-center justify-center backdrop-blur-xs bg-stone-900/30 z-50 p-4">
        <div class="bg-white border border-stone-200 rounded-none w-full max-w-lg shadow-2xl flex flex-col justify-between p-4 space-y-4">
            <div class="space-y-3">
                <div class="border-b border-stone-100 pb-2 flex justify-between items-start">
                    <div>
                        <span class="text-[9px] font-black text-stone-400 uppercase tracking-widest font-mono">Detalle</span>
                        <h3 class="text-xs font-black text-stone-900 uppercase tracking-wider">
                            {itemDetalle.tipo === 'REPORTE' ? 'Inconsistencia del Sistema' : itemDetalle.titulo}
                        </h3>
                    </div>
                    {#if itemDetalle.tipo === 'DENUNCIAS'}
                        <span class="bg-stone-900 text-white font-mono font-black text-[9px] px-2 py-0.5 uppercase">{itemDetalle.categoria}</span>
                    {/if}
                </div>

                {#if itemDetalle.tipo === 'DENUNCIAS'}
                    <div class="bg-stone-50 p-2 border border-stone-150 text-[10px] font-mono text-stone-600 uppercase space-y-0.5">
                        <p><strong class="text-stone-900">Estado:</strong> {itemDetalle.estado}</p>
                        <p><strong class="text-stone-900">Municipio:</strong> {itemDetalle.municipio}</p>
                        <p><strong class="text-stone-900">Parroquia:</strong> {itemDetalle.localidad}</p>
                    </div>
                {/if}

                <div class="space-y-1">
                    <label class="text-[9px] font-black text-stone-400 uppercase block">Declaración</label>
                    <p class="text-xs text-stone-800 font-mono bg-stone-50/50 p-3 border border-stone-200/60 whitespace-pre-line leading-relaxed max-h-[250px] overflow-y-auto">
                        {itemDetalle.descripcion}
                    </p>
                </div>

                {#if itemDetalle.createdAt}
                    <div class="text-[9px] font-mono text-stone-400 uppercase text-right">
                        Fecha de registro: {new Date(itemDetalle.createdAt).toLocaleString()}
                    </div>
                {/if}
            </div>

            <div class="flex justify-end pt-2 border-t border-stone-100">
                <button type="button" onclick={() => itemDetalle = null}
                    class="bg-stone-900 text-white px-4 py-1.5 text-[11px] font-bold uppercase rounded-none tracking-wide hover:bg-black transition">
                    Cerrar
                </button>
            </div>
        </div>
    </div>
{/if}