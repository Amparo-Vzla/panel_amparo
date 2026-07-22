<script>
import Header from '$lib/components/Header.svelte';
import FormReporte from '$lib/components/forms/FormReporte.svelte';
import FormDenuncia from '$lib/components/forms/FormDenuncia.svelte';
import TablaReportes from '$lib/components/tablas/TablaReportes.svelte';

let {
    data,
    form
} = $props();
</script>

<Header
    titulo="Centro de Incidencias Operacionales"
    descripcion="Bitácora de fallos internos del sistema y panel de control de denuncias territoriales a nivel nacional."
    info=""
    error={form?.error}
    exito={form?.exito}
    />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <FormReporte {form} />
        <FormDenuncia {data} {form} />
    </div>

    <TablaReportes {data} />
