<script>
  import Header from "$lib/components/Header.svelte";

  let { data } = $props();

  let tabActivo = $state('DISPONIBLES');
  let busqueda = $state('');

  // Agrupa las solicitudes por lote para que el transportista vea el viaje consolidado
  function agruparPorLote(lista) {
    const mapaLotes = {};
    
    lista.forEach(item => {
      const clave = item.lote;
      if (!mapaLotes[clave]) {
        mapaLotes[clave] = {
          lote: item.lote,
          createdAt: item.createdAt,
          origenCod: item.origenCod,
          origenTipo: item.origenTipo,
          destinoCod: item.destinoCod,
          destinoTipo: item.destinoTipo,
          descripcion: item.descripcion,
          articulos: []
        };
      }
      mapaLotes[clave].articulos.push({
        id: item.id,
        codigo: item.codigo,
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
    titulo="Encomiendas de Recursos"
    descripcion=""
    info=""/>

  <div class="max-w-7xl mx-auto space-y-4">
    
    <div class="flex flex-col md:flex-row justify-between items-stretch md:items-center border border-stone-200 bg-white p-3 gap-2 rounded-none">


      <div class="flex flex-col sm:flex-row gap-1">
        <div class="flex bg-stone-50 border border-stone-200 p-0.5">
          <button 
            onclick={() => tabActivo = 'DISPONIBLES'} 
            class="px-3 py-1 text-[10px] font-black uppercase rounded-none tracking-tight transition-all {tabActivo === 'DISPONIBLES' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'}"
          >
            Disponibles
          </button>
          <button 
            onclick={() => tabActivo = 'MIS_VIAJES'} 
            class="px-3 py-1 text-[10px] font-black uppercase rounded-none tracking-tight transition-all {tabActivo === 'MIS_VIAJES' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'}"
          >
            Mis Viajes
          </button>
        </div>

        <input 
          type="text" 
          bind:value={busqueda} 
          placeholder="FILTRAR ORIGEN / DESTINO / LOTE..." 
          class="border border-stone-200 bg-white p-1.5 text-[10px] font-mono rounded-none focus:outline-none focus:border-stone-900 uppercase placeholder:text-stone-300 w-full sm:w-56"
        />
      </div>
    </div>

    <div class="border border-stone-200 bg-white rounded-none overflow-hidden">
      {#if tabActivo === 'DISPONIBLES'}
        {#await data.encomiendasDisponibles}
          <div class="p-16 text-center text-[10px] font-black uppercase text-stone-400 tracking-widest font-mono">
            Cargando solicitudes sin envío asignado...
          </div>
        {:then listaCompleta}
          {@const lotesAgrupados = agruparPorLote(listaCompleta)}
          {@const lotesFiltrados = lotesAgrupados.filter(l => {
            if (busqueda.trim() !== '') {
              const query = busqueda.toLowerCase();
              return l.lote.toString().includes(query) || 
                     l.origenCod?.toLowerCase().includes(query) || 
                     l.destinoCod?.toLowerCase().includes(query);
            }
            return true;
          })}

          {#if lotesFiltrados.length === 0}
            <div class="p-12 text-center bg-stone-50/50">
              <p class="text-[10px] font-black uppercase text-stone-400 font-mono tracking-wider">No hay solicitudes en proceso esperando asignación de envío</p>
            </div>
          {:else}
            <div class="overflow-x-auto w-full">
              <table class="w-full border-collapse text-left">
                <thead>
                  <tr class="bg-stone-50 border-b border-stone-200">
                    <th class="p-2 text-[10px] font-black uppercase text-stone-700 font-mono w-20">Lote</th>
                    <th class="p-2 text-[10px] font-black uppercase text-stone-700 w-40">Origen (Remitente)</th>
                    <th class="p-2 text-[10px] font-black uppercase text-stone-700 w-40">Destino (Solicitante)</th>
                    <th class="p-2 text-[10px] font-black uppercase text-stone-700">Artículos Solicitados</th>
                    <th class="p-2 text-[10px] font-black uppercase text-stone-700 text-center w-24">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {#each lotesFiltrados as lote}
                    <tr class="border-b border-stone-100 hover:bg-stone-50/40 transition-colors align-top">
                      
                      <td class="p-2 font-mono text-[11px] text-stone-900 font-bold bg-stone-50/20">
                        #{lote.lote}
                        <span class="block text-[8px] text-stone-400 font-normal mt-1">{formatearFecha(lote.createdAt)}</span>
                      </td>
                      
                      <td class="p-2 uppercase">
                        <span class="text-stone-900 font-black block text-[11px] leading-tight">{lote.origenCod}</span>
                        <span class="text-[8px] text-stone-400 font-mono tracking-tight block mt-0.5">{lote.origenTipo}</span>
                      </td>

                      <td class="p-2 uppercase">
                        <span class="text-stone-900 font-black block text-[11px] leading-tight">{lote.destinoCod}</span>
                        <span class="text-[8px] text-stone-400 font-mono tracking-tight block mt-0.5">{lote.destinoTipo}</span>
                      </td>
                      
                      <td class="p-2">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {#each lote.articulos as art}
                            <div class="flex items-center justify-between p-1 px-2 border border-stone-200 bg-stone-50/30 text-[10px]">
                              <div class="truncate pr-2">
                                <span class="font-black text-stone-900 uppercase block">{art.nombre}</span>
                                <span class="text-[8px] font-mono text-stone-400 block">{art.codigo}</span>
                              </div>
                              <span class="font-mono text-[10px] font-black text-stone-900 bg-white border border-stone-200 px-1">
                                X{art.cantidad}
                              </span>
                            </div>
                          {/each}
                        </div>
                        {#if lote.descripcion}
                          <p class="text-[9px] font-mono text-stone-400 uppercase mt-1 italic">Nota: "{lote.descripcion}"</p>
                        {/if}
                      </td>
                      
                      <td class="p-2 text-center align-middle">
                        <button 
                          class="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold uppercase text-[10px] py-1.5 px-2 rounded-none tracking-tight transition-all"
                        >
                          Aceptar
                        </button>
                      </td>

                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        {/await}
      {:else}
        <div class="p-12 text-center bg-stone-50/50">
          <p class="text-[10px] font-black uppercase text-stone-400 font-mono tracking-wider">Lógica e historial de envíos aceptados en desarrollo...</p>
        </div>
      {/if}
    </div>

  </div>