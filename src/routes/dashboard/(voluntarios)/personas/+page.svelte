<script>
    import FichaPersona from '$lib/components/FichaPersona.svelte';
    import FormPersonas from '$lib/components/forms/FormPersonas.svelte';
    import TablaPersonas from '$lib/components/tablas/TablaPersonas.svelte';
    import Header from '$lib/components/Header.svelte';

    let { data, form = $bindable() } = $props();

    // ESTADOS DE CONTROL GLOBAL Y MODAL
    let modalAbierto = $state(false);
    let personaSeleccionada = $state(null);

    function abrirModal(p) {
        personaSeleccionada = p;
        modalAbierto = true;
    }
</script>
<Header 
    titulo="Nadie se queda Atras" 
    descripcion="Sistema de Gestión de Personas y Recursos para la Contingencia." 
    info="Este módulo permite registrar, localizar y reportar personas en situación de vulnerabilidad. La información ingresada es de fe publica y se utiliza exclusivamente para fines de asistencia humanitaria."
    error={form?.error}
    exito={form?.exito}
/>


<!-- Componente Formulario (pasamos form con bind para mantener use:enhance funcionando) -->
<FormPersonas bind:form={form} estatusPersona={data.estatusPersona} />

<!-- Componente de Tabla (le inyectamos el data global, coincidencias del form y el callback del modal) -->
<TablaPersonas {data} coincidencias={form?.coincidencias} onVerExpediente={abrirModal} />


<!-- Componente Modal Ficha Persona -->
<FichaPersona persona={personaSeleccionada} bind:open={modalAbierto} />