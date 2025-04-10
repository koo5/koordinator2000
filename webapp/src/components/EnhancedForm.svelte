<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { createForm } from '$lib/form-utils.ts';

    // Define types for form data and validators
    type FormData = Record<string, any>;
    type Validator = (value: any) => string | null;
    type FieldValidators = Record<string, Validator>;

    interface FormEvents {
        success: any;
        error: Error;
        reset: void;
    }

    // Create an event dispatcher with typed events
    const dispatch = createEventDispatcher<FormEvents>();

    // Form props with type annotations
    export let initialData: FormData = {};
    export let onSubmit: (data: FormData) => Promise<any> = async data => {};
    export let fieldValidators: FieldValidators = {};
    export let submitText = 'Submit';
    export let resetText = 'Reset';
    export let showReset = true;
    export let loading = false;

    // Create form handler
    const form = createForm(initialData, async (data: FormData) => {
        loading = true;
        try {
            const result = await onSubmit(data);
            dispatch('success', result);
            return result;
        } catch (error) {
            dispatch('error', error as Error);
            throw error;
        } finally {
            loading = false;
        }
    });

    // Additional methods
    export function reset(): void {
        form.resetForm();
        dispatch('reset');
    }

    export function validate(): boolean {
        // Validation logic
        let isValid = true;

        // Add type safety for field validators
        for (const [field, validator] of Object.entries(fieldValidators) as Array<[string, Validator]>) {
            // Ensure field exists in form data
            if (field in form.data) {
                const error = validator(form.data[field]);
                if (error) {
                    isValid = false;
                    break;
                }
            }
        }

        return isValid;
    }
</script>

<form on:submit|preventDefault={form.handleSubmit} class="enhanced-form">
    <slot name="header"></slot>

    <div class="form-fields">
        <slot {form}></slot>
    </div>

    {#if form.errors._form}
        <div class="form-error">
            {form.errors._form}
        </div>
    {/if}

    <div class="form-actions">
        <button type="submit" disabled={loading} class="submit-button">
            {#if loading}
                <span class="loading-indicator"></span>
            {/if}
            {submitText}
        </button>

        {#if showReset}
            <button type="button" on:click={reset} disabled={loading} class="reset-button">
                {resetText}
            </button>
        {/if}

        <slot name="actions"></slot>
    </div>
</form>

<style>
    .enhanced-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }

    .form-fields {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .form-error {
        color: #d32f2f;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        padding: 0.5rem;
        background-color: rgba(211, 47, 47, 0.1);
        border-radius: 0.25rem;
    }

    .form-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
    }

    .submit-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background-color: #0d6efd;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        font-weight: 500;
    }

    .submit-button:hover {
        background-color: #0b5ed7;
    }

    .submit-button:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
    }

    .reset-button {
        padding: 0.5rem 1rem;
        background-color: transparent;
        color: #6c757d;
        border: 1px solid #6c757d;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    .reset-button:hover {
        background-color: rgba(108, 117, 125, 0.1);
    }

    .loading-indicator {
        display: inline-block;
        width: 1rem;
        height: 1rem;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
