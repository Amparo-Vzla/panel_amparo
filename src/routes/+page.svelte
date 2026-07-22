<script>
import {
    onMount
} from 'svelte';
import {
    enhance
} from '$app/forms';
import Header from '$lib/components/Header.svelte';

let {
    form
} = $props();

let cargando = $state(false);
let imagenActual = $state(0);
const imagenes = ['/img/auth/ingreso_1.jpg', '/img/auth/ingreso_2.jpg'];

onMount(() => {
    const interval = setInterval(() => {
        imagenActual = (imagenActual + 1) % imagenes.length;
    }, 5000);
    return () => clearInterval(interval);
});

const manejarSubmit = () => {
    cargando = true;
    return async ({
        update
    }) => {
        await update();
        cargando = false;
    };
};
</script>

<div class="grid grid-cols-1 md:grid-cols-2 min-h-screen md:h-screen w-full">

    <div class="relative hidden md:flex flex-col justify-between p-12 text-white h-full overflow-hidden">
        {#each imagenes as img, i}
        <div class="absolute inset-0 transition-opacity duration-1000 ease-in-out {imagenActual === i ? 'opacity-100' : 'opacity-0'}">
            <img src={img} alt="Fondo de Login" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-blue-950/60"></div>
        </div>
        {/each}

        <div class="relative z-10 flex flex-col justify-between h-full">
            <div class="flex items-center gap-2">
                <a href="/" class="text-[11px] flex gap-2 font-bold uppercase tracking-wider text-white">
                   <img src="img/logos/asterisco.png" alt="amparovzla" width="15"/> Amparo Venezuela
                </a>
            </div>

            <div class="space-y-4">
                <h2 class="text-4xl font-black uppercase tracking-tight leading-tight">
                    <span class="text-6xl">Juntos podemos</span>  asegurar que la ayuda llegue a quienes más lo necesitan
                </h2>
                <p class="text-xs text-blue-100/80 font-medium max-w-sm leading-relaxed">
                    Ingresa a tu panel de control para gestionar stock, reportar novedades en tiempo real y asegurar que la ayuda civil llegue de forma transparente a las comunidades más vulnerables.
                </p>
            </div>
        </div>
    </div>

    <div class="flex flex-col justify-center p-8 md:p-16 bg-white min-h-screen md:min-h-0 h-full">
        <div class="max-w-sm w-full mx-auto space-y-6">

            <Header
                titulo="Inicio de Sesión"
                error={form?.error}
                />

                <form method="POST" class="space-y-4" use:enhance={manejarSubmit}>
                    <div class="space-y-1">
                        <label for="email" class="text-[10px] font-bold uppercase tracking-wider text-stone-600">Correo Electrónico</label>
                        <input type="email" id="email" name="correo" required placeholder="NOMBRE@CORREO.COM"class=" lowercase" />
                    </div>

                    <div class="space-y-1">
                        <div class="flex justify-between items-center">
                            <label for="password" class="text-[10px] font-bold uppercase tracking-wider text-stone-600">Contraseña</label>
                        </div>
                        <input type="password" id="password" name="password" required placeholder="••••••••" />
                    </div>

                    <button type="submit" disabled={cargando}
                        class="w-full bg-blue-800 text-white p-3 text-xs font-bold uppercase tracking-wider hover:bg-blue-900 transition rounded-none shadow-xs mt-2 disabled:bg-stone-400 flex justify-center items-center gap-3">
                        ENTRAR A LA PLATAFORMA <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-right-dash-icon lucide-arrow-big-right-dash"><path d="M11 9a1 1 0 0 0 1-1V4.707a.707.707 0 0 1 1.207-.5l6.94 6.94a1.207 1.207 0 0 1 0 1.707l-6.94 6.94a.707.707 0 0 1-1.207-.5V16a1 1 0 0 0-1-1H9a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z"/><path d="M4 9v6"/></svg>
                    </button>
                </form>

                <div class="border-t border-stone-100 pt-4 text-center">
                    <p class="text-xs text-stone-500 font-medium">
                        ¿AÚN NO FORMAS PARTE?
                        <a href="/registro" class="text-blue-800 font-bold uppercase hover:underline block md:inline md:ml-1">Regístrate aquí</a>
                    </p>
                </div>

                </div>
                </div>

                </div>
