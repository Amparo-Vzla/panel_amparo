<script>
    import '../global.css';
    import favicon from '$lib/assets/favicon.svg';
    let { children } = $props();
    let menuAbierto = $state(false);
</script>

<svelte:head>
    <link rel="icon" type="image/svg+xml" href={favicon} />
</svelte:head>

    <main class="flex-1">
        {@render children()}
    </main>