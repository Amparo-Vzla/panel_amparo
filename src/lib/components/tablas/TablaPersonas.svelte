<script>
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    // onVerExpediente es la función que pasaremos desde el padre para abrir el modal
    let { data, coincidencias, onVerExpediente } = $props();

    let searchTerm = $state(data.search || '');

    function cambiarPagina(nuevaPagina) {
        const params = new URLSearchParams($page.url.searchParams);
        params.set('page', nuevaPagina.toString());
        goto(`?${params.toString()}`);
    }

    function buscar() {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        params.set('page', '1');
        goto(`?${params.toString()}`);
    }
</script>

<div id="personas">
    <div class="bg-white border border-stone-200 mt-6 p-4 rounded-none  gap-4 grid font-sans">
        <div class="flex flex-col md:flex-row justify-between items-center ">
            
            {#await data.streamed.totalCount}
                <span class="text-[10px] font-black text-stone-400 uppercase font-mono">Cargando...</span>
            {:then totalItems}
                {@const totalPages = Math.ceil(totalItems / 100) || 1}
                <div class="flex items-center gap-2">
                    <button disabled={data.currentPage <= 1} onclick={() => cambiarPagina(data.currentPage - 1)} 
                        class="px-3 py-1.5 bg-stone-100 text-stone-800 border border-stone-200 text-[10px] font-bold uppercase hover:bg-stone-200 disabled:opacity-40 transition rounded-none">
                        Anterior
                    </button>
                    <span class="text-[10px] font-black text-stone-600 uppercase font-mono">
                        PÁGINA {data.currentPage} DE {totalPages}
                    </span>
                    <button disabled={data.currentPage >= totalPages} onclick={() => cambiarPagina(data.currentPage + 1)} 
                        class="px-3 py-1.5 bg-stone-100 text-stone-800 border border-stone-200 text-[10px] font-bold uppercase hover:bg-stone-200 disabled:opacity-40 transition rounded-none">
                        Siguiente
                    </button>
                </div>
            {/await}

            <form onsubmit={(e) => { e.preventDefault(); buscar(); }} class="flex gap-2 w-full md:w-auto">
                <input type="text" placeholder="BUSCAR NOMBRE O APELLIDO..." bind:value={searchTerm} 
                    class="bg-stone-50 p-2 text-[10px] font-medium text-stone-900 uppercase w-full md:w-64 focus:outline-none focus:border-stone-900 rounded-none" />
                <button type="submit" class="bg-stone-900 text-white px-4 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-stone-800 transition rounded-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
                </button>
            </form>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs uppercase m-0">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Estatus</th>
                        <th class="text-right pr-4">Acción</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-stone-100">
                    {#await data.streamed.personas}
                        <tr>
                            <td colspan="5" class="p-6 text-center text-stone-400 text-[10px] font-black uppercase font-mono animate-pulse">
                                Buscando registros de población en la base de datos...
                            </td>
                        </tr>
                    {:then listaPersonas}
                        {#each coincidencias || listaPersonas as p}
                            <tr class="hover:bg-stone-50 text-stone-900 font-medium transition-colors">
                                <td class="p-3 pl-4 font-bold">{p.nombre}</td>
                                <td class="p-3">{p.apellido}</td>
                                <td class="p-3">
                                    <span class="text-[10px] font-black uppercase">{p.estatus}</span>
                                </td>
                                <td class="p-3 text-right pr-4">
                                    <button onclick={() => onVerExpediente(p)} type="button" class="text-blue-700 font-black hover:underline text-[10px] uppercase tracking-wider">
                                        Ver Expediente
                                    </button>
                                </td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="5" class="p-6 text-center text-stone-400 text-[10px] font-black uppercase">
                                    NO SE ENCONTRARON CIUDADANOS REGISTRADOS.
                                </td>
                            </tr>
                        {/each}
                    {/await}
                </tbody>
            </table>
        </div>
    </div>
</div>