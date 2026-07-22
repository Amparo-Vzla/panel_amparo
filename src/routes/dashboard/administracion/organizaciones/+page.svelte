<script>
    import { enhance } from '$app/forms';
    import Header from '$lib/components/Header.svelte';

    let { data, form } = $props();

    // Estado de navegación reactivo
    let vistaActiva = $state('PENDIENTES');
    let busqueda = $state('');
    let paginaActual = $state(1);
    const itemsPorPagina = 10;

    // Modales
    let entidadParaVer = $state(null);
    let reporteParaVer = $state(null);

    const categorias = ['PENDIENTES', 'INSUMOS', 'REPORTES'];
</script>

{#snippet modalEntidad(ent)}
    <div class="space-y-4 text-xs">
        <div class="grid grid-cols-2 gap-4">
            <div><label class="text-[9px] font-black text-stone-500 uppercase">Código</label><p class="font-mono">{ent.codigo}</p></div>
            <div><label class="text-[9px] font-black text-stone-500 uppercase">Tipo</label><p class="uppercase">{ent.tipo}</p></div>
        </div>
        <div><label class="text-[9px] font-black text-stone-500 uppercase">Nombre</label><p class="text-sm font-black uppercase">{ent.nombre}</p></div>
        <div><label class="text-[9px] font-black text-stone-500 uppercase">Ubicación</label><p class="uppercase">{ent.estado}, {ent.municipio}, {ent.localidad}</p></div>
        <div><label class="text-[9px] font-black text-stone-500 uppercase">Dirección</label><p class="text-stone-600 uppercase">{ent.direccionExacta}</p></div>
        <div><label class="text-[9px] font-black text-stone-500 uppercase">Contacto</label><p>{ent.telefonoPrincipal} | {ent.emailContacto || 'SIN CORREO'}</p></div>
    </div>
{/snippet}

{#snippet modalReporte(rep)}
    <div class="space-y-4 text-xs">
        <p class="text-[9px] font-black uppercase text-stone-500">Autor: {rep.creadorNombre ? `${rep.creadorNombre} ${rep.creadorApellido || ''}` : 'Anónimo'}</p>
        <div class="p-3 bg-stone-50 border border-stone-200">
            <p class="leading-relaxed text-stone-800 uppercase">{rep.descripcion}</p>
        </div>
    </div>
{/snippet}

<Header titulo="CENTROS, EQUIPOS Y REPORTES DE AYUDA" 
descripcion="Gestión de centros de insumos y reportes globales" 
info=""
    error={form?.error}
    exito={form?.exito}
    />


<div class="space-y-4">
    <div class="flex flex-wrap gap-1">
        {#each categorias as cat}
            <button 
                onclick={() => { vistaActiva = cat; paginaActual = 1; }} 
                class="px-4 py-2 border text-[10px] font-black uppercase tracking-wide transition rounded-none {vistaActiva === cat ? 'bg-stone-900 text-white border-stone-900' : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'}">
                {cat}
            </button>
        {/each}
    </div>

    <input type="text" bind:value={busqueda} placeholder="FILTRAR REGISTROS..." class="w-full px-3 py-2 border border-stone-200 text-xs font-bold uppercase focus:outline-none focus:border-stone-400 rounded-none bg-stone-50" />

    {#await Promise.all([data.streamed.entidades, data.streamed.reportes])}
        <div class="p-12 border border-stone-200 border-dashed text-center text-[10px] font-black text-stone-400 uppercase tracking-widest animate-pulse">
            Sincronizando registros con la base de datos...
        </div>
    {:then [entidades, reportes]}
        {@const itemsFiltrados = (() => {
            if (vistaActiva === 'REPORTES') {
                return reportes.filter(r => 
                    r.id.toLowerCase().includes(busqueda.toLowerCase()) || 
                    (r.creadorNombre && r.creadorNombre.toLowerCase().includes(busqueda.toLowerCase()))
                );
            }
            let lista = entidades;
            if (vistaActiva === 'PENDIENTES') {
                lista = lista.filter(e => !e.verificado);
            } else {
                lista = lista.filter(e => e.tipo.toUpperCase() === vistaActiva);
            }
            if (busqueda) {
                const b = busqueda.toLowerCase();
                lista = lista.filter(e => e.nombre.toLowerCase().includes(b) || e.codigo.toLowerCase().includes(b));
            }
            return lista;
        })()}

        {@const totalPaginas = Math.ceil(itemsFiltrados.length / itemsPorPagina) || 1}
        {@const itemsVisibles = itemsFiltrados.slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina)}

        <div class="border border-stone-200 bg-white rounded-none">
            <table class="w-full text-left border-collapse">
                <thead class="bg-stone-50 border-b border-stone-200 text-[10px] font-black text-stone-600 uppercase tracking-wider">
                    <tr>
                        <th class="p-3">{vistaActiva === 'REPORTES' ? 'CODIGO' : 'Organización'}</th>
                        <th class="p-3">{vistaActiva === 'REPORTES' ? 'Autor' : 'UBICACION'}</th>
                        <th class="p-3 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-stone-100 text-xs uppercase font-medium">
                    {#each itemsVisibles as item}
                        <tr class="hover:bg-stone-50/60 transition">
                            <td class="p-3 font-bold text-stone-900">{vistaActiva === 'REPORTES' ? item.id.slice(0,8) : item.nombre}</td>
                            <td class="p-3 text-stone-600">{vistaActiva === 'REPORTES' ? (item.creadorNombre || 'Anónimo') : `${item.estado} / ${item.municipio}`}</td>
                            <td class="p-3 text-right flex justify-end gap-3 items-center">
                                <button onclick={() => vistaActiva !== 'REPORTES' ? entidadParaVer = item : reporteParaVer = item} class="text-blue-700 font-bold hover:underline uppercase text-[10px]">Ver más</button>
                                {#if vistaActiva !== 'REPORTES' && !item.verificado}
                                    <form method="POST" action="?/verificar" use:enhance class="inline">
                                        <input type="hidden" name="id" value={item.id} />
                                        <button type="submit" class="text-emerald-700 font-bold hover:underline uppercase text-[10px]">Verificar</button>
                                    </form>
                                    <form method="POST" action="?/rechazar" use:enhance class="inline">
                                        <input type="hidden" name="id" value={item.id} />
                                        <button type="submit" onclick={(e) => !confirm('¿CONFIRMA RECHAZAR Y ELIMINAR ESTA SOLICITUD?') && e.preventDefault()} class="text-red-700 font-bold hover:underline uppercase text-[10px]">Rechazar</button>
                                    </form>
                                {/if}
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="3" class="p-6 text-center text-stone-400 text-[10px] font-black uppercase tracking-widest">Sin registros en esta sección</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="flex justify-between items-center text-[10px] font-mono text-stone-500 pt-2">
            <span>PÁGINA {paginaActual} DE {totalPaginas} ({itemsFiltrados.length} REGISTROS)</span>
            <div class="flex gap-1">
                <button disabled={paginaActual === 1} onclick={() => paginaActual--} class="px-3 py-1 border border-stone-200 bg-white hover:bg-stone-50 text-stone-900 disabled:opacity-30 rounded-none font-bold uppercase text-[9px]">Anterior</button>
                <button disabled={paginaActual >= totalPaginas} onclick={() => paginaActual++} class="px-3 py-1 border border-stone-200 bg-white hover:bg-stone-50 text-stone-900 disabled:opacity-30 rounded-none font-bold uppercase text-[9px]">Siguiente</button>
            </div>
        </div>
    {:catch error}
        <div class="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase rounded-none">
            ⚠️ Fallo crítico en el renderizado: {error.message}
        </div>
    {/await}
</div>

{#if entidadParaVer}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
        <div class="bg-white p-5 w-full max-w-md border border-stone-200 shadow-2xl rounded-none">
            <h2 class="font-black uppercase mb-4 border-b border-stone-200 pb-2 text-[10px] tracking-wider text-stone-500">Ficha Técnica de Organización</h2>
            {@render modalEntidad(entidadParaVer)}
            <button onclick={() => entidadParaVer = null} class="mt-5 w-full bg-stone-900 text-white py-2.5 uppercase font-black text-[10px] tracking-wide hover:bg-stone-800 transition rounded-none">Cerrar Monitor</button>
        </div>
    </div>
{/if}

{#if reporteParaVer}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
        <div class="bg-white p-5 w-full max-w-md border border-stone-200 shadow-2xl rounded-none">
            <h2 class="font-black uppercase mb-4 border-b border-stone-200 pb-2 text-[10px] tracking-wider text-stone-500">Incidencia / Reporte de Comunidad</h2>
            {@render modalReporte(reporteParaVer)}
            <button onclick={() => reporteParaVer = null} class="mt-5 w-full bg-stone-900 text-white py-2.5 uppercase font-black text-[10px] tracking-wide hover:bg-stone-800 transition rounded-none">Cerrar Monitor</button>
        </div>
    </div>
{/if}