<script>
    import Mapa from '$lib/data/venezuela.json';

    // Almacenan únicamente cadenas de texto (strings) para evitar el [object Object]
    let estado = $state(null);
    let municipio = $state(null);
    let parroquia = $state(null);

    // Filtros reactivos utilizando $derived para buscar las dependencias en el JSON
    const municipiosDisponibles = $derived(
        estado ? (Mapa.find(e => e.estado === estado)?.municipios || []) : []
    );

    const parroquiasDisponibles = $derived(
        municipio ? (municipiosDisponibles.find(m => m.municipio === municipio)?.parroquias || []) : []
    );

    // Limpieza de campos en cascada mediante efectos reactivos
    $effect(() => {
        if (estado) {
            municipio = null;
            parroquia = null;
        }
    });

    $effect(() => {
        if (municipio) {
            parroquia = null;
        }
    });
</script>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <!-- Estado -->
    <div >
        <label for="estado" class="text-[10px] font-black uppercase mb-1 text-stone-900">Estado</label>
        <select 
            bind:value={estado} 
            id="estado" 
            name="estado"
        >
            <option value={null}>SELECCIONE</option>
            {#each Mapa as est}
                <option value={est.estado}>{est.estado}</option>
            {/each}
        </select>
    </div>

    <!-- Municipio -->
    <div >
        <label for="municipio" class="text-[10px] font-black uppercase mb-1 text-stone-900">Municipio</label>
        <select 
            bind:value={municipio} 
            id="municipio" 
            name="municipio" 
            disabled={!estado}
        >
            <option value={null}>SELECCIONE</option>
            {#each municipiosDisponibles as mun}
                <option value={mun.municipio}>{mun.municipio}</option>
            {/each}
        </select>
    </div>

    <!-- Parroquia -->
    <div>
        <label for="parroquia" class="text-[10px] font-black uppercase mb-1 text-stone-900">Parroquia</label>
        <select 
            bind:value={parroquia} 
            id="parroquia" 
            name="localidad" 
            disabled={!municipio}
        >
            <option value={null}>SELECCIONE</option>
            {#each parroquiasDisponibles as par}
                <option value={par}>{par}</option>
            {/each}
        </select>
    </div>
</div>