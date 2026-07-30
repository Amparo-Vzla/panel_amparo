<script>
    import { enhance } from '$app/forms';
    import Ubicacion from '../Ubicacion.svelte';

    let { data } = $props();
</script>

<form
    method="POST"
    action="?/registrarDenuncia"
    use:enhance
    class="bg-white p-4 border border-stone-200 rounded-none flex flex-col justify-between space-y-4 h-full"
>
    <div class="space-y-3">
        <div>
            <h2 class="text-xs font-black text-stone-900 uppercase tracking-wider">
                Denuncias
            </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div class="space-y-1">
                <label
                    for="titulo"
                    class="text-[10px] font-black text-stone-500 uppercase"
                >
                    Incidencia
                </label>
                <input type="text" id="titulo" name="titulo" required />
            </div>

            <div class="space-y-1">
                <label
                    for="categoria"
                    class="text-[10px] font-black text-stone-500 uppercase"
                >
                    Categoría
                </label>

                <select id="categoria" name="categoria" required>
                    {#each data.categoriaDenuncia || [] as cat (cat)}
                        <option value={cat}>{cat}</option>
                    {/each}
                </select>
            </div>
        </div>

        <div class="p-2 bg-stone-50 border border-stone-200 rounded-none">
            <Ubicacion />
        </div>

        <div class="space-y-1">
            <label
                for="descripcion"
                class="text-[10px] font-black text-stone-500 uppercase"
            >
                Hechos Observados
            </label>

            <textarea
                id="descripcion"
                name="descripcion"
                required
            ></textarea>
        </div>
    </div>

    <div class="flex justify-end pt-2">
        <button
            type="submit"
            class="bg-stone-900 text-white px-5 py-2 text-xs font-bold uppercase rounded-none tracking-wider hover:bg-black transition"
        >
            Denunciar
        </button>
    </div>
</form>