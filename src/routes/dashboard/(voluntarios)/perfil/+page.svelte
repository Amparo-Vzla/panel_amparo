<script>
    import Header from '$lib/components/Header.svelte';
    import DatosPerfil from '$lib/components/forms/DatosPerfil.svelte';
    import DatosCenso from '$lib/components/forms/DatosCenso.svelte';
    import DatosVehiculo from '$lib/components/forms/DatosVehiculo.svelte';
    import DatosEntidad from '$lib/components/forms/DatosEntidad.svelte';

    let { data, form } = $props();
</script>

<Header 
    titulo="Panel de Perfil Operativo" 
    descripcion="Sincronización del censo de búsqueda, actualización de capacidades técnicas y asignación institucional." 
    info=""
    error={form?.error}
    exito={form?.exito}
/>
<div class="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
    <!-- Bloque Izquierdo y Central: Gestión Desacoplada de Datos, Censo y Unidades -->
    <div class="lg:col-span-2 w-full space-y-6">
        <DatosPerfil 
            perfilPromesa={data.perfil} 
            profesionesPromesa={data.profesiones} 
            talentosPromesa={data.talentos} 
            areasColaboracionPromesa={data.areasColaboracion} 
        />

        <DatosCenso 
            perfilPromesa={data.perfil}
            personaAsociadaPromesa={data.personaAsociada}
            estatusPersona={data.estatusPersona}
        />

        <DatosVehiculo 
            vehiculoPromesa={data.vehiculo}
            tiposTransporte={data.tiposTransporte}
        />
    </div>
    {#if data.entidadEncargado}
        <div class="w-full">
            <DatosEntidad 
                dePersonalPromesa={data.dePersonal} 
                entidadEncargadoPromesa={data.entidadEncargado} 
                estatusEntidadEnum={data.estatusEntidad}
            />
        </div>
    {/if}
</div>