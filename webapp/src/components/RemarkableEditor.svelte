<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';

    // Define types for the Remarkable library
    interface RemarkableInstance {
        render: (markdown: string) => string;
    }

    let md: RemarkableInstance | null = null;
    let value = 'Hello, **world**!';

    const initializeRemarkable = () => {
        if (browser && typeof window.remarkable !== 'undefined') {
            md = new window.remarkable.Remarkable();
        }
    };

    onMount(() => {
        // Try to initialize on mount in case the script has already loaded
        initializeRemarkable();
    });
</script>

<svelte:head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/remarkable/2.0.0/remarkable.min.js" on:load={initializeRemarkable}></script>
</svelte:head>

<div>
    <label for="markdown-content">
        Enter some markdown:<br />
        <textarea id="markdown-content" bind:value />
    </label>
    <h3>Rendering:</h3>
    <div class="content">
        {#if md}
            {@html md.render(value)}
        {/if}
    </div>
</div>
