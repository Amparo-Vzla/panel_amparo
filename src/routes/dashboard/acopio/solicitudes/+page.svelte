<script>
import Header from '$lib/components/Header.svelte';
import FormSolicitud from '$lib/components/forms/FormSolicitud.svelte';
import TablaSolicitudes from '$lib/components/tablas/TablaSolicitudes.svelte';
let {
    data,
    form
} = $props();
</script>

<Header
    titulo="Logística de Insumos"
    descripcion="Gestión de requerimientos nacionales por lotes de carga."
    error={form?.error}
    exito={form?.exito}
    />

    <FormSolicitud {data} {form} />

    <div class="lg:col-span-2 bg-white border border-stone-200 p-4 rounded-none space-y-4">
        <div class="pt-1">
            <TablaSolicitudes {data} />
        </div>
    </div>
