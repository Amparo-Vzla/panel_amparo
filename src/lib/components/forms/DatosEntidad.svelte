<script>
    import { enhance } from '$app/forms';
    
    let { 
        dePersonalPromesa, 
        entidadEncargadoPromesa,
        estatusEntidadEnum, 
    } = $props();
</script>

<div class="w-full space-y-6">
{#await Promise.all([dePersonalPromesa, entidadEncargadoPromesa])}
    <div class="bg-white border border-stone-200 p-4 rounded-none space-y-3 animate-pulse">
        <div class="h-3 bg-stone-200 w-1/4 rounded-none"></div>
        <div class="h-32 bg-stone-100 rounded-none"></div>
    </div>
{:then [dePersonal, entidadEncargado]}
    {@const esEncargado = !!entidadEncargado}
    {@const tieneVinculacion = !!dePersonal || esEncargado}
    
    {@const entidad = esEncargado ? entidadEncargado : (dePersonal ? {
        id: dePersonal.entidadId,
        codigo: dePersonal.codigo,
        tipo: dePersonal.tipo,
        nombre: dePersonal.nombre,
        telefonoPrincipal: dePersonal.telefonoPrincipal,
        telefonoSecundario: dePersonal.telefonoSecundario,
        emailContacto: dePersonal.emailContacto,
        estado: dePersonal.estado,
        municipio: dePersonal.municipio,
        localidad: dePersonal.localidad,
        direccionExacta: dePersonal.direccionExacta,
        verificado: dePersonal.verificado,
        estatus: dePersonal.estatusEntidad
    } : null)}

    {#if tieneVinculacion && entidad}
        <div class="bg-white border border-stone-200 p-4 rounded-none">
            <!-- Cabecera de Ficha -->
            <h3 class="text-[10px] font-black uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3 mb-4 flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                    <span class="h-2 w-2 {esEncargado ? 'bg-blue-700' : 'bg-stone-900'} inline-block"></span>
                    Ficha Técnica de la Entidad
                </div>
                <span class="px-1.5 py-0.5 font-mono font-bold text-[9px] {esEncargado ? 'bg-blue-100 text-blue-800' : 'bg-stone-200 text-stone-800'}">
                    {esEncargado ? 'ENCARGADO' : `${dePersonal.rol.toUpperCase()}`}
                </span>
            </h3>

            <!-- Tabla de Datos Base -->
            <div class="border border-stone-200 bg-stone-50 mb-4">
                <table class="w-full text-left border-collapse">
                    <tbody>
                        <tr class="border-b border-stone-200">
                            <td class="p-2 text-[10px] font-black text-stone-500 uppercase bg-stone-100 border-r border-stone-200 w-1/3">Nombre</td>
                            <td class="p-2 text-xs font-black uppercase text-stone-900">{entidad.nombre}</td>
                        </tr>
                        <tr class="border-b border-stone-200">
                            <td class="p-2 text-[10px] font-black text-stone-500 uppercase bg-stone-100 border-r border-stone-200">Código</td>
                            <td class="p-2 text-xs font-mono font-bold text-stone-800 tracking-wider">{entidad.codigo}</td>
                        </tr>
                        <tr class="border-b border-stone-200">
                            <td class="p-2 text-[10px] font-black text-stone-500 uppercase bg-stone-100 border-r border-stone-200">Tipo</td>
                            <td class="p-2 text-xs font-bold uppercase text-blue-700">{entidad.tipo}</td>
                        </tr>
                        <tr class="border-b border-stone-200">
                            <td class="p-2 text-[10px] font-black text-stone-500 uppercase bg-stone-100 border-r border-stone-200">Telf. Pri.</td>
                            <td class="p-2 text-xs font-mono text-stone-800">{entidad.telefonoPrincipal}</td>
                        </tr>
                        <tr class="border-b border-stone-200">
                            <td class="p-2 text-[10px] font-black text-stone-500 uppercase bg-stone-100 border-r border-stone-200">Telf. Sec.</td>
                            <td class="p-2 text-xs font-mono text-stone-600">{entidad.telefonoSecundario || 'NO REGISTRADO'}</td>
                        </tr>
                        <tr class="border-b border-stone-200">
                            <td class="p-2 text-[10px] font-black text-stone-500 uppercase bg-stone-100 border-r border-stone-200">Correo</td>
                            <td class="p-2 text-xs font-mono text-stone-800 lowercase">{entidad.emailContacto || 'SIN REGISTRO'}</td>
                        </tr>
                        <tr class="border-b border-stone-200">
                            <td class="p-2 text-[10px] font-black text-stone-500 uppercase bg-stone-100 border-r border-stone-200">Estado</td>
                            <td class="p-2 text-xs font-medium uppercase text-stone-800">{entidad.estado}</td>
                        </tr>
                        <tr class="border-b border-stone-200">
                            <td class="p-2 text-[10px] font-black text-stone-500 uppercase bg-stone-100 border-r border-stone-200">Municipio</td>
                            <td class="p-2 text-xs font-medium uppercase text-stone-800">{entidad.municipio}</td>
                        </tr>
                        <tr class="border-b border-stone-200">
                            <td class="p-2 text-[10px] font-black text-stone-500 uppercase bg-stone-100 border-r border-stone-200">Parroquia</td>
                            <td class="p-2 text-xs font-medium uppercase text-stone-800">{entidad.localidad}</td>
                        </tr>
                        <tr class="border-b border-stone-200">
                            <td class="p-2 text-[10px] font-black text-stone-500 uppercase bg-stone-100 border-r border-stone-200">Dirección</td>
                            <td class="p-2 text-xs text-stone-700 uppercase font-medium">{entidad.direccionExacta}</td>
                        </tr>
                        <tr class="border-b border-stone-200">
                            <td class="p-2 text-[10px] font-black text-stone-500 uppercase bg-stone-100 border-r border-stone-200">Verificación</td>
                            <td class="p-2 text-xs">
                                <span class="px-1 text-[10px] font-bold uppercase {entidad.verificado ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                                    {entidad.verificado ? 'VERIFICADA' : 'PENDIENTE'}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td class="p-2 text-[10px] font-black text-stone-500 uppercase bg-stone-100 border-r border-stone-200">Estatus</td>
                            <td class="p-2 text-xs">
                                <span class="px-1.5 py-0.5 text-[10px] font-black tracking-wide uppercase {entidad.estatus === 'ACTIVO' ? 'bg-emerald-900 text-white' : 'bg-red-700 text-white'}">
                                    {entidad.estatus}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Acciones de Control -->
            <div class="mt-4 pt-3 border-t border-stone-200">
                {#if esEncargado}
                    {#if entidad.verificado && entidad.estatus}
                        <form method="POST" action="?/actualizarEstatusEntidad" use:enhance class="flex flex-col space-y-2">
                            <input type="hidden" name="entidadId" value={entidad.id} />
                            
                            <div class="flex flex-col">
                                <label for="estatus" class="text-[10px] font-black text-stone-700 uppercase mb-1">Cambiar estatus de la entidad</label>
                                <div class="flex gap-2">
                                    <select 
                                        id="estatus" 
                                        name="estatus" 
                                        value={entidad.estatus} 
                                        class="w-full bg-stone-50 border border-stone-200 p-2 text-xs uppercase font-mono rounded-none focus:outline-none focus:border-stone-900"
                                    >
                                        {#if estatusEntidadEnum}
                                            {#each estatusEntidadEnum as item}
                                                <option value={item}>{item}</option>
                                            {/each}
                                        {/if}
                                    </select>
                                    <button type="submit" class="bg-stone-900 text-white font-bold uppercase text-xs px-4 rounded-none hover:bg-stone-800 transition-colors whitespace-nowrap">
                                        Actualizar
                                    </button>
                                </div>
                            </div>
                        </form>
                    {:else}
                        <!-- Mensaje minimalista si el encargado no está verificado aún -->
                        <div class="p-2 text-[10px] font-black uppercase tracking-wide text-amber-800 bg-amber-50 border border-amber-200">
                            Edición deshabilitada: la entidad requiere verificación institucional.
                        </div>
                    {/if}
                {:else if dePersonal}
                    <div class="flex items-center justify-between bg-stone-50 border border-stone-200 p-3 rounded-none">
                        <div class="space-y-0.5">
                            <p class="text-[10px] font-black text-stone-900 uppercase">¿Deseas rescindir de esta unidad?</p>
                            <p class="text-[11px] text-stone-500">Esto te dará de baja como personal de la entidad inmediatamente.</p>
                        </div>
                        
                        <form 
                            method="POST" 
                            action="?/finalizarServicio" 
                            use:enhance
                            onsubmit={(e) => { if (!confirm('¿CONFIRMA RENUNCIA VOLUNTARIA A LA ENTIDAD OPERATIVA?')) e.preventDefault(); }}
                        >
                            <input type="hidden" name="personalId" value={dePersonal.id} />
                            <button 
                                type="submit" 
                                class="bg-red-700 text-white font-bold uppercase text-xs px-4 py-2 rounded-none hover:bg-red-800 transition-colors tracking-wide"
                            >
                                Disolver Vínculo
                            </button>
                        </form>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
{/await}
</div>