<script lang="ts">
    // Define the allowed input types
    type InputType = 'text' | 'password' | 'email' | 'number' | 'checkbox' | 'file' | 'radio' | 'date' | 'time' | 'datetime-local' | 'search' | 'tel' | 'url';

    // Define the allowed form control sizes
    type FormControlSize = 'sm' | 'lg' | undefined;

    // Component props with TypeScript types
    export let type: InputType = 'text';
    export let name: string | undefined = undefined;
    export let id: string | undefined = undefined;
    export let class_: string | undefined = undefined;
    export let placeholder: string | undefined = undefined;
    export let value: any = undefined;
    export let readonly: boolean = false;
    export let disabled: boolean = false;
    export let valid: boolean = true;
    export let invalid: boolean = false;
    export let bsSize: FormControlSize = undefined;
    export let checked: boolean = false;
    export let multiple: boolean = false;

    let classes = '';

    $: {
        let sizeClass = bsSize ? `form-control-${bsSize}` : '';
        classes = `${class_ || ''} form-control ${sizeClass} ${valid ? 'is-valid' : ''} ${invalid ? 'is-invalid' : ''}`.trim();
    }
</script>

{#if type === 'text'}
    <input type="text" {name} {id} class={classes} {placeholder} bind:value {readonly} {disabled} on:blur on:change on:click on:focus on:input on:keydown on:keypress on:keyup on:mousedown on:mouseup {...$$restProps} />
{:else if type === 'password'}
    <input type="password" {name} {id} class={classes} {placeholder} bind:value {readonly} {disabled} on:blur on:change on:click on:focus on:input on:keydown on:keypress on:keyup on:mousedown on:mouseup {...$$restProps} />
{:else if type === 'number'}
    <input type="number" {name} {id} class={classes} {placeholder} bind:value {readonly} {disabled} on:blur on:change on:click on:focus on:input on:keydown on:keypress on:keyup on:mousedown on:mouseup {...$$restProps} />
{:else if type === 'checkbox'}
    <input type="checkbox" {name} {id} class={classes} bind:checked={value} {readonly} {disabled} on:blur on:change on:click on:focus on:input on:keydown on:keypress on:keyup on:mousedown on:mouseup {...$$restProps} />
{:else if type === 'file'}
    <input type="file" {name} {id} class={classes} {placeholder} {readonly} {disabled} {multiple} on:blur on:change on:click on:focus on:input on:keydown on:keypress on:keyup on:mousedown on:mouseup {...$$restProps} />
{:else}
    <input {type} {name} {id} class={classes} {placeholder} value={value || ''} {readonly} {disabled} {checked} {multiple} on:blur on:change on:click on:focus on:input on:keydown on:keypress on:keyup on:mousedown on:mouseup {...$$restProps} />
{/if}
