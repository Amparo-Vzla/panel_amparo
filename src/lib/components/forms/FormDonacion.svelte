<script>
    import { enhance } from '$app/forms';

    // Props mediante runas de Svelte 5
    let { listaRecursos = [], categoriasRecursos = [], form } = $props();

    let isOpen = $state(false);
    let fase = $state('busqueda'); // 'busqueda' | 'recursos'
    let donante = $state(null);
    let cedulaInput = $state('');
    let cargandoBuscar = $state(false);
    let cargandoGuardar = $state(false);

    // Estructura limpia por fila
    let filas = $state([
        { 
            recursoId: '', 
            cantidad: 1, 
            query: '', 
            open: false,
            categoriaFiltro: '', 
            vencimiento: '',
            talla: '',
            genero: '',
            estado: ''
        }
    ]);

    // Validación reactiva corregida con coerción de tipos segura
    let formularioValido = $derived(
        filas.length > 0 && filas.every(f => {
            if (!f.recursoId || f.cantidad <= 0) return false;
            
            const rec = listaRecursos.find(r => String(r.id) === String(f.recursoId));
            if (!rec) return false;

            const cat = rec.categoria.toLowerCase();
            if (cat === 'medicamentos' || cat === 'alimentos') {
                return f.vencimiento !== '';
            }
            if (cat === 'ropa') {
                return f.talla.trim() !== '' && f.genero !== '' && f.estado !== '';
            }
            return true;
        })
    );

    function agregarFila() {
        filas.push({ 
            recursoId: '', cantidad: 1, query: '', open: false, categoriaFiltro: '',
            vencimiento: '', talla: '', genero: '', estado: '' 
        });
    }

    function eliminarFila(index) {
        if (filas.length > 1) filas.splice(index, 1);
    }

    function resetearFlujo() {
        fase = 'busqueda';
        donante = null;
        cedulaInput = '';
        filas = [{ recursoId: '', cantidad: 1, query: '', open: false, categoriaFiltro: '', vencimiento: '', talla: '', genero: '', estado: '' }];
    }

    function cerrarModal() {
        resetearFlujo();
        isOpen = false;
    }

    function manejarRespuestaBusqueda() {
        cargandoBuscar = true;
        return async ({ result, update }) => {
            await update({ reset: false });
            cargandoBuscar = false;
            if (result.data?.donanteEncontrado) {
                donante = result.data.donanteEncontrado;
                fase = 'recursos';
            }
        };
    }

    function manejarRespuestaGuardar() {
        cargandoGuardar = true;
        return async ({ result, update }) => {
            await update();
            cargandoGuardar = false;
            if (result.type === 'success' || result.data?.exito) {
                cerrarModal();
            }
        };
    }
</script>

<button type="button" onclick={() => (isOpen = true)} class="bg-stone-900 text-white font-bold uppercase text-xs px-4 py-2 rounded-none hover:bg-black transition tracking-wider">
    Registrar Ingreso de Inventario
</button>

{#snippet alertaError(mensaje)}
    <div class="p-2 bg-red-50 border border-red-200 text-red-700 text-[10px] font-black uppercase rounded-none font-mono">
        ⚠️ {mensaje}
    </div>
{/snippet}

{#snippet camposVariantes(fila, categoriaReal)}
    {#if categoriaReal === 'medicamentos' || categoriaReal === 'alimentos'}
        <div class="bg-white border border-stone-200 p-2 mt-1">
            <div class="flex items-center gap-2">
                <label class="text-[10px] font-black uppercase text-stone-500 font-mono">Fecha de Vencimiento:</label>
                <input type="date" bind:value={fila.vencimiento} required class="border border-stone-200 bg-stone-50 p-1 text-xs font-mono font-bold focus:outline-none focus:border-stone-900 rounded-none" />
            </div>
        </div>
    {:else if categoriaReal === 'ropa'}
        <div class="bg-white border border-stone-200 p-2 mt-1 grid grid-cols-3 gap-2">
            <div>
                <label class="text-[10px] font-black uppercase text-stone-400 font-mono block">Talla:</label>
                <input type="text" placeholder="Ej: M, L, 32" bind:value={fila.talla} required class="w-full border border-stone-200 p-1 text-xs font-mono uppercase font-bold focus:outline-none focus:border-stone-900 rounded-none"/>
            </div>
            <div>
                <label class="text-[10px] font-black uppercase text-stone-400 font-mono block">Género:</label>
                <select bind:value={fila.genero} required class="w-full border border-stone-200 p-1 text-xs font-mono uppercase font-bold focus:outline-none focus:border-stone-900 rounded-none bg-transparent">
                    <option value="">[SELECCIONE]</option>
                    <option value="UNISEX">Unisex</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="INFANTIL">Infantil</option>
                </select>
            </div>
            <div>
                <label class="text-[10px] font-black uppercase text-stone-400 font-mono block">Estado:</label>
                <select bind:value={fila.estado} required class="w-full border border-stone-200 p-1 text-xs font-mono uppercase font-bold focus:outline-none focus:border-stone-900 rounded-none bg-transparent">
                    <option value="">[SELECCIONE]</option>
                    <option value="NUEVO">Nuevo</option>
                    <option value="EXCELENTE">Excelente</option>
                    <option value="BUENO">Bueno</option>
                    <option value="REGULAR">Regular</option>
                </select>
            </div>
        </div>
    {/if}
{/snippet}

{#if isOpen}
    <div class="fixed inset-0 w-full h-full flex items-center justify-center backdrop-blur-sm bg-stone-900/40 z-50 p-4">
        <div class="bg-white border border-stone-200 shadow-2xl rounded-none w-full max-w-4xl flex flex-col max-h-[90vh]">
            
            <div class="border-b border-stone-200 p-3 flex justify-between items-center bg-stone-50">
                <h2 class="text-[10px] font-black uppercase tracking-wider text-stone-900 font-mono">
                    Registro de Inventario
                </h2>
                <div class="flex items-center gap-3">
                    {#if fase === 'recursos'}
                        <button type="button" onclick={resetearFlujo} class="text-[10px] font-black uppercase text-blue-700 hover:underline font-mono">
                            Cambiar Donante
                        </button>
                    {/if}
                    <button type="button" onclick={cerrarModal} class="text-stone-400 hover:text-stone-900 font-bold text-xs font-mono">✕</button>
                </div>
            </div>

            <div class="p-4 overflow-y-auto flex-1">
                {#if fase === 'busqueda'}
                    <form method="POST" action="?/verificarDonante" use:enhance={manejarRespuestaBusqueda} class="space-y-3 max-w-md mx-auto py-6">
                        <div class="space-y-1">
                            <label for="cedula" class="text-[10px] font-black uppercase text-stone-500 block font-mono">Cédula del Donante:</label>
                            <div class="flex gap-1">
                                <span class="bg-stone-100 border border-stone-200 px-3 py-1.5 text-xs font-bold text-stone-600 font-mono flex items-center rounded-none">V-</span>
                                <input type="text" id="cedula" name="cedula" bind:value={cedulaInput} required placeholder="24123456" class="w-full border border-stone-200 bg-white p-1.5 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-stone-900 rounded-none uppercase"/>
                            </div>
                        </div>
                        
                        {#if form?.errorBuscar}
                            {@render alertaError(form.errorBuscar)}
                        {/if}
                        
                        <button type="submit" disabled={cargandoBuscar || !cedulaInput} class="w-full bg-stone-900 text-white py-2 text-[10px] font-black uppercase tracking-wider hover:bg-black rounded-none disabled:bg-stone-200 disabled:text-stone-400 transition font-mono">
                            {cargandoBuscar ? 'Buscando...' : 'Continuar'}
                        </button>
                    </form>

                {:else if fase === 'recursos' && donante}
                    <div class="bg-stone-50 p-2 border border-stone-200 mb-4 text-xs font-mono flex justify-between items-center">
                        <div>
                            <span class="text-[9px] font-black text-stone-400 block uppercase">Donante</span>
                            <span class="font-black text-stone-900 uppercase">{donante.nombre} {donante.apellido || ''}</span>
                        </div>
                        <span class="text-stone-500 font-bold bg-white px-2 py-1 border border-stone-200">V-{donante.cedula}</span>
                    </div>

                    <form method="POST" action="?/registrarDonacionMasiva" use:enhance={manejarRespuestaGuardar} class="space-y-4">
                        <input type="hidden" name="personasId" value={donante.id} />
                        <input type="hidden" name="items" value={JSON.stringify(filas)} />

                        <div class="space-y-2">
                            <div class="flex justify-between items-center border-b border-stone-200 pb-1">
                                <span class="text-[10px] font-black uppercase text-stone-500 font-mono block">Artículos a ingresar:</span>
                                <button type="button" onclick={agregarFila} class="text-[9px] bg-stone-900 text-white font-black uppercase px-2 py-1 rounded-none hover:bg-stone-800 font-mono">
                                    ➕ Agregar Fila
                                </button>
                            </div>

                            <div class="space-y-3 max-h-[50vh] min-h-[280px] overflow-y-auto pr-1">
                                {#each filas as fila, i}
                                    {@const opcionesFiltradas = listaRecursos.filter(rec => {
                                        const matchCat = !fila.categoriaFiltro || rec.categoria === fila.categoriaFiltro;
                                        const matchTxt = rec.nombre.toLowerCase().includes(fila.query.toLowerCase());
                                        return matchCat && matchTxt;
                                    })}
                                    
                                    {@const recursoActual = listaRecursos.find(r => String(r.id) === String(fila.recursoId))}
                                    {@const categoriaReal = recursoActual?.categoria?.toLowerCase() || ''}

                                    <div class="bg-stone-50 border border-stone-200 p-2 space-y-1 relative rounded-none">
                                        <div class="flex flex-wrap items-center gap-2">
                                            <div class="text-[10px] font-mono font-black text-stone-400 w-4">#{i + 1}</div>
                                            
                                            <select 
                                                bind:value={fila.categoriaFiltro}
                                                
                                            >
                                                <option value="">[TODAS]</option>
                                                {#each categoriasRecursos as cat}
                                                    <option value={cat}>{cat}</option>
                                                {/each}
                                            </select>

                                            <div class="flex-1 min-w-[200px] relative">
                                                <input 
                                                    type="text"
                                                    placeholder="Buscar recurso..."
                                                    bind:value={fila.query}
                                                    onfocus={() => (fila.open = true)}
                                                    onblur={() => setTimeout(() => (fila.open = false), 250)}
                                                    
                                                />

                                                {#if fila.open}
                                                    <div class="absolute left-0 right-0 top-full bg-white border border-stone-900 shadow-xl z-50 max-h-40 overflow-y-auto rounded-none divide-y divide-stone-100">
                                                        {#if opcionesFiltradas.length === 0}
                                                            <div class="p-2 text-[10px] font-mono text-stone-400 uppercase font-bold">Sin resultados</div>
                                                        {:else}
                                                            {#each opcionesFiltradas as rec}
                                                                <button
                                                                    type="button"
                                                                    class="w-full text-left p-1.5 text-xs font-mono font-bold uppercase hover:bg-stone-900 hover:text-white block transition text-stone-800"
                                                                    onmousedown={() => {
                                                                        fila.recursoId = rec.id;
                                                                        fila.query = rec.nombre;
                                                                        fila.open = false;
                                                                    }}
                                                                >
                                                                    {rec.nombre} <span class="text-[9px] bg-stone-100 text-stone-600 px-1 ml-1">[{rec.categoria}]</span>
                                                                </button>
                                                            {/each}
                                                        {/if}
                                                    </div>
                                                {/if}
                                            </div>

                                            <div class="flex items-center bg-white border border-stone-200 px-1">
                                                <span class="text-[9px] font-mono font-black text-stone-400 uppercase px-1">CANT:</span>
                                                <input type="number" min="1" bind:value={fila.cantidad} required class="w-14 bg-transparent p-1 text-xs font-mono font-black text-right text-stone-900 focus:outline-none"/>
                                            </div>

                                            <button type="button" onclick={() => eliminarFila(i)} disabled={filas.length === 1} class="p-1 text-stone-400 hover:text-red-700 disabled:opacity-10 transition">✕</button>
                                        </div>

                                        {@render camposVariantes(fila, categoriaReal)}
                                    </div>
                                {/each}
                            </div>
                        </div>

                        {#if form?.errorGuardar}
                            {@render alertaError(form.errorGuardar)}
                        {/if}

                        <button type="submit" disabled={cargandoGuardar || !formularioValido} class="w-full bg-stone-900 text-white py-2.5 text-[10px] font-black uppercase tracking-wider hover:bg-black rounded-none disabled:bg-stone-200 disabled:text-stone-400 transition font-mono">
                            {cargandoGuardar ? 'Guardando...' : 'Confirmar y Guardar'}
                        </button>
                    </form>
                {/if}
            </div>
        </div>
    </div>
{/if}