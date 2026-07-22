<script>
import {
    page
} from '$app/stores';
let {
    data,
    children
} = $props();
let menuAbierto = $state(false);
const enlaces = [{
        nombre: 'Inicio',
        ruta: '/dashboard',
        roles: ['ADMIN', 'ENCARGADO', 'VOLUNTARIO']
    },
    {
        nombre: 'Solicitudes',
        ruta: '/dashboard/administracion/organizaciones',
        roles: ['ADMIN']
    },
    {
        nombre: 'Recursos',
        ruta: '/dashboard/administracion/recursos',
        roles: ['ADMIN']
    },
    {
        nombre: 'Talentos',
        ruta: '/dashboard/administracion/habilidades',
        roles: ['ADMIN']
    },

    {
        nombre: 'Envios',
        ruta: '/dashboard/acopio/envios',
        roles: ['ENCARGADO']
    },
    {
        nombre: 'Solicitudes',
        ruta: '/dashboard/acopio/solicitudes',
        roles: ['ENCARGADO']
    },
    {
        nombre: 'Inventario',
        ruta: '/dashboard/acopio/inventario',
        roles: ['ENCARGADO']
    },
    {
        nombre: 'Personal',
        ruta: '/dashboard/acopio/personal',
        roles: ['ENCARGADO']
    },

    {
        nombre: 'Buscame',
        ruta: '/dashboard/personas',
        roles: ['ENCARGADO', 'VOLUNTARIO', 'ADMIN']
    },
    {
        nombre: 'Vacantes',
        ruta: '/dashboard/vacantes',
        roles: ['VOLUNTARIO']
    },

    // Nueva ruta protegida por rol y posesión de vehículo
    {
        nombre: 'Encomiendas',
        ruta: '/dashboard/encomiendas',
        roles: ['ADMIN', 'ENCARGADO', 'VOLUNTARIO'],
        requiereVehiculo: true
    }
];

// Reactividad Svelte 5: Filtra por Rol y por Vehículo simultáneamente
let enlacesFiltrados = $derived(
    enlaces.filter(enlace => {
        const tieneRol = enlace.roles.includes(data.user ?.rol);
        const cumpleVehiculo = !enlace.requiereVehiculo || !!data.user ?.tieneVehiculo;

        return tieneRol && cumpleVehiculo;
    })
);
</script>

<div class="flex h-screen w-screen bg-stone-100 font-sans text-stone-900 selection:bg-amber-400 overflow-hidden">
    <aside class="hidden md:flex w-64 flex-col bg-slate-900 border-r border-slate-800 p-5 shrink-0 h-full text-white">

        <nav class="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
            {#each enlacesFiltrados as enlace}
            <a
                href={enlace.ruta}
                class="block w-full p-2.5 text-xs font-bold uppercase border transition rounded-none
                {$page.url.pathname === enlace.ruta
                ? 'bg-blue-700 border-blue-700 text-white'
                : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-white'}"
                >
                {enlace.nombre}
            </a>
            {/each}
        </nav>
        <div class="border-t border-slate-800 pt-3 mt-2 space-y-2">
            <a
                href="/dashboard/reportes"
                class="block w-full p-2.5 text-xs font-bold uppercase border transition rounded-none
                {$page.url.pathname === '/dashboard/reportes'
                ? 'bg-blue-700 border-blue-700 text-white'
                : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-white'}"
                >
                Denuncias
            </a>

            <a href="/dashboard/perfil" class="block group">
                <div class="bg-slate-950 p-3 border border-slate-800 transition group-hover:border-slate-700">
                    <p class="text-xs font-bold text-slate-300 truncate uppercase group-hover:text-blue-400 transition">{data.user?.nombre} {data.user?.apellido}</p>
                    <span class="inline-block mt-1 bg-blue-950 border border-blue-800 text-[10px] font-black uppercase text-blue-400 px-1.5 py-0.5 rounded-none">
                        {data.user?.rol}
                    </span>
                </div>
            </a>

            <form method="POST" action="/dashboard?/logout" class="w-full pt-1">
                <button type="submit" class="block w-full text-center p-2.5 text-xs font-bold uppercase border border-red-900/60 bg-red-950/40 text-red-400 hover:bg-red-900/40 transition rounded-none">
                    Cerrar Sesión
                </button>
            </form>
        </div>
    </aside>

    {#if menuAbierto}
    <input
        onclick={() => menuAbierto = false}
    class="md:hidden fixed inset-0 bg-stone-950/60 backdrop-blur-xs z-40 transition-opacity"
    type="button"
    />
    {/if}

    <div class="md:hidden fixed bottom-14 left-0 right-0 bg-slate-900 text-white border-t-2 border-slate-800 z-50 p-4 transition-transform duration-300 transform rounded-none max-h-[75vh] overflow-y-auto
        {menuAbierto ? 'translate-y-0' : 'translate-y-full'}"
        >
        <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
            <p class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Módulos Habilitados</p>
            <span class="text-[9px] bg-blue-950 border border-blue-800 text-blue-400 font-bold uppercase px-1.5 py-0.5 rounded-none">{data.user?.rol}</span>
        </div>

        <div class="flex flex-col gap-1.5">
            {#each enlacesFiltrados as enlace}
            <a
                href={enlace.ruta}
                onclick={() => menuAbierto = false}
                class="w-full p-3 text-left text-xs font-bold uppercase border transition rounded-none block
                {$page.url.pathname === enlace.ruta
                ? 'bg-blue-700 border-blue-700 text-white'
                : 'bg-slate-850/50 border-slate-800 text-slate-300 hover:bg-slate-800'}"
                >
                {enlace.nombre}
            </a>
            {/each}

            <div class="border-t border-slate-800 pt-3 mt-2 space-y-2">
                <a
                    href="/dashboard/reportes"
                    onclick={() => menuAbierto = false}
                    class="w-full p-3 text-left text-xs font-bold uppercase border transition rounded-none block
                    {$page.url.pathname === '/dashboard/reportes'
                    ? 'bg-blue-700 border-blue-700 text-white'
                    : 'bg-slate-850/50 border-slate-800 text-slate-300'}"
                    >
                    Denuncias
                </a>

                <a href="/dashboard/perfil" onclick={() => menuAbierto = false} class="block">
                    <div class="bg-slate-950 p-3 border border-slate-800">
                        <p class="text-xs font-bold text-slate-300 truncate uppercase">{data.user?.nombre} {data.user?.apellido}</p>
                        <span class="text-[9px] text-slate-500 block mt-0.5 uppercase">Ver perfil de usuario</span>
                    </div>
                </a>

                <form method="POST" action="/dashboard?/logout" class="w-full pt-1">
                    <button type="submit" class="w-full p-3 text-center text-xs font-bold uppercase border border-red-900 bg-red-950/40 text-red-400 rounded-none">
                        Cerrar Sesión
                    </button>
                </form>
            </div>
        </div>
    </div>

    <nav class="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-slate-950 border-t border-slate-800 z-50 flex items-center justify-between px-6 text-white">
        <a href="/dashboard" class="flex flex-col items-start justify-center h-full">
            <span class="text-[9px] font-black uppercase tracking-wider text-slate-500">Plataforma</span>
            <span class="text-xs font-bold text-white truncate max-w-[140px]">AmparoVZLA</span>
        </a>

        <button
            onclick={() => menuAbierto = !menuAbierto}
            class="flex h-10 px-6 items-center justify-center font-black uppercase text-xs transition border rounded-none tracking-wider
            {menuAbierto ? 'bg-red-600 border-red-600 text-white' : 'bg-blue-700 border-blue-700 text-white'}"
            >
            {menuAbierto ? 'Ocultar' : 'Menú'}
        </button>
    </nav>

    <main class="flex-1 h-full w-full p-2 md:p-8 pb-20 md:pb-8 overflow-y-auto">
        {@render children()}
    </main>

</div>

<style>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #334155;
}
</style>
