<script>
  let { data } = $props();
  import Header from '$lib/components/Header.svelte';

  let busqueda = $state('');

  function agruparPorLote(lista) {
    const mapaLotes = {};
    lista.forEach(item => {
      const clave = item.lote;
      if (!mapaLotes[clave]) {
        mapaLotes[clave] = {
          lote: item.lote,
          createdAt: item.createdAt,
          solicitanteCod: item.solicitanteCod,
          solicitanteTipo: item.solicitanteTipo,
          descripcion: item.descripcion,
          articulos: []
        };
      }
      mapaLotes[clave].articulos.push({
        id: item.id,
        nombre: item.recursoNombre,
        cantidad: item.cantidad,
        categoria: item.recursoCategoria
      });
    });
    return Object.values(mapaLotes);
  }

  function formatearFecha(fechaStr) {
    if (!fechaStr) return '';
    const d = new Date(fechaStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
</script>

<Header 
titulo="Despachos y Envíos"
descripcion="Asignación de transporte para recursos en proceso"
info=""
// error={form?.erro}
// exito={form?.exito}
/>

  <div class="max-w-7xl mx-auto space-y-4">


      <input 
        type="text" 
        bind:value={busqueda} 
        placeholder="FILTRAR POR LOTE O DESTINO..." 
        class="border border-stone-200 bg-white p-1.5 text-[10px] font-mono rounded-none focus:outline-none focus:border-stone-900 uppercase w-full sm:w-64 placeholder:text-stone-300"
      />
    </div>

    <div class="border border-stone-200 bg-white rounded-none overflow-hidden">
      {#await data.solicitudesPorDespachar}
        <div class="p-16 text-center text-[10px] font-black uppercase text-stone-400 tracking-widest font-mono animate-pulse">
          Analizando manifiestos y requerimientos de carga...
        </div>
      {:then listaCompleta}
        {@const lotesAgrupados = agruparPorLote(listaCompleta)}
        {@const lotesFiltrados = lotesAgrupados.filter(l => {
          if (busqueda.trim() !== '') {
            const query = busqueda.toLowerCase();
            return l.lote.toString().includes(query) || l.solicitanteCod?.toLowerCase().includes(query);
          }
          return true;
        })}

        {#if lotesFiltrados.length === 0}
          <div class="p-12 text-center bg-stone-50/50">
            <p class="text-[10px] font-black uppercase text-stone-400 font-mono tracking-wider">No existen lotes retenidos en proceso de despacho</p>
          </div>
        {:else}
          <div class="overflow-x-auto w-full">
            <table class="w-full border-collapse text-left">
              <thead>
                <tr class="bg-stone-50 border-b border-stone-200">
                  <th class="p-2 text-[10px] font-black uppercase text-stone-700 font-mono w-24">Lote ID</th>
                  <th class="p-2 text-[10px] font-black uppercase text-stone-700 w-48">Entidad Destino</th>
                  <th class="p-2 text-[10px] font-black uppercase text-stone-700">Manifiesto de Carga (Artículos)</th>
                  <th class="p-2 text-[10px] font-black uppercase text-stone-700 w-28 font-mono text-right">Aceptado</th>
                  <th class="p-2 text-[10px] font-black uppercase text-stone-700 text-center w-24">Acción</th>
                </tr>
              </thead>
              <tbody>
                {#each lotesFiltrados as lote}
                  <tr class="border-b border-stone-100 hover:bg-stone-50/50 transition-colors vertical-top align-top">
                    
                    <td class="p-2 font-mono text-[11px] text-stone-900 font-bold bg-stone-50/30">
                      #{lote.lote}
                    </td>
                    
                    <td class="p-2 uppercase">
                      <span class="text-stone-900 font-black block text-[11px] leading-tight">{lote.solicitanteCod}</span>
                      <span class="text-[9px] text-stone-400 block tracking-tight mt-0.5">{lote.solicitanteTipo}</span>
                    </td>
                    
                    <td class="p-2">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {#each lote.articulos as art}
                          <div class="flex items-center justify-between p-1 px-2 border border-stone-200 bg-stone-50/40 text-[11px]">
                            <span class="font-bold text-stone-800 uppercase truncate pr-2">{art.nombre}</span>
                            <span class="font-mono text-[10px] bg-white border border-stone-200 px-1 font-black text-stone-900">
                              X{art.cantidad}
                            </span>
                          </div>
                        {/each}
                      </div>
                      {#if lote.descripcion}
                        <p class="text-[9px] font-mono text-stone-400 uppercase mt-1.5 italic">Nota: "{lote.descripcion}"</p>
                      {/if}
                    </td>
                    
                    <td class="p-2 font-mono text-[10px] text-stone-500 text-right uppercase">
                      {formatearFecha(lote.createdAt)}
                    </td>
                    
                    <td class="p-2 text-center align-middle">
                      <button 
                        class="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold uppercase text-[10px] py-1 px-2 rounded-none tracking-tight transition-all"
                      >
                        Asignar
                      </button>
                    </td>

                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      {/await}
    </div>
