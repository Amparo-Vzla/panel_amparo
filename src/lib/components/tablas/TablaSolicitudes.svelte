<script>
  import FichaSolicitud from "../FichaSolicitud.svelte";

  let { data } = $props();

  let tabActivo = $state('GLOBALES');
  let busqueda = $state('');
  let loteSeleccionado = $state(null);

  function agruparPorLote(lista) {
    const mapaLotes = {};
    
    lista.forEach(item => {
      // Clave compuesta para separar el mismo lote en filas distintas según su estatus
      const clave = `${item.lote}-${item.estatus}`;
      
      if (!mapaLotes[clave]) {
        mapaLotes[clave] = {
          lote: item.lote,
          estatus: item.estatus,
          createdAt: item.createdAt,
          solicitanteCod: item.solicitanteCod,
          solicitanteTipo: item.solicitanteTipo,
          solicitanteId: item.solicitanteId,
          descripcion: item.descripcion,
          articulos: []
        };
      }
      mapaLotes[clave].articulos.push({
        id: item.id,
        nombre: item.recursoNombre,
        cantidad: item.cantidad,
        categoria: item.recursoCategoria,
        remitenteCod: item.remitenteCod
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

<div class="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-stone-200 bg-white">
  <div class="lg:col-span-2 border-r border-stone-200">
    <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center border-b border-stone-200 bg-stone-50 p-1 gap-2">
      <div class="flex gap-0.5">
        {#each ['GLOBALES', 'MIS_SOLICITUDES', 'FINALIZADAS'] as tab}
          <button 
            onclick={() => tabActivo = tab} 
            class="px-3 py-1 text-[10px] font-black uppercase rounded-none tracking-tight transition-all {tabActivo === tab ? 'bg-white border border-stone-200 text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}"
          >
            {tab.replace('_', ' ')}
          </button>
        {/each}
      </div>

      <input 
        type="text" 
        bind:value={busqueda} 
        placeholder="FILTRAR POR LOTE o ENTIDAD..." 
        class="border border-stone-200 bg-white p-1 text-[10px] font-mono rounded-none focus:outline-none focus:border-stone-900 uppercase w-full sm:w-48 placeholder:text-stone-300"
      />
    </div>

    {#await data.solicitudes}
      <div class="p-12 text-center text-[10px] font-black uppercase text-stone-400 tracking-widest font-mono animate-pulse">
        Sincronizando registros con la base de datos...
      </div>
    {:then listaCompleta}
      {@const lotesAgrupados = agruparPorLote(listaCompleta)}
      {@const solicitudesFiltradas = lotesAgrupados.filter(s => {
        if (tabActivo === 'GLOBALES') {
          if (s.solicitanteId === data.miEntidadId || s.estatus !== 'PENDIENTE') return false;
        } else if (tabActivo === 'MIS_SOLICITUDES') {
          // Valida que sea mi solicitud y que esté activa (Tanto Pendiente como En Proceso)
          if (s.solicitanteId !== data.miEntidadId) return false;
          if (s.estatus !== 'PENDIENTE' && s.estatus !== 'EN PROCESO') return false;
        } else if (tabActivo === 'FINALIZADAS') {
          if (s.estatus !== 'ENTREGADO' && s.estatus !== 'RECHAZADO') return false;
        }

        if (busqueda.trim() !== '') {
          const query = busqueda.toLowerCase();
          return s.lote.toString().includes(query) || s.solicitanteCod?.toLowerCase().includes(query);
        }
        return true;
      })}

      {#if solicitudesFiltradas.length === 0}
        <div class="p-10 text-center bg-stone-50/50">
          <p class="text-[10px] font-black uppercase text-stone-400 font-mono">No hay lotes en este segmento</p>
        </div>
      {:else}
        <div class="overflow-x-auto w-full">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="bg-stone-50 border-b border-stone-200">
                <th class="p-2 text-[10px] font-black uppercase text-stone-700 font-mono w-24">Lote ID</th>
                <th class="p-2 text-[10px] font-black uppercase text-stone-700">Entidad Emisora</th>
                <th class="p-2 text-[10px] font-black uppercase text-stone-700 w-24 font-mono">Registro</th>
                <th class="p-2 text-[10px] font-black uppercase text-stone-700 text-right w-20">Estatus</th>
              </tr>
            </thead>
            <tbody>
              {#each solicitudesFiltradas as lote}
                <tr 
                  onclick={() => loteSeleccionado = lote}
                  class="border-b border-stone-100 hover:bg-stone-50/60 transition-colors cursor-pointer {loteSeleccionado?.lote === lote.lote && loteSeleccionado?.estatus === lote.estatus ? 'bg-stone-50 border-l-2 border-l-stone-900' : ''}"
                >
                  <td class="p-2 font-mono text-[11px] text-stone-900 font-bold">#{lote.lote}</td>
                  <td class="p-2 text-stone-600 uppercase text-xs">
                    <span class="text-stone-900 font-black block text-[11px]">{lote.solicitanteCod}</span>
                    <span class="text-[9px] text-stone-400 block tracking-tight">{lote.solicitanteTipo}</span>
                  </td>
                  <td class="p-2 font-mono text-[10px] text-stone-500">{formatearFecha(lote.createdAt)}</td>
                  <td class="p-2 text-right">
                    <span class="inline-block px-1.5 py-0.5 text-[9px] font-black uppercase rounded-none tracking-wide
                      {lote.estatus === 'PENDIENTE' ? 'bg-amber-50 text-amber-800 border border-amber-200' : ''}
                      {lote.estatus === 'EN PROCESO' ? 'bg-blue-50 text-blue-800 border border-blue-200' : ''}
                      {lote.estatus === 'ENTREGADO' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : ''}
                      {lote.estatus === 'RECHAZADO' ? 'bg-red-50 text-red-800 border border-red-200' : ''}
                    ">
                      {lote.estatus}
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {/await}
  </div>

  <div class="bg-stone-50/30 p-2">
    <FichaSolicitud lote={loteSeleccionado} miEntidadId={data.miEntidadId} />
  </div>
</div>