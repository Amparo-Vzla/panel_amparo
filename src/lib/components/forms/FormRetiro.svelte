<script>
  import { enhance } from '$app/forms';

  // Svelte 5: Props recibidas desde el +page.svelte (el array ya resuelto)
  let { inventario = [] } = $props();

  // Estados reactivos internos
  let fase = $state('seleccion'); // 'seleccion' | 'cantidades'
  let metodoRetiro = $state('CONSUMO'); // Por defecto: CONSUMO o MAL ESTADO
  let seleccionados = $state({}); // { [recursoId]: boolean }
  let cantidadesARetirar = $state({}); // { [recursoId]: number }
  let cargandoGuardar = $state(false);

  // Lógica reactiva derivada ($derived)
  let puedeAvanzar = $derived(
    Object.values(seleccionados).some(v => v === true)
  );

  // Payload serializado reactivamente para el input hidden del formulario
  let payloadItems = $derived(
    inventario
      .filter(item => seleccionados[item.recursoId])
      .map(item => ({
        recursoId: item.recursoId,
        inventarioId: item.inventarioId,
        cantidad: cantidadesARetirar[item.recursoId] || 1
      }))
  );

  function irACantidades() {
    if (puedeAvanzar) fase = 'cantidades';
  }

  function regresarASeleccion() {
    fase = 'seleccion';
  }

  function manejarRespuesta() {
    cargandoGuardar = true;
    return async ({ result, update }) => {
      await update();
      cargandoGuardar = false;
      if (result.type === 'success') {
        fase = 'seleccion';
        seleccionados = {};
        cantidadesARetirar = {};
      }
    };
  }
</script>

<div class="border-b border-stone-200 pb-2 mb-3 flex justify-between items-center font-mono">
  <h2 class="text-[10px] font-black uppercase tracking-wider text-stone-900">
   RECOLECCIÓN / EGRESO DE INVENTARIO
  </h2>
  {#if fase === 'cantidades'}
    <button 
      type="button" 
      onclick={regresarASeleccion} 
      class="text-[10px] font-black uppercase text-blue-700 hover:underline"
    >
      ← VOLVER A SELECCIÓN
    </button>
  {/if}
</div>

{#if inventario.length === 0}
  <div class="p-3 bg-stone-50 border border-stone-200 text-stone-500 font-mono text-center text-xs rounded-none">
    NO HAY RECURSOS REGISTRADOS EN EL INVENTARIO DE ESTA ENTIDAD.
  </div>
{:else}

  {#if fase === 'seleccion'}
    <div class="space-y-3">
      <table class="w-full border-collapse text-left rounded-none">
        <thead>
          <tr class="bg-stone-50 border-b border-stone-200">
            <th class="p-2 text-[10px] font-black uppercase text-stone-600 font-mono w-8 text-center">SEL</th>
            <th class="p-2 text-[10px] font-black uppercase text-stone-600 font-mono">RECURSO</th>
            <th class="p-2 text-[10px] font-black uppercase text-stone-600 font-mono text-right w-24">STOCK</th>
          </tr>
        </thead>
        <tbody>
          {#each inventario as item}
            <tr class="border-b border-stone-100 hover:bg-stone-50 transition-colors">
              <td class="p-2 text-center align-middle">
                <input 
                  type="checkbox" 
                  bind:checked={seleccionados[item.recursoId]}
                  class="w-3.5 h-3.5 accent-stone-900 border-stone-300 rounded-none cursor-pointer"
                />
              </td>
              <td class="p-2 text-xs font-bold text-stone-900 uppercase font-mono">
                {item.nombre} <span class="text-[9px] font-normal text-stone-400">({item.categoria || 'S/C'})</span>
              </td>
              <td class="p-2 text-xs font-black text-right font-mono {item.stockActual === 0 ? 'text-red-600' : 'text-stone-900'}">
                {item.stockActual}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      <button
        type="button"
        onclick={irACantidades}
        disabled={!puedeAvanzar}
        class="w-full bg-stone-900 text-white py-2 text-xs font-bold uppercase rounded-none disabled:bg-stone-200 disabled:text-stone-400 transition cursor-pointer"
      >
        SIGUIENTE: ASIGNAR CANTIDADES →
      </button>
    </div>

  {:else if fase === 'cantidades'}
    <form method="POST" action="?/procesarRetiroMasivo" use:enhance={manejarRespuesta} class="space-y-3">
      
      <div class="bg-stone-50 p-2 border border-stone-200 space-y-1">
        <label for="metodo" class="text-[10px] font-black uppercase text-stone-600 font-mono block">
          MOTIVO DEL RETIRO:
        </label>
        <select
          id="metodo"
          name="metodo"
          bind:value={metodoRetiro}
          class="w-full border border-stone-300 bg-white p-1 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-stone-900 rounded-none uppercase"
        >
          <option value="CONSUMO">CONSUMO</option>
          <option value="MAL ESTADO">MAL ESTADO / VENCIDO / DAÑADO</option>
        </select>
      </div>

      <input type="hidden" name="items" value={JSON.stringify(payloadItems)} />

      <table class="w-full border-collapse text-left rounded-none">
        <thead>
          <tr class="bg-stone-50 border-b border-stone-200">
            <th class="p-2 text-[10px] font-black uppercase text-stone-600 font-mono">RECURSO</th>
            <th class="p-2 text-[10px] font-black uppercase text-stone-600 font-mono text-right w-20">DISP.</th>
            <th class="p-2 text-[10px] font-black uppercase text-stone-600 font-mono text-center w-24">CANTIDAD</th>
          </tr>
        </thead>
        <tbody>
          {#each inventario.filter(item => seleccionados[item.recursoId]) as item}
            <tr class="border-b border-stone-100 bg-white">
              <td class="p-2 text-xs font-bold text-stone-900 uppercase font-mono">
                {item.nombre}
              </td>
              <td class="p-2 text-xs font-bold text-right font-mono text-stone-400">
                {item.stockActual}
              </td>
              <td class="p-1 align-middle">
                <input
                  type="number"
                  min="1"
                  max={item.stockActual}
                  required
                  placeholder="0"
                  bind:value={cantidadesARetirar[item.recursoId]}
                  class="w-full border border-stone-200 bg-stone-50 p-1 text-xs font-black text-center text-stone-900 focus:outline-none focus:bg-white focus:border-stone-900 rounded-none font-mono"
                />
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      <button
        type="submit"
        disabled={cargandoGuardar}
        class="w-full bg-stone-900 text-white py-2 text-xs font-bold uppercase rounded-none disabled:bg-stone-200 disabled:text-stone-400 transition cursor-pointer"
      >
        {cargandoGuardar ? 'PROCESANDO SALIDA...' : 'CONFIRMAR Y ASENTAR RETIRO'}
      </button>
    </form>
  {/if}

{/if}