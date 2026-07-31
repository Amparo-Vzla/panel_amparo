<script>
    import { superForm } from 'sveltekit-superforms';
    import { onMount } from 'svelte';
    import Header from '$lib/components/Header.svelte';
    import { resolve } from '$app/paths';
	import Input from '$lib/components/Input.svelte';

    let { data, form: actionResult } = $props();

    const { form, errors, enhance, delayed, message } = superForm(data.form, {
        onUpdated({ form: f }) {
            if (f.valid) {
                pasoActual = 1;
            }
        }
    });

    let pasoActual = $state(1);

    let imagenActual = $state(0);
    const imagenes = ['/img/auth/registro_1.jpg', '/img/auth/registro_2.webp'];

    const obtenerFechaMaxima18 = () => {
        const hoy = new Date();
        const añoMax = hoy.getFullYear() - 18;
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        return `${añoMax}-${mes}-${dia}`;
    };

    const fechaMaxima = obtenerFechaMaxima18();

    onMount(() => {
        const interval = setInterval(() => {
            imagenActual = (imagenActual + 1) % imagenes.length;
        }, 5000);
        return () => clearInterval(interval);
    });

    function siguientePaso() {
        pasoActual = 2;
    }

    function pasoAnterior() {
        pasoActual = 1;
    }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 w-full h-screen overflow-hidden">
    <div class="flex flex-col h-full overflow-y-auto p-6 md:p-12 bg-white border-b md:border-b-0 md:border-r w-full order-1">
        <div class="max-w-md w-full mx-auto space-y-2">
            <div>
                <Header
                    titulo="Registro"
                    exito={$message}
                    error={actionResult?.error}
                />
                <div class="flex items-center gap-2 pt-1">
                    <span class="text-[10px] font-black uppercase {pasoActual === 1 ? 'text-stone-900' : 'text-stone-400'}">01. Identificación</span>
                    <span class="h-px bg-stone-200 w-8"></span>
                    <span class="text-[10px] font-black uppercase {pasoActual === 2 ? 'text-stone-900' : 'text-stone-400'}">02. Capacidades</span>
                </div>
            </div>

            <form method="POST" class="w-full overflow-hidden" use:enhance>
                <div class="flex transition-transform duration-500 ease-in-out" style="transform: translateX(-{(pasoActual - 1) * 100}%);">
                    
                    <div class="min-w-full space-y-3 pr-2">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="space-y-1">
								<Input 
									label="Nombre"
									name="nombre"
									type="text"
									bind:value={$form.nombre}
									error={$errors.nombre}
									placeholder="LEE"
								/>
                            </div>
                            <div class="space-y-1">
								<Input 
									label="Apellidos"
									name="apellido"
									type="text"
									bind:value={$form.apellido}
									error={$errors.apellido}
									placeholder="LA POSTA"
								/>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="space-y-1">
                               <Input 
									label="Cédula" 
									name="cedula" 
									type="number" 
									bind:value={$form.cedula} 
									error={$errors.cedula} 
									placeholder="00000000"
								>
									<select name="nacionalidad" bind:value={$form.nacionalidad} class="w-min">
										<option value="V">V</option>
										<option value="E">E</option>
									</select>
								</Input>
                            </div>
                            <div class="space-y-1">
								<Input 
									label="Teléfono" 
									name="telefono" 
									type="tel" 
									bind:value={$form.telefono} 
									error={$errors.telefono} 
									placeholder="0000000"
								>
									<select name="codigo" bind:value={$form.codigo} class="w-min">
										<option value="0412">0412</option>
										<option value="0422">0422</option>
										<option value="0414">0414</option>
										<option value="0424">0424</option>
										<option value="0416">0416</option>
										<option value="0426">0426</option>
									</select>
								</Input>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3 border border-stone-200">
                            <div class="space-y-1">
                                <label for="genero" class="text-[10px] font-black uppercase tracking-wider text-stone-600">Género</label>
                                <select id="genero" name="genero" bind:value={$form.genero} >
                                    <option value="">SELECCIONE</option>
                                    <option value="M">MASCULINO</option>
                                    <option value="F">FEMENINO</option>
                                </select>
                                {#if $errors.genero}<p class="text-[10px] font-bold uppercase text-red-700">{$errors.genero}</p>{/if}
                            </div>
                            <div class="space-y-1">
								<Input 
									label="Fecha de Nacimiento"
									name="fechaNacimiento"
									type="date"
									bind:value={$form.fechaNacimiento}
									error={$errors.fechaNacimiento}
									max={fechaMaxima}
								/>
                            </div>
                        </div>

                        <div class="space-y-3">
							<Input 
								label="Correo Electronico"
								name="correo"
								type="email"
								bind:value={$form.correo}
								error={$errors.correo}
								placeholder="ejemplo@amparovzla.org"
							/>
							<Input 
								label="Contraseña"
								name="password"
								type="password"
								bind:value={$form.password}
								error={$errors.password}
							/>
							<Input 
								label="Confirmar Contraseña"
								name="password"
								id="verificar"
								type="password"
								bind:value={$form.verificar}
								error={$errors.verificar}
							/>
                        </div>

                        <button type="button" onclick={siguientePaso} class="w-full bg-stone-900 text-white p-3 text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition rounded-none flex justify-center items-center gap-3">
                            CONTINUAR <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-right-dash-icon lucide-arrow-big-right-dash"><path d="M11 9a1 1 0 0 0 1-1V4.707a.707.707 0 0 1 1.207-.5l6.94 6.94a1.207 1.207 0 0 1 0 1.707l-6.94 6.94a.707.707 0 0 1-1.207-.5V16a1 1 0 0 0-1-1H9a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z"/><path d="M4 9v6"/></svg>
                        </button>
                    </div>

                    <!-- PASO 2: CAPACIDADES -->
                    <div class="min-w-full space-y-3">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <label for="profesion" class="text-[10px] font-black uppercase tracking-wider text-stone-600">Ocupacion Principal</label>
                                <select id="profesion" name="profesionId" bind:value={$form.profesionId} >
                                    <option value="">SELECCIONE...</option>
                                    {#await data.profesiones}
                                        <option disabled>CARGANDO...</option>
                                    {:then list}
                                        {#each list as prof (prof.id)}
                                            <option value={prof.id}>{prof.nombre}</option>
                                        {/each}
                                    {/await}
                                </select>
                                {#if $errors.profesionId}<p class="text-[10px] font-bold uppercase text-red-700">{$errors.profesionId}</p>{/if}
                            </div>
                            
                            <div class="space-y-1">
                                <label for="disponibilidad" class="text-[10px] font-black uppercase tracking-wider text-stone-600">Disponibilidad</label>
                                <select id="disponibilidad" name="disponibilidad" bind:value={$form.disponibilidad} >
                                    <option value="">SELECCIONE</option>
                                    <option value="Diurna">DIURNA</option>
                                    <option value="Nocturna">NOCTURNA</option>
                                    <option value="Cualquiera">TIEMPO COMPLETO</option>
                                </select>
                                {#if $errors.disponibilidad}<p class="text-[10px] font-bold uppercase text-red-700">{$errors.disponibilidad}</p>{/if}
                            </div>
                        </div>

                        <div class="grid grid-cols-1 gap-3">
                            <div class="space-y-1">
                                <label for="tipoSangre" class="text-[10px] font-black uppercase tracking-wider text-stone-600">Tipo de Sangre</label>
                                <select id="tipoSangre" name="tipoSangre" bind:value={$form.tipoSangre} >
                                    <option value="">SELECCIONE</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                                {#if $errors.tipoSangre}<p class="text-[10px] font-bold uppercase text-red-700">{$errors.tipoSangre}</p>{/if}
                            </div>
                        </div>

                        <!-- SECCIÓN TALENTOS -->
                        <div class="border-t border-stone-200 pt-3">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-[10px] font-black uppercase text-stone-900 tracking-tight">Habilidades</span>
                                <span class="text-[9px] font-mono font-bold {($form.talentosIds || []).length === 4 ? 'text-amber-700' : 'text-stone-500'}">
                                    [{($form.talentosIds || []).length}/4]
                                </span>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-stone-200 bg-stone-50 p-2 max-h-36 overflow-y-auto rounded-none">
                                {#await data.talentos}
                                    <span class="text-[10px] font-bold text-stone-400 uppercase p-1">Cargando...</span>
                                {:then list}
                                    {#each list as t (t.id)}
                                        {@const checksExcedidos = ($form.talentosIds || []).length >= 4 && !($form.talentosIds || []).includes(t.id)}
                                        <label class="flex items-center gap-2 p-1 text-[10px] uppercase font-bold select-none rounded-none border border-transparent {checksExcedidos ? 'opacity-40 cursor-not-allowed' : 'hover:bg-stone-200/50 cursor-pointer text-stone-800'}">
                                            <input 
                                                type="checkbox" 
                                                name="talentosIds" 
                                                value={t.id} 
                                                bind:group={$form.talentosIds} 
                                                disabled={checksExcedidos}
                                                class="accent-stone-900 h-3.5 w-3.5 rounded-none border-stone-300"
                                            />
                                            {t.nombre}
                                        </label>
                                    {/each}
                                {/await}
                            </div>
                        </div>

                        <!-- SECCIÓN ÁREAS DE COBERTURA -->
                        <div class="border-t border-stone-200 pt-3">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-[10px] font-black uppercase text-stone-900 tracking-tight">Áreas de Cobertura</span>
                                <span class="text-[9px] font-mono font-bold {($form.areasIds || []).length === 4 ? 'text-amber-700' : 'text-stone-500'}">
                                    [{($form.areasIds || []).length}/4]
                                </span>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-stone-200 bg-stone-50 p-2 max-h-36 overflow-y-auto rounded-none">
                                {#await data.areasColaboracion}
                                    <span class="text-[10px] font-bold text-stone-400 uppercase p-1">Cargando...</span>
                                {:then list}
                                    {#each list as area (area.id)}
                                        {@const areasExcedidas = ($form.areasIds || []).length >= 4 && !($form.areasIds || []).includes(area.id)}
                                        <label class="flex items-center gap-2 p-1 text-[10px] uppercase font-bold select-none rounded-none border border-transparent {areasExcedidas ? 'opacity-40 cursor-not-allowed' : 'hover:bg-stone-200/50 cursor-pointer text-stone-800'}">
                                            <input 
                                                type="checkbox" 
                                                name="areasIds" 
                                                value={area.id} 
                                                bind:group={$form.areasIds} 
                                                disabled={areasExcedidas}
                                                class="accent-stone-900 h-3.5 w-3.5 rounded-none border-stone-300"
                                            />
                                            {area.nombre}
                                        </label>
                                    {/each}
                                {/await}
                            </div>
                        </div>

                        <div class="grid grid-cols-3 gap-2 pt-2">
                            <button type="button" onclick={pasoAnterior} class="bg-stone-200 text-stone-800 p-3 text-xs font-bold uppercase tracking-wider hover:bg-stone-300 transition rounded-none flex justify-center items-center gap-3">
                               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-left-dash-icon lucide-arrow-big-left-dash"><path d="M13 9a1 1 0 0 1-1-1V4.707a.707.707 0 0 0-1.207-.5l-6.94 6.94a1.207 1.207 0 0 0 0 1.707l6.94 6.94a.707.707 0 0 0 1.207-.5V16a1 1 0 0 1 1-1h2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z"/><path d="M20 9v6"/></svg> VOLVER
                            </button>
                            <button type="submit" disabled={$delayed} class="col-span-2 bg-stone-900 text-white p-3 text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition rounded-none disabled:bg-stone-400 flex justify-center items-center gap-3">
                                COMPLETAR REGISTRO <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                            </button>
                        </div>
                    </div>

                </div>
            </form>

            <div class="text-center pt-4">
                <p class="text-xs text-stone-500 font-medium">
                    ¿YA TIENES CUENTA?
                    <a href={resolve('/')} class="text-stone-900 font-bold uppercase hover:underline block md:inline md:ml-1">INICIA SESIÓN AQUÍ</a>
                </p>
            </div>
        </div>
    </div>

    <div class="relative hidden md:flex flex-col justify-between p-12 text-white h-full order-2 overflow-hidden bg-stone-950">
        {#each imagenes as img, i (img)}
        <div class="absolute inset-0 transition-opacity duration-1000 ease-in-out {imagenActual === i ? 'opacity-100' : 'opacity-0'}">
            <img src={img} alt="FONDO DE REGISTRO" class="w-full h-full object-cover animate-fade" />
            <div class="absolute inset-0 bg-red-950/60"></div>
        </div>
        {/each}
        <div class="relative z-10 flex flex-col justify-between h-full">
            <div class="flex items-center gap-2">
                <a href={resolve('/')} class="text-[11px] flex gap-2 font-bold uppercase tracking-wider text-white">
                   <img src="img/logos/asterisco.png" alt="amparovzla" width="15"/> Amparo Venezuela
                </a>
            </div>
            <div class="space-y-4">
                <h2 class="text-4xl font-black uppercase tracking-tight leading-tight">TU ACCIÓN AYUDA A LEVANTAR <span class="text-6xl">CORAZONES</span></h2>
                <p class="text-xs text-stone-300 font-medium max-w-sm leading-relaxed">
                    Al registrarse, podras colaborar en la gestion del inventario, reportar novedades en tiempo real y asegurar que la ayuda civil llegue de forma transparente.
                </p>
            </div>
        </div>
    </div>
</div>