<script>
    import { enhance } from '$app/forms';
    let { data, form } = $props();

    let isOpen = $state(false);
    let filas = $state([{ categoria: '', recursoId: '', cantidad: 1 }]);

    function agregarFila() { filas.push({ categoria: '', recursoId: '', cantidad: 1 }); }
    function removerFila(i) { if (filas.length > 1) filas.splice(i, 1); }
    
    function reset() {
        filas = [{ categoria: '', recursoId: '', cantidad: 1 }];
        isOpen = false;
    }
</script>

<button 
    type="button" 
    onclick={() => isOpen = true}
    class="w-full bg-stone-900 text-white font-bold uppercase text-xs p-3 rounded-none hover:bg-black transition-colors"
>
    Crear Nueva Solicitud de Recursos
</button>

{#if isOpen}
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
    <div class="bg-white w-full max-w-xl border border-stone-200 shadow-2xl rounded-none flex flex-col max-h-[90vh]">
        
        <div class="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
            <h3 class="text-[10px] font-black uppercase tracking-wider text-stone-900 font-mono">Formulario de Creacion de Solicitud</h3>
            <button onclick={reset} class="text-stone-400 hover:text-stone-900 text-xs font-bold">✕</button>
        </div>

        <form 
            method="POST" 
            action="?/crearSolicitudAgrupada" 
            use:enhance={() => {
                return async ({ result, update }) => {
                    await update();
                    if (result.type === 'success') reset();
                };
            }} 
            class="p-4 overflow-y-auto space-y-4"
        >
            {#await data.recursos}
                <p class="text-[10px] font-mono animate-pulse">Sincronizando...</p>
            {:then listaRecursos}
                <div class="space-y-3">
                    {#each filas as fila, i}
                    <div class="p-2 bg-stone-50 border border-stone-200 space-y-2 relative">
                        {#if filas.length > 1}
                            <button type="button" onclick={() => removerFila(i)} class="absolute top-1 right-1 bg-stone-900 text-white text-[10px] w-5 h-5 flex items-center justify-center">-</button>
                        {/if}

                        <select bind:value={fila.categoria} onclick={() => fila.recursoId = ''} required>
                            {#if data.categoriaRecurso}
                            {#each data.categoriaRecurso as cat}
                                <option value={cat}>{cat}</option>
                            {/each}
                            {/if}
                        </select>

                        <div class="flex gap-1">
                            <select name="recursoId" bind:value={fila.recursoId} disabled={!fila.categoria} required class="flex-1 border border-stone-200 p-1 text-xs uppercase rounded-none font-mono">
                                <option value="">INSUMO...</option>
                                {#each listaRecursos.filter(r => r.categoria === fila.categoria) as r}
                                    <option value={r.id}>{r.nombre}</option>
                                {/each}
                            </select>
                            <input type="number" name="cantidad" bind:value={fila.cantidad} min="1" required class="w-20 border border-stone-200 p-1 text-xs text-center rounded-none font-mono" />
                        </div>
                    </div>
                    {/each}
                </div>
            {/await}

            <button type="button" onclick={agregarFila} class="w-full border border-dashed border-stone-300 text-stone-400 py-1 text-[9px] font-black uppercase hover:border-stone-900 hover:text-stone-900 transition-colors">
                + Añadir Item
            </button>

            <textarea name="descripcion" placeholder="OBSERVACIONES..."></textarea>

            <button type="submit" class="w-full bg-stone-900 text-white font-bold uppercase text-xs p-3 rounded-none hover:bg-black transition-colors">
                Crear Solicitud
            </button>
        </form>
    </div>
</div>
{/if}