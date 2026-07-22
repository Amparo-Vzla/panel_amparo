<script>
  import { enhance } from '$app/forms';

  let { lote = null, miEntidadId } = $props();

  let modoRespuesta = $state(false);
  let itemsSeleccionados = $state([]);

  $effect(() => {
    if (lote) {
      modoRespuesta = false;
      itemsSeleccionados = [];
    }
  });

  function toggleSeleccion(id) {
    if (itemsSeleccionados.includes(id)) {
      itemsSeleccionados = itemsSeleccionados.filter(i => i !== id);
    } else {
      itemsSeleccionados.push(id);
    }
  }

  function formatearFechaCompleta(fechaStr) {
    if (!fechaStr) return '';
    return new Date(fechaStr).toLocaleString('es-VE', { hour12: false }).toUpperCase();
  }
</script>

{#if !lote}
  <div class="h-full flex items-center justify-center p-6 border border-dashed border-stone-200">
    <span class="text-[10px] font-black uppercase text-stone-400 font-mono tracking-wider text-center">
      Seleccione un lote para desplegar ficha analítica
    </span>
  </div>
{:else}
  <div class="space-y-4 text-xs">
    <div class="border-b border-stone-200 pb-2">
      <div class="flex items-center justify-between">
        <span class="text-[9px] font-black uppercase px-1.5 py-0.5 border
          {lote.estatus === 'PENDIENTE' ? 'bg-amber-50 text-amber-800 border-amber-200' : ''}
          {lote.estatus === 'EN PROCESO' ? 'bg-blue-50 text-blue-800 border-blue-200' : ''}
          {lote.estatus === 'ENTREGADO' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : ''}
          {lote.estatus === 'RECHAZADO' ? 'bg-red-50 text-red-800 border-red-200' : ''}
        ">
          {lote.estatus}
        </span>
      </div>
      <h3 class="text-xs font-black text-stone-900 font-mono mt-1">LOTE ID: #{lote.lote}</h3>
      <div class="mt-2 text-[10px] font-mono text-stone-500">
        REGISTRO: {formatearFechaCompleta(lote.createdAt)}
      </div>
      <div class="mt-1">
        <span class="text-stone-400 text-[9px] font-black block uppercase">Solicitante:</span>
        <span class="text-stone-900 font-black uppercase text-[11px]">{lote.solicitanteCod}</span>
      </div>
    </div>

    {#if lote.solicitanteId !== miEntidadId}
      <form action="?/responderItems" method="POST" use:enhance={() => {
        return async ({ update }) => {
          modoRespuesta = false;
          itemsSeleccionados = [];
          await update();
        };
      }} class="space-y-4">
        <div class="space-y-1">
          <span class="block text-[10px] font-black uppercase text-stone-700">Artículos Solicitados</span>
          <div class="space-y-1">
            {#each lote.articulos as art}
              <label class="flex items-center justify-between p-2 border border-stone-200 bg-white rounded-none {modoRespuesta ? 'cursor-pointer hover:bg-stone-50' : ''}">
                <div class="flex items-center gap-2">
                  {#if modoRespuesta}
                    <input 
                      type="checkbox" 
                      name="itemIds" 
                      value={art.id} 
                      checked={itemsSeleccionados.includes(art.id)}
                      onchange={() => toggleSeleccion(art.id)}
                      class="w-3 h-3 text-stone-900 rounded-none border-stone-300 focus:ring-0 accent-stone-900"
                    />
                  {/if}
                  <div>
                    <span class="text-[11px] text-stone-900 font-bold block uppercase leading-tight">{art.nombre}</span>
                    <span class="text-[8px] text-stone-400 font-mono block uppercase">{art.categoria}</span>
                    {#if art.remitenteCod}
                      <span class="text-[9px] text-blue-700 font-bold block uppercase mt-0.5">Remitente: {art.remitenteCod}</span>
                    {/if}
                  </div>
                </div>
                <span class="font-mono font-black text-[11px] text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded-none">
                  X{art.cantidad}
                </span>
              </label>
            {/each}
          </div>
        </div>

        <div class="pt-2">
          {#if !modoRespuesta}
            <button 
              type="button" 
              onclick={() => modoRespuesta = true} 
              class="w-full bg-stone-900 text-white font-bold uppercase text-xs py-2 rounded-none hover:bg-stone-800 transition-colors"
            >
              Responder Solicitud
            </button>
          {:else}
            <div class="grid grid-cols-2 gap-1">
              <button 
                type="button" 
                onclick={() => { modoRespuesta = false; itemsSeleccionados = []; }} 
                class="bg-stone-200 text-stone-700 font-bold uppercase text-xs py-2 rounded-none hover:bg-stone-300 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={itemsSeleccionados.length === 0} 
                class="bg-blue-700 text-white font-bold uppercase text-xs py-2 rounded-none hover:bg-blue-800 transition-colors disabled:opacity-40"
              >
                Confirmar Respuesta
              </button>
            </div>
          {/if}
        </div>
      </form>
    {:else}
      <div class="space-y-4">
        <div class="space-y-1">
          <span class="block text-[10px] font-black uppercase text-stone-700">Artículos Solicitados</span>
          <div class="space-y-1">
            {#each lote.articulos as art}
              <div class="flex items-center justify-between p-2 border border-stone-200 bg-white rounded-none">
                <div>
                  <span class="text-[11px] text-stone-900 font-bold block uppercase leading-tight">{art.nombre}</span>
                  <span class="text-[8px] text-stone-400 font-mono block uppercase">{art.categoria}</span>
                  {#if art.remitenteCod}
                    <span class="text-[9px] text-blue-700 font-bold block uppercase mt-0.5">Remitente: {art.remitenteCod}</span>
                  {/if}
                </div>
                <span class="font-mono font-black text-[11px] text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded-none">
                  X{art.cantidad}
                </span>
              </div>
            {/each}
          </div>
        </div>

        {#if lote.estatus === 'PENDIENTE' || lote.estatus === 'EN PROCESO'}
          <div class="pt-2 border-t border-stone-200">
            <form action="?/cancelarLote" method="POST" use:enhance>
              <input type="hidden" name="lote" value={lote.lote} />
              <button 
                type="submit" 
                class="w-full bg-stone-900 text-white font-bold uppercase text-xs py-2 rounded-none hover:bg-red-700 transition-colors"
              >
                Cancelar Solicitud
              </button>
            </form>
          </div>
        {/if}
      </div>
    {/if}

    {#if lote.descripcion}
      <div class="space-y-1 pt-2">
        <span class="block text-[9px] font-black text-stone-400 uppercase">Observaciones generales</span>
        <div class="p-2 border border-stone-200 bg-stone-50 text-[11px] text-stone-700 font-mono uppercase">
          "{lote.descripcion}"
        </div>
      </div>
    {/if}
  </div>
{/if}