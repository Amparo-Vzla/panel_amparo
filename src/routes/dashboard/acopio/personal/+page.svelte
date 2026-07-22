<script>
    import { enhance } from '$app/forms';
    import Header from '$lib/components/Header.svelte';

    let { data, form } = $props();

    let pestañaActiva = $state('personal'); 
    let usuarioDetalle = $state(null);
    let refDialog = $state();

    const abrirDetalle = (u) => {
        usuarioDetalle = u;
        refDialog?.showModal();
    };

    const cerrarDetalle = () => {
        refDialog?.close();
        usuarioDetalle = null;
    };
</script>

<Header 
    titulo="Gestión de Personal y Puestos" 
    descripcion="Fichas de asignación directa y administración de solicitudes abiertas por competencias." 
    info=""
    error={form?.error}
    exito={form?.exito}
/>


<div class="flex border-b border-stone-200 mb-4 bg-stone-50 p-0.5">
    <button type="button" onclick={() => pestañaActiva = 'personal'}
        class="px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-none transition {pestañaActiva === 'personal' ? 'bg-white text-stone-900 border border-stone-200 border-b-transparent' : 'text-stone-500'}">
        👥 Control de Plantilla
    </button>
    <button type="button" onclick={() => pestañaActiva = 'vacantes'}
        class="px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-none transition {pestañaActiva === 'vacantes' ? 'bg-white text-stone-900 border border-stone-200 border-b-transparent' : 'text-stone-500'}">
        📢 Reclutamiento & Postulaciones
    </button>
</div>

{#if pestañaActiva === 'personal'}
    <div class="bg-white border border-stone-200 rounded-none overflow-hidden">
        <table class="w-full text-left border-collapse m-0">
            <thead>
                <tr class="bg-stone-50 border-b border-stone-200 text-[10px] font-black uppercase text-stone-600">
                    <th class="p-2 pl-4">Identificación</th>
                    <th class="p-2">Puesto en Sede</th>
                    <th class="p-2">Estatus</th>
                    <th class="p-2 text-right pr-4">Acción</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-stone-100 text-xs font-mono">
                {#await data.streamed.personal}
                    <tr><td colspan="4" class="p-4 text-center text-[10px] text-stone-400 font-black uppercase animate-pulse">Sincronizando plantilla operativa...</td></tr>
                {:then lista}
                    {#each lista as p}
                        <tr class="hover:bg-stone-50 transition">
                            <td class="p-2 pl-4 font-sans">
                                <div class="font-black text-stone-900 uppercase text-[11px]">{p.usuario.nombre} {p.usuario.apellido}</div>
                                <div class="text-[9px] text-stone-400 font-mono">V-{p.usuario.cedula}</div>
                            </td>
                            <td class="p-2 uppercase text-[10px] font-bold text-stone-700">
                                {p.usuario.puesto || 'VOLUNTARIO'}
                            </td>
                            <td class="p-2">
                                <span class="px-1.5 py-0.5 text-[9px] font-black uppercase border 
                                    {p.estatus === 'activo' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}">
                                    {p.estatus}
                                </span>
                            </td>
                            <td class="p-2 text-right pr-4 space-x-2 font-sans">
                                <button type="button" onclick={() => abrirDetalle(p.usuario)} class="text-blue-700 font-black text-[10px] uppercase hover:underline">
                                    Expediente
                                </button>
                                <form method="POST" action="?/gestionarPersonal" use:enhance class="inline-block">
                                    <input type="hidden" name="id" value={p.id} />
                                    {#if p.estatus !== 'activo'}
                                        <button name="accion" value="aceptar" class="text-emerald-700 font-black text-[10px] uppercase hover:underline">Aceptar</button>
                                    {/if}
                                    {#if p.estatus === 'activo'}
                                        <button name="accion" value="inactivar" class="text-stone-400 font-black text-[10px] uppercase hover:text-stone-900 hover:underline">Dar Baja</button>
                                    {/if}
                                </form>
                            </td>
                        </tr>
                    {:else}
                        <tr><td colspan="4" class="p-4 text-center text-stone-400 uppercase text-[10px]">Sin asignaciones ni postulados registrados.</td></tr>
                    {/each}
                {/await}
            </tbody>
        </table>
    </div>
{/if}

{#if pestañaActiva === 'vacantes'}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        
        <div class="bg-white border border-stone-200 p-4 rounded-none space-y-3">
            <div class="text-[10px] font-black uppercase text-stone-900 border-b pb-1">Emitir Nueva Vacante</div>
            
            <form method="POST" action="?/crearVacante" use:enhance class="space-y-3">
                <div class="space-y-1">
                    <label class="text-[9px] font-black uppercase text-stone-500 block">Puesto Específico</label>
                    <select name="puestoId" class="w-full border border-stone-200 bg-stone-50 p-1.5 text-xs rounded-none focus:outline-none">
                        <option value="">-- GENERAL / CUALQUIER PUESTO --</option>
                        {#await data.streamed.catalogoPuestos}
                            <option disabled>Cargando puestos...</option>
                        {:then puestosList}
                            {#each puestosList as pst}
                                <option value={pst.id}>{pst.nombre.toUpperCase()}</option>
                            {/each}
                        {/await}
                    </select>
                </div>

                <div class="space-y-1">
                    <label class="text-[9px] font-black uppercase text-stone-500 block">Profesión Requerida</label>
                    <select name="profesionId" class="w-full border border-stone-200 bg-stone-50 p-1.5 text-xs rounded-none focus:outline-none">
                        <option value="">-- CUALQUIER PROFESIÓN --</option>
                        {#await data.streamed.catalogoProfesiones}
                            <option disabled>Cargando profesiones...</option>
                        {:then profes}
                            {#each profes as prof}
                                <option value={prof.id}>{prof.nombre.toUpperCase()}</option>
                            {/each}
                        {/await}
                    </select>
                </div>

                <div class="space-y-1">
                    <label class="text-[9px] font-black uppercase text-stone-500 block">Área de Colaboración</label>
                    <select name="areaColaboracionId" class="w-full border border-stone-200 bg-stone-50 p-1.5 text-xs rounded-none focus:outline-none">
                        <option value="">-- TODAS LAS ÁREAS --</option>
                        {#await data.streamed.catalogoAreas}
                            <option disabled>Cargando áreas...</option>
                        {:then areas}
                            {#each areas as area}
                                <option value={area.id}>{area.nombre.toUpperCase()}</option>
                            {/each}
                        {/await}
                    </select>
                </div>

                <div class="space-y-1">
                    <label class="text-[9px] font-black uppercase text-stone-500 block">Descripción Detallada</label>
                    <textarea name="descripcion" rows="4" required placeholder="DESCRIPCIÓN REQUERIDA PARA ESTA PLAZA INDIVIDUAL..." class="w-full border border-stone-200 bg-stone-50 p-1.5 text-xs rounded-none focus:outline-none placeholder:text-stone-300"></textarea>
                </div>

                <button type="submit" class="w-full bg-stone-900 text-white py-2 text-[10px] font-black uppercase tracking-wider rounded-none hover:bg-black transition">
                    Publicar Vacante
                </button>
            </form>
        </div>

        <div class="bg-white border border-stone-200 rounded-none overflow-hidden lg:col-span-2">
            <table class="w-full text-left border-collapse m-0">
                <thead>
                    <tr class="bg-stone-50 border-b border-stone-200 text-[10px] font-black uppercase text-stone-600">
                        <th class="p-2.5 pl-4">Código / Requerimiento</th>
                        <th class="p-2.5">Descripción Perfil</th>
                        <th class="p-2.5">Estatus</th>
                        <th class="p-2.5 text-right pr-4">Resolución</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-stone-100 text-xs font-mono">
                    {#await data.streamed.vacantes}
                        <tr><td colspan="4" class="p-4 text-center text-stone-400 uppercase text-[10px]">Cargando historial operativo...</td></tr>
                    {:then listaVacantes}
                        {#each listaVacantes as vac}
                            <tr class="hover:bg-stone-50 transition">
                                <td class="p-2.5 pl-4">
                                    <div class="font-black text-stone-900">{vac.codigo}</div>
                                    <div class="text-[8px] text-stone-500 uppercase font-black">Puesto: {vac.puestoRequerido || 'ABIERTO'}</div>
                                    <div class="text-[8px] text-blue-700 uppercase font-black">Prof: {vac.profesionRequerida || 'GENERAL'}</div>
                                    
                                    <span class="inline-block mt-1 px-1 text-[7px] font-black uppercase tracking-tight border
                                        {vac.tipo === 'POSTULACION' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-stone-100 border-stone-300 text-stone-600'}">
                                        {vac.tipo}
                                    </span>
                                </td>
                                <td class="p-2.5 font-sans text-[11px] text-stone-600 max-w-xs truncate" title={vac.descripcion}>
                                    {vac.descripcion}
                                </td>
                                <td class="p-2.5">
                                    <span class="px-1.5 py-0.5 text-[9px] font-black uppercase border 
                                        {vac.estatus === 'ABIERTA' ? 'bg-amber-50 border-amber-200 text-amber-800' : 
                                         vac.estatus === 'ACEPTADA' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-stone-100 border-stone-200 text-stone-500'}">
                                        {vac.estatus}
                                    </span>
                                </td>
                                <td class="p-2.5 text-right pr-4">
                                    {#if vac.tipo === 'POSTULACION'}
                                        {#if vac.estatus === 'ABIERTA'}
                                            <form method="POST" action="?/gestionarPostulacion" use:enhance class="inline-flex gap-1.5">
                                                <input type="hidden" name="vacanteId" value={vac.id} />
                                                <button type="submit" name="accion" value="aceptar" class="text-emerald-700 border border-emerald-700 text-[8px] font-black uppercase px-1.5 py-0.5 hover:bg-emerald-700 hover:text-white rounded-none transition">
                                                    Aceptar
                                                </button>
                                                <button type="submit" name="accion" value="rechazar" class="text-red-700 border border-red-700 text-[8px] font-black uppercase px-1.5 py-0.5 hover:bg-red-700 hover:text-white rounded-none transition">
                                                    Rechazar
                                                </button>
                                            </form>
                                        {:else}
                                            <span class="text-[9px] uppercase font-black text-stone-400">{vac.estatus}</span>
                                        {/if}
                                    {:else}
                                        {#if vac.estatus === 'ABIERTA'}
                                            <form method="POST" action="?/cerrarVacante" use:enhance>
                                                <input type="hidden" name="vacanteId" value={vac.id} />
                                                <button type="submit" class="text-stone-900 border border-stone-900 text-[9px] font-black uppercase px-2 py-0.5 hover:bg-stone-900 hover:text-white rounded-none transition">
                                                    Cerrar
                                                </button>
                                            </form>
                                        {:else}
                                            <span class="text-[9px] uppercase font-black text-stone-300">Clausurada</span>
                                        {/if}
                                    {/if}
                                </td>
                            </tr>
                        {:else}
                            <tr><td colspan="4" class="p-4 text-center text-stone-400 uppercase text-[10px]">Ninguna vacante emitida ni postulaciones entrantes.</td></tr>
                        {/each}
                    {/await}
                </tbody>
            </table>
        </div>
    </div>
{/if}

<dialog bind:this={refDialog} class="p-0 border border-stone-900 rounded-none shadow-2xl backdrop:backdrop-blur-xs w-full max-w-md bg-white">
    {#if usuarioDetalle}
        {@render plantillaDetalle(usuarioDetalle)}
    {/if}
</dialog>

{#snippet plantillaDetalle(u)}
    <div class="bg-stone-900 text-white p-3 flex justify-between items-center rounded-none">
        <div class="text-[10px] font-black uppercase tracking-wider">Ficha Técnica del Voluntario</div>
        <button type="button" onclick={cerrarDetalle} class="text-white hover:text-stone-400 font-black text-xs">✕</button>
    </div>
    <div class="p-4 space-y-3 font-mono text-xs text-stone-800">
        <div class="grid grid-cols-2 gap-2 border-b border-stone-100 pb-2">
            <div>
                <span class="text-[9px] font-black text-stone-400 uppercase block">Identificación</span>
                <span class="font-sans font-black uppercase text-stone-900 text-sm">{u.nombre} {u.apellido}</span>
            </div>
            <div>
                <span class="text-[9px] font-black text-stone-400 uppercase block">Cédula</span>
                <span class="font-bold text-stone-900">V-{u.cedula}</span>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-[11px]">
            <div>
                <span class="text-[9px] font-black text-stone-400 uppercase block">Género</span>
                <span class="uppercase">{u.genero}</span>
            </div>
            <div>
                <span class="text-[9px] font-black text-stone-400 uppercase block">Sangre</span>
                <span class="uppercase font-bold">{u.tipoSangre || 'N/E'}</span>
            </div>
            <div>
                <span class="text-[9px] font-black text-stone-400 uppercase block">Teléfono</span>
                <span>{u.telefono || 'N/A'}</span>
            </div>
            <div>
                <span class="text-[9px] font-black text-stone-400 uppercase block">Email</span>
                <span class="lowercase font-sans text-stone-600 block truncate">{u.correo}</span>
            </div>
        </div>

        <div class="border-t border-stone-100 pt-2 grid grid-cols-2 gap-2">
            <div>
                <span class="text-[9px] font-black text-stone-400 uppercase block">Profesión Registrada</span>
                <span class="uppercase font-bold text-stone-900 text-[10px]">{u.profesion || 'Ninguna'}</span>
            </div>
            <div>
                <span class="text-[9px] font-black text-stone-400 uppercase block">Puesto</span>
                <span class="uppercase font-bold text-stone-900 text-[10px]">{u.puesto || 'Voluntario'}</span>
            </div>
        </div>

        <div class="bg-stone-50 p-2 border border-stone-200">
            <span class="text-[9px] font-black text-stone-500 uppercase block">Disponibilidad declarada</span>
            <p class="font-sans text-[11px] text-stone-700 mt-0.5 leading-tight">{u.disponibilidad || 'Sin especificaciones añadidas.'}</p>
        </div>
        
        <button type="button" onclick={cerrarDetalle} class="w-full bg-stone-950 text-white py-1.5 text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-stone-800 transition">
            Cerrar Expediente
        </button>
    </div>
{/snippet}