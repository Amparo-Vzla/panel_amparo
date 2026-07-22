<script>
import {
    enhance
} from '$app/forms';
import {
    goto
} from '$app/navigation';
import Header from '$lib/components/Header.svelte';

let {
    data,
    form
} = $props();

let queryBusqueda = $state(data.buscar);
let guardando = $state(false);

function ejecutarBusqueda(e) {
    e.preventDefault();
    const url = new URL(window.location.href);
    if (queryBusqueda) url.searchParams.set('q', queryBusqueda);
    else url.searchParams.delete('q');
    url.searchParams.set('page', '1');
    goto(url.toString(), {
        keepFocus: true,
        replaceState: true
    });
}

function cambiarPagina(nuevaPagina) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', nuevaPagina.toString());
    goto(url.toString(), {
        keepFocus: true
    });
}
</script>

<Header
    titulo="Catálogo Maestro de Recursos"
    descripcion="Definición global de suministros de auxilio, tipificación estandarizada y buscador de inventario."
    info=""
    error={form?.error}
    exito={form?.exito}
    />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div class="bg-white border border-stone-200 p-4 rounded-none space-y-4">
            <form method="POST" action="?/crearRecurso" use:enhance={() => {
                guardando = true;
                return async ({ update }) => {
                await update();
                guardando = false;
                };
                }} class="space-y-4">
                <div class="space-y-1">
                    <label for="nombre" class="text-[10px] font-black uppercase text-stone-600">Nombre*</label>
                    <input type="text" name="nombre" required class="w-full border border-stone-200 bg-stone-50 p-2 text-xs font-medium uppercase focus:outline-none focus:border-stone-900 rounded-none" />
                </div>

                <div class="space-y-1">
                    <label for="categoria" class="text-[10px] font-black uppercase text-stone-600">Categoría *</label>
                    <select name="categoria" required class="w-full border border-stone-200 bg-stone-50 p-2 text-xs font-medium focus:outline-none focus:border-stone-900 rounded-none bg-white">
                    {#if data.categoriaRecurso}
                        {#each data.categoriaRecurso as cat}
                        <option value={cat}>{cat}</option>
                        {/each}
                    {/if}
                    </select>
                </div>

                <div class="space-y-1">
                    <label for="descripcion" class="text-[10px] font-black uppercase text-stone-600">Descripción</label>
                    <textarea name="descripcion" id="descripcion" class="w-full border border-stone-200 bg-stone-50 p-2 text-xs h-20 focus:outline-none focus:border-stone-900 rounded-none"></textarea>
                </div>

                <button type="submit" disabled={guardando} class="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold uppercase text-[10px] p-2.5 tracking-wide rounded-none disabled:opacity-50 transition-opacity">
                    {guardando ? 'REGISTRANDO ÍTEM...' : 'AGREGAR'}
                </button>
            </form>
        </div>

        <div class="lg:col-span-2 bg-white border border-stone-200 p-4 rounded-none space-y-4">

            <form onsubmit={ejecutarBusqueda} class="flex gap-2">
                <input
                    type="text"
                    bind:value={queryBusqueda}
                    placeholder="BUSCAR POR NOMBRE O CATEGORÍA..."
                    class="w-full border border-stone-200 bg-stone-50 p-2 text-xs uppercase focus:outline-none focus:border-stone-900 rounded-none"
                    />
                <button type="submit" class="bg-stone-900 text-white font-bold uppercase text-[10px] px-4 rounded-none">
                    Filtrar
                </button>
            </form>

            {#await Promise.all([data.streamed.recursos, data.streamed.total])}
            <div class="p-8 border border-stone-200 border-dashed text-center">
                <span class="text-[10px] font-black uppercase text-stone-400 tracking-widest animate-pulse">Sincronizando catálogo de recursos...</span>
            </div>
            {:then [recursos, total]}
            {#if recursos.length === 0}
            <div class="p-3 bg-stone-50 border border-stone-200 text-xs text-stone-500 italic">
                No se encontraron recursos registrados que coincidan con la búsqueda.
            </div>
            {:else}
            <table class="w-full border-collapse border border-stone-200 text-left">
                <thead>
                    <tr class="bg-stone-50 border-b border-stone-200">
                        <th class="p-2 text-[10px] font-black uppercase tracking-wider">Nombre del Ítem</th>
                        <th class="p-2 text-[10px] font-black uppercase tracking-wider">Categoría</th>
                        <th class="p-2 text-[10px] font-black uppercase tracking-wider">Descripción</th>
                    </tr>
                </thead>
                <tbody>
                    {#each recursos as r (r.id)}
                    <tr class="border-b border-stone-100 hover:bg-stone-50/60 transition-colors">
                        <td class="p-2 text-xs font-bold text-stone-900 uppercase tracking-tight">{r.nombre}</td>
                        <td class="p-2 text-xs font-mono">
                            <span class="text-[9px] font-black uppercase px-1.5 py-0.5 border border-stone-300 bg-stone-50">
                                {r.categoria}
                            </span>
                        </td>
                        <td class="p-2 text-xs text-stone-500 font-medium">{r.descripcion || '—'}</td>
                    </tr>
                    {/each}
                </tbody>
            </table>

            <div class="flex justify-between items-center pt-2 border-t border-stone-200 text-[10px] font-mono text-stone-500">
                <div>
                    MUESTRA: {recursos.length} de {total} ÍTEMS
                </div>
                <div class="flex gap-1">
                    <button
                        disabled={data.pagina === 1}
                        onclick={() => cambiarPagina(data.pagina - 1)}
                        class="px-2 py-1 border border-stone-200 uppercase font-bold text-[9px] bg-white text-stone-900 disabled:opacity-30 rounded-none"
                        >
                        Ant
                    </button>
                    <span class="px-3 py-1 bg-stone-900 text-white font-bold text-[9px]">
                        {data.pagina}
                    </span>
                    <button
                        disabled={data.pagina * data.limite >= total}
                        onclick={() => cambiarPagina(data.pagina + 1)}
                        class="px-2 py-1 border border-stone-200 uppercase font-bold text-[9px] bg-white text-stone-900 disabled:opacity-30 rounded-none"
                        >
                        Sig
                    </button>
                </div>
            </div>
            {/if}
            {:catch error}
            <div class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase rounded-none">
                ⚠️ Error al renderizar catálogo: {error.message}
            </div>
            {/await}
        </div>
    </div>
