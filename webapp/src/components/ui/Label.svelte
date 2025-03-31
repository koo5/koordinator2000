<script>
    export let htmlFor = undefined;
    export let className = undefined;
    let classes = '';

    $: {
        classes = className || '';
    }
</script>

<label for={htmlFor} class={classes}>
    <slot />
</label>
