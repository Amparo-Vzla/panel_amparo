<script>
    import { enhance } from '$app/forms';
    import Header from '$lib/components/Header.svelte';

    let { data, form } = $props();
    
    // Estados reactivos de control de interfaz en Svelte 5
    let catalogoSeleccionado = $state('PROFESION');
    let filtroTablaActivo = $state('PROFESION');
</script>

<Header 
    titulo="Gestión de Cualidades y Estructura" 
    descripcion="Administración centralizada de profesiones, talentos, áreas civiles y puestos de asignación." 
    info=""
    error={form?.error}
    exito={form?.exito}
/>

<div class="space-y-4">
    <form method="POST" action="?/crearItem" use:enhance class="bg-white p-4 border border-stone-200 rounded-none space-y-4">

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="space-y-1">
                <label class="text-[10px] font-black uppercase text-stone-500 block">Catálogo</label>
                <select name="tipoCat" bind:value={catalogoSeleccionado} required
                    class="w-full border border-stone-200 bg-stone-50 p-2 text-xs font-bold uppercase text-stone-900 focus:outline-none rounded-none">
                    <option value="PROFESION">Profesiones</option>
                    <option value="TALENTO">Habilidades / Talentos</option>
                    <option value="PUESTO">Puestos de Trabajo</option>
                    <option value="AREA">Áreas de Colaboración</option>
                </select>
            </div>

            <div class="space-y-1 md:col-span-2">
                <label class="text-[10px] font-black uppercase text-stone-500 block">Nombre</label>
                <input type="text" name="nombre" placeholder="EJ. LOGÍSTICA DE RESCATE, ENFERMERO JEFE, CARPINTERÍA" required
                    class="w-full border border-stone-200 bg-stone-50 p-2 text-xs font-mono text-stone-900 placeholder:text-stone-300 focus:outline-none rounded-none uppercase" />
            </div>
        </div>

        {#if catalogoSeleccionado === 'AREA'}
            <div class="space-y-1">
                <label class="text-[10px] font-black uppercase text-stone-500 block">Descripción del Área (Opcional)</label>
                <textarea name="descripcion" placeholder="Parámetros logísticos, propósito o alcance del área civil..." rows="2"
                    class="w-full border border-stone-200 bg-stone-50 p-2 text-xs font-mono text-stone-900 placeholder:text-stone-300 focus:outline-none rounded-none"></textarea>
            </div>
        {/if}

        <div class="flex justify-end">
            <button type="submit" 
                class="bg-stone-900 text-white px-6 py-2 text-xs font-bold uppercase tracking-wider hover:bg-black transition rounded-none">
                Guardar
            </button>
        </div>
    </form>

    <div class="bg-white border border-stone-200 rounded-none">
        <div class="border-b border-stone-200 bg-stone-50 flex flex-wrap text-[10px] font-black uppercase tracking-wider">
            <button type="button" onclick={() => filtroTablaActivo = 'PROFESION'}
                class="px-4 py-2.5 border-r border-stone-200 transition focus:outline-none rounded-none
                {filtroTablaActivo === 'PROFESION' ? 'bg-white text-stone-900 font-black' : 'text-stone-400 hover:bg-stone-100'}">
                Profesiones
            </button>
            <button type="button" onclick={() => filtroTablaActivo = 'TALENTO'}
                class="px-4 py-2.5 border-r border-stone-200 transition focus:outline-none rounded-none
                {filtroTablaActivo === 'TALENTO' ? 'bg-white text-stone-900 font-black' : 'text-stone-400 hover:bg-stone-100'}">
                Habilidades
            </button>
            <button type="button" onclick={() => filtroTablaActivo = 'PUESTO'}
                class="px-4 py-2.5 border-r border-stone-200 transition focus:outline-none rounded-none
                {filtroTablaActivo === 'PUESTO' ? 'bg-white text-stone-900 font-black' : 'text-stone-400 hover:bg-stone-100'}">
                Puestos
            </button>
            <button type="button" onclick={() => filtroTablaActivo = 'AREA'}
                class="px-4 py-2.5 transition focus:outline-none rounded-none
                {filtroTablaActivo === 'AREA' ? 'bg-white text-stone-900 font-black' : 'text-stone-400 hover:bg-stone-100'}">
                Áreas Civiles
            </button>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse m-0">
                <thead>
                    <tr class="bg-stone-50 border-b border-stone-200 text-[10px] font-black uppercase text-stone-600">
                        <th class="p-2.5 pl-4 w-1/3">CODIGO</th>
                        <th class="p-2.5 w-1/2">Nombre</th>
                        {#if filtroTablaActivo === 'AREA'}
                            <th class="p-2.5 pr-4">Descripción</th>
                        {/if}
                    </tr>
                </thead>
                <tbody class="divide-y divide-stone-100 text-xs font-mono text-stone-700">
                    
                    {#if filtroTablaActivo === 'PROFESION'}
                        {#await data.profesiones}
                            <tr><td colspan="2" class="p-4 text-center text-stone-400 uppercase text-[10px] font-black animate-pulse">Sincronizando profesiones...</td></tr>
                        {:then lista}
                            {#each lista as p}
                                <tr class="hover:bg-stone-50/50 transition">
                                    <td class="p-2.5 pl-4 text-[10px] text-stone-400">{p.id}</td>
                                    <td class="p-2.5 font-bold text-stone-900 uppercase text-[11px]">{p.nombre}</td>
                                </tr>
                            {:else}
                                <tr><td colspan="2" class="p-4 text-center text-stone-400 uppercase text-[10px]">Cero profesiones base registradas.</td></tr>
                            {/each}
                        {/await}
                    {/if}

                    {#if filtroTablaActivo === 'TALENTO'}
                        {#await data.talentos}
                            <tr><td colspan="2" class="p-4 text-center text-stone-400 uppercase text-[10px] font-black animate-pulse">Sincronizando habilidades...</td></tr>
                        {:then lista}
                            {#each lista as t}
                                <tr class="hover:bg-stone-50/50 transition">
                                    <td class="p-2.5 pl-4 text-[10px] text-stone-400">{t.id}</td>
                                    <td class="p-2.5 font-bold text-stone-900 uppercase text-[11px]">{t.nombre}</td>
                                </tr>
                            {:else}
                                <tr><td colspan="2" class="p-4 text-center text-stone-400 uppercase text-[10px]">Cero talentos cargados en cartelera.</td></tr>
                            {/each}
                        {/await}
                    {/if}

                    {#if filtroTablaActivo === 'PUESTO'}
                        {#await data.puestos}
                            <tr><td colspan="2" class="p-4 text-center text-stone-400 uppercase text-[10px] font-black animate-pulse">Sincronizando puestos...</td></tr>
                        {:then lista}
                            {#each lista as pst}
                                <tr class="hover:bg-stone-50/50 transition">
                                    <td class="p-2.5 pl-4 text-[10px] text-stone-400">{pst.id}</td>
                                    <td class="p-2.5 font-bold text-stone-900 uppercase text-[11px]">{pst.nombre}</td>
                                </tr>
                            {:else}
                                <tr><td colspan="2" class="p-4 text-center text-stone-400 uppercase text-[10px]">Cero puestos configurados para asignación.</td></tr>
                            {/each}
                        {/await}
                    {/if}

                    {#if filtroTablaActivo === 'AREA'}
                        {#await data.areasColaboracion}
                            <tr><td colspan="3" class="p-4 text-center text-stone-400 uppercase text-[10px] font-black animate-pulse">Sincronizando sectores civiles...</td></tr>
                        {:then lista}
                            {#each lista as a}
                                <tr class="hover:bg-stone-50/50 transition">
                                    <td class="p-2.5 pl-4 text-[10px] text-stone-400">{a.id}</td>
                                    <td class="p-2.5 font-bold text-stone-900 uppercase text-[11px]">{a.nombre}</td>
                                    <td class="p-2.5 pr-4 text-stone-500 font-sans text-[11px] leading-tight">{a.descripcion || 'Sin descripción logística asignada.'}</td>
                                </tr>
                            {:else}
                                <tr><td colspan="3" class="p-4 text-center text-stone-400 uppercase text-[10px]">Cero áreas operacionales declaradas.</td></tr>
                            {/each}
                        {/await}
                    {/if}

                </tbody>
            </table>
        </div>
    </div>
</div>