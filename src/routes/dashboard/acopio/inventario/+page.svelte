<!-- +page.svelte -->
<script>
    import FormDonacion from '$lib/components/forms/FormDonacion.svelte';
    import Header from '$lib/components/Header.svelte';
    import FormRetiro from '$lib/components/forms/FormRetiro.svelte';
    
    let { data, form } = $props();
</script>

<Header 
    titulo="Registro de Donaciones" 
    descripcion="Ingreso de donaciones de recursos y suministros para la contingencia." 
    info=""
    error={form?.error}
    exito={form?.exito}
    />
<div class="space-y-6">
    {#await data.recursos }
        <div class="p-4 text-center text-[10px] font-black uppercase text-stone-400 font-mono tracking-widest animate-pulse">
            Cargando...
        </div>
    {:then listaRecursos}
        <FormDonacion {listaRecursos}
        categoriasRecursos={data.categoriaRecurso}
        {form} />
    {/await}
    {#await data.inventario }
        <div class="p-4 text-center text-[10px] font-black uppercase text-stone-400 font-mono tracking-widest animate-pulse">
            Cargando...
        </div>
    {:then inventario}
        <FormRetiro {inventario} {form} />
    {/await}
</div>