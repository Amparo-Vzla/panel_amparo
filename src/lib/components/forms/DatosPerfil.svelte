<script>
    import { enhance } from '$app/forms';

    let { 
        perfilPromesa, 
        profesionesPromesa, 
        talentosPromesa, 
        areasColaboracionPromesa 
    } = $props();

    let selectedTalents = $state([]);
    let selectedAreas = $state([]);

    $effect(() => {
        perfilPromesa.then(perfil => {
            if (perfil) {
                selectedTalents = [perfil.talento1, perfil.talento2, perfil.talento3, perfil.talento4].filter(Boolean);
                selectedAreas = [perfil.colaboracion1, perfil.colaboracion2, perfil.colaboracion3, perfil.colaboracion4].filter(Boolean);
            }
        });
    });
</script>

<div class="space-y-6">
    {#await Promise.all([perfilPromesa, profesionesPromesa, talentosPromesa, areasColaboracionPromesa])}
        <div class="bg-white border border-stone-200 p-4 rounded-none space-y-4 animate-pulse">
            <div class="h-3 bg-stone-200 w-1/4 rounded-none"></div>
            <div class="grid grid-cols-2 gap-3">
                <div class="h-8 bg-stone-100 rounded-none"></div>
                <div class="h-8 bg-stone-100 rounded-none"></div>
            </div>
        </div>
    {:then [perfil, profesiones, talentos, areasColaboracion]}
        <div class="bg-white border border-stone-200 p-4 rounded-none">
            <h3 class="text-[10px] font-black uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2 mb-4">
                Datos Personales
            </h3>
            
            <form method="POST" action="?/actualizarDatos" use:enhance class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <label for="nombre" class="text-[10px] font-black uppercase text-stone-600">Nombres</label>
                        <input type="text" name="nombre" value={perfil.nombre || ''} required />
                    </div>
                    <div class="space-y-1">
                        <label for="apellido" class="text-[10px] font-black uppercase text-stone-600">Apellidos</label>
                        <input type="text" name="apellido" value={perfil.apellido || ''} required />
                    </div>
                </div>

                <div class="space-y-1">
                    <label for="cedula" class="text-[10px] font-black uppercase text-stone-400">Documento de Identidad</label>
                    <input type="text" id="cedula" value={perfil.cedula || ''} readonly class="w-full border border-stone-200 bg-stone-100 text-stone-500 p-2 text-xs font-mono font-bold rounded-none cursor-not-allowed" />
                    <label for="telefono" class="text-[10px] font-black uppercase text-stone-400">Número de Teléfono</label>
                    <input type="text" id="telefono" name="telefono" value={perfil.telefono || ''} />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div class="space-y-1">
                        <label for="tipoSangre" class="text-[10px] font-black uppercase text-stone-600">Grupo Sanguíneo</label>
                        <select id="tipoSangre" name="tipoSangre" value={perfil.tipoSangre || ''} required >
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                        </select>
                    </div>
                    <div class="space-y-1 sm:col-span-2">
                        <label for="disponibilidad" class="text-[10px] font-black uppercase text-stone-600">Disponibilidad</label>
                        <select id="disponibilidad" name="disponibilidad" value={perfil.disponibilidad || 'Cualquiera'} >
                            <option value="Diurna">DIURNA</option>
                            <option value="Nocturna">NOCTURNA</option>
                            <option value="Cualquiera">COMPLETA</option>
                        </select>
                    </div>
                </div>

                <div class="space-y-1">
                    <label for="profesionId" class="text-[10px] font-black uppercase text-stone-600">Profesion / Oficio</label>
                    <select id="profesionId" name="profesionId" value={perfil.profesionId || ''} >
                        {#each profesiones as prof}
                            <option value={prof.id}>{prof.nombre.toUpperCase()}</option>
                        {/each}
                    </select>
                </div>

                <!-- Selección de Talentos (Máx 4) -->
                <div class="border-t border-stone-200 pt-3">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[10px] font-black uppercase text-stone-900 tracking-tight">Talentos y Habilidades</span>
                        <span class="text-[9px] font-mono font-bold {selectedTalents.length === 4 ? 'text-amber-700' : 'text-stone-500'}">
                            [{selectedTalents.length}/4]
                        </span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-stone-200 bg-stone-50 p-2 max-h-36 overflow-y-auto rounded-none">
                        {#each talentos as t}
                            {@const checksExcedidos = selectedTalents.length >= 4 && !selectedTalents.includes(t.id)}
                            <label class="flex items-center gap-2 p-1 text-[10px] uppercase font-bold select-none rounded-none border border-transparent {checksExcedidos ? 'opacity-40 cursor-not-allowed' : 'hover:bg-stone-200/50 cursor-pointer text-stone-800'}">
                                <input 
                                    type="checkbox" 
                                    name="talentosIds" 
                                    value={t.id} 
                                    bind:group={selectedTalents} 
                                    disabled={checksExcedidos}
                                    class="accent-stone-900 h-3.5 w-3.5 rounded-none border-stone-300"
                                />
                                {t.nombre}
                            </label>
                        {/each}
                    </div>
                </div>

                <!-- Selección de Áreas (Máx 4) -->
                <div class="border-t border-stone-200 pt-3">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[10px] font-black uppercase text-stone-900 tracking-tight">Áreas de Cobertura</span>
                        <span class="text-[9px] font-mono font-bold {selectedAreas.length === 4 ? 'text-amber-700' : 'text-stone-500'}">
                            [{selectedAreas.length}/4]
                        </span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-stone-200 bg-stone-50 p-2 max-h-36 overflow-y-auto rounded-none">
                        {#each areasColaboracion as area}
                            {@const areasExcedidas = selectedAreas.length >= 4 && !selectedAreas.includes(area.id)}
                            <label class="flex items-center gap-2 p-1 text-[10px] uppercase font-bold select-none rounded-none border border-transparent {areasExcedidas ? 'opacity-40 cursor-not-allowed' : 'hover:bg-stone-200/50 cursor-pointer text-stone-800'}">
                                <input 
                                    type="checkbox" 
                                    name="areasIds" 
                                    value={area.id} 
                                    bind:group={selectedAreas} 
                                    disabled={areasExcedidas}
                                    class="accent-stone-900 h-3.5 w-3.5 rounded-none border-stone-300"
                                />
                                {area.nombre}
                            </label>
                        {/each}
                    </div>
                </div>

                <div class="flex justify-end pt-2 border-t border-stone-200">
                    <button type="submit" class="bg-stone-900 hover:bg-stone-800 text-white font-black uppercase text-[10px] tracking-wider px-5 py-2.5 rounded-none transition">
                        GUARDAR
                    </button>
                </div>
            </form>
        </div>

        <!-- Bloque 2: Credenciales de Acceso -->
        <div class="bg-white border border-stone-200 p-4 rounded-none">
            <h3 class="text-[10px] font-black uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2 mb-4">
                2. Credenciales de la Cuenta
            </h3>
            <form method="POST" action="?/cambiarClave" use:enhance class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <label for="correo" class="text-[10px] font-black uppercase text-stone-600">Correo Electrónico</label>
                        <input type="email" id="correo" name="correo" value={perfil.correo || ''} required class="w-full border border-stone-200 bg-stone-50 p-2 text-xs focus:outline-none focus:border-stone-900 rounded-none font-mono" />
                    </div>
                    <div class="space-y-1">
                        <label for="nuevaClave" class="text-[10px] font-black uppercase text-stone-600">Nueva Contraseña</label>
                        <input type="password" id="nuevaClave" name="nuevaClave" placeholder="INGRESAR SOLO PARA MODIFICAR" class="w-full border border-stone-200 bg-stone-50 p-2 text-xs focus:outline-none focus:border-stone-900 rounded-none tracking-widest font-mono" />
                    </div>
                </div>
                <div class="flex justify-end pt-1">
                    <button type="submit" class="bg-blue-700 hover:bg-blue-800 text-white font-black uppercase text-[10px] tracking-wider px-4 py-2 rounded-none transition">
                        GUARDAR
                    </button>
                </div>
            </form>
        </div>
    {/await}
</div>