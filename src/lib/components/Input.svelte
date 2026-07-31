<script>
    let {
        label = '',
        name,
        id = name,
        type = 'text',
        value = $bindable(''),
        error = null,
        placeholder = '',
        class: className = '',
        children,
        ...restProps
    } = $props();
</script>

<div class="space-y-1 w-full">
    {#if label}
        <label for={id} class="text-[10px] font-black uppercase tracking-wider text-stone-600 block">
            {label}
        </label>
    {/if}

    <div class="flex w-full">
        {#if children}
            {@render children()}
        {/if}

        <input
            {type}
            {id}
            {name}
            bind:value
            {placeholder}
            class={`w-full ${error ? '!border-red-600 focus:!border-red-600' : ''} ${className}`}
            {...restProps}
        />
    </div>

    {#if error}
        <p class="text-[10px] font-medium text-red-600 normal-case leading-tight pt-0.5">
            {error}
        </p>
    {/if}
</div>