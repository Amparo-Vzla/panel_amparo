<script>
    import { enhance } from '$app/forms';
</script>

<form method="POST" action="?/crearReporte" use:enhance class="bg-white p-4 border border-stone-200 rounded-none flex flex-col justify-between space-y-4 h-full">
    <div class="space-y-4">
        <div>
            <h2 class="text-xs font-black text-stone-900 uppercase tracking-wider">Reportes</h2>
        </div>
        <div class="space-y-1">
            <label for="descripcion" class="text-[10px] font-black text-stone-500 uppercase">Descripción</label>
            <textarea 
                id="descripcion"
                name="descripcion"
                required
            ></textarea>
        </div>
    </div>

    <div class="flex justify-end pt-2">
        <button type="submit" class="bg-stone-900 text-white px-5 py-2 text-xs font-bold uppercase rounded-none tracking-wider hover:bg-black transition">
            GUARDAR
        </button>
    </div>
</form>