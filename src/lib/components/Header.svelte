<script>
    let { titulo, descripcion, info = "", error = null, exito = null } = $props();
    let dialogRef = $state();
    
    let visible = $state(false);

    $effect(() => {
        if (error || exito) {
            visible = true;
            const timer = setTimeout(() => {
                visible = false;
            }, 8000);
            
            return () => clearTimeout(timer);
        } else {
            visible = false;
        }
    });
</script>

<div class="pb-5">
    <div class="flex items-start justify-between gap-4">
        <h1 class="text-2xl md:text-3xl font-bold md:font-black text-stone-900 uppercase tracking-tighter">
            {titulo}
        </h1>
        {#if info}
            <button 
                onclick={() => dialogRef.showModal()}
                class="bg-stone-900 mt-1 flex items-center justify-center w-6 h-6 border border-stone-300 text-stone-400 hover:text-stone-900 hover:border-stone-900 transition-colors text-[10px] font-black"
            >
                i
            </button>
        {/if}
    </div>

    {#if descripcion}
        <p class="mt-2 text-[10px] md:text-xs text-stone-500 font-medium max-w-2xl">
            {descripcion}
        </p >
    {/if}

    <dialog 
        bind:this={dialogRef}
        class="m-auto p-8 bg-white border-1 border-stone-900 shadow-2xl backdrop-blur-sm rounded-none w-[90vw] md:w-[600px] open:animate-in open:fade-in open:zoom-in-95 duration-200"
        onclick={(e) => e.target === dialogRef && dialogRef.close()}
    >
        <h2 class="text-[10px] font-black uppercase text-stone-900 mb-6 tracking-widest">Detalles</h2>
        <p class="text-xs md:text-sm text-stone-700 leading-relaxed">{info}</p>
        <button 
            onclick={() => dialogRef.close()}
            class="mt-8 w-full bg-stone-900 text-white font-bold uppercase text-[10px] py-3 rounded-none hover:bg-stone-800"
        >
            Cerrar
        </button>
    </dialog>
</div>

{#if visible && (error || exito)}
    <div class="fixed top-4 right-4 z-50 w-auto min-w-[250px] border-l-4 border-r-1 border-t-1 border-b-1 shadow-2xl p-4 transition-all duration-300
        {error ? 'bg-red-700 border-red-900' : 'bg-emerald-700 border-emerald-900'}">
        
        <p class="text-[11px] font-black uppercase text-white tracking-widest">
            {error || exito}
        </p>
    </div>
{/if}