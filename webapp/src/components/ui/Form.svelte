<script lang="ts">
  // Form component with TypeScript

  import { createEventDispatcher, onMount } from 'svelte';
  import type { ValidatorFn } from './index';

  // Types for form handling
  type FormValue = string | number | boolean | null | undefined;
  type FormValues = Record<string, FormValue>;
  type FormErrors = Record<string, string | null>;
  type ValidationResult = { valid: boolean; errors: FormErrors };

  // Cross-field validator function type
  type FormValidatorFn = (values: FormValues) => FormErrors;

  // Props
  export let id: string | undefined = undefined;
  export let initialValues: FormValues | undefined = undefined;
  export let validators: FormValidatorFn[] | undefined = undefined;
  export let noValidate = true;
  export let autocomplete: 'on' | 'off' | undefined = undefined;
  export let method: 'get' | 'post' | undefined = undefined;
  export let action: string | undefined = undefined;
  export let enableReinitialize = false;
  export let validateOnChange = false;
  export let validateOnBlur = false;
  export let validateOnSubmit = true;
  export let submitButtonText: string | undefined = undefined;
  export let resetButtonText: string | undefined = undefined;
  export let showResetButton = false;

  // Derived values
  $: formId = id || `form-${Math.random().toString(36).substring(2, 9)}`;

  // Form state
  let values: FormValues = initialValues || {};
  let errors: FormErrors = {};
  let touched: Record<string, boolean> = {};
  let submitting = false;
  let submitted = false;
  let isValid = true;

  // Form state derivations
  $: dirty = Object.keys(values).length > 0;
  $: pristine = !dirty;
  $: hasErrors = Object.values(errors).some(error => error !== null);

  // Reset the form
  function resetForm(): void {
    // Reset values to initial state
    values = initialValues || {};
    errors = {};
    touched = {};
    submitted = false;

    // Dispatch reset event
    dispatch('reset', values);
  }

  // Validate the entire form
  function validateForm(): ValidationResult {
    let formErrors: FormErrors = {};
    let isFormValid = true;

    // Run field validators
    for (const field of Object.keys(values)) {
      // Field validators would be implemented at the input level
      // This component handles form-level validation
    }

    // Run form-level validators
    if (validators && validators.length > 0) {
      for (const validator of validators) {
        const validationErrors = validator(values);

        // Merge errors
        formErrors = { ...formErrors, ...validationErrors };
      }
    }

    // Check if there are any errors
    const hasValidationErrors = Object.values(formErrors).some(error => error !== null);
    isFormValid = !hasValidationErrors;

    // Update form state
    errors = formErrors;
    isValid = isFormValid;

    return {
      valid: isFormValid,
      errors: formErrors
    };
  }

  // Handle form submission
  function handleSubmit(e: Event): void {
    e.preventDefault();

    submitted = true;

    if (validateOnSubmit) {
      submitting = true;
      const validation = validateForm();

      if (validation.valid) {
        // Dispatch submit event with values
        dispatch('submit', {
          values,
          event: e
        });
      } else {
        // Dispatch validation error event
        dispatch('validation-error', {
          errors: validation.errors,
          values
        });
      }

      submitting = false;
    } else {
      // Submit without validation
      dispatch('submit', {
        values,
        event: e
      });
    }
  }

  // Handle field change
  function handleChange(e: Event): void {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const name = target.name;
    const value = target.type === 'checkbox'
      ? (target as HTMLInputElement).checked
      : target.value;

    // Update field value
    values[name] = value;

    // Mark field as touched
    touched[name] = true;

    // Validate on change if enabled
    if (validateOnChange) {
      validateForm();
    }

    // Dispatch change event
    dispatch('field-change', {
      field: name,
      value,
      values
    });
  }

  // Handle field blur
  function handleBlur(e: Event): void {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const name = target.name;

    // Mark field as touched
    touched[name] = true;

    // Validate on blur if enabled
    if (validateOnBlur) {
      validateForm();
    }

    // Dispatch blur event
    dispatch('field-blur', {
      field: name,
      value: values[name],
      values
    });
  }

  // Set a field value programmatically
  function setFieldValue(field: string, value: FormValue): void {
    values[field] = value;

    if (validateOnChange) {
      validateForm();
    }

    dispatch('field-change', {
      field,
      value,
      values
    });
  }

  // Set multiple field values at once
  function setValues(newValues: FormValues): void {
    values = { ...values, ...newValues };

    if (validateOnChange) {
      validateForm();
    }

    dispatch('values-change', {
      values
    });
  }

  // Set field error programmatically
  function setFieldError(field: string, error: string | null): void {
    errors[field] = error;

    // Update isValid based on whether there are any errors
    isValid = !Object.values(errors).some(err => err !== null);

    dispatch('field-error', {
      field,
      error,
      errors
    });
  }

  // Expose form methods to parent components using Svelte context
  import { setContext } from 'svelte';

  setContext('form', {
    id,
    values,
    errors,
    touched,
    isValid,
    submitting,
    submitted,
    validateForm,
    setFieldValue,
    setValues,
    setFieldError,
    resetForm
  });

  // Effect to update values when initialValues change if enableReinitialize is true
  // Watch for initialValues changes if enableReinitialize is true
  $: if (enableReinitialize && initialValues) {
    values = initialValues;
  }

  // Create a dispatcher to emit events
  const dispatch = createEventDispatcher<{
    submit: { values: FormValues; event: Event };
    reset: FormValues;
    'validation-error': { errors: FormErrors; values: FormValues };
    'field-change': { field: string; value: FormValue; values: FormValues };
    'field-blur': { field: string; value: FormValue; values: FormValues };
    'field-error': { field: string; error: string | null; errors: FormErrors };
    'values-change': { values: FormValues };
  }>();
</script>

<form
  id={formId}
  {method}
  {action}
  {autocomplete}
  novalidate={noValidate}
  on:submit={handleSubmit}
  on:change={handleChange}
  on:blur={handleBlur}
  class="form"
  class:submitting
  class:submitted
  class:valid={isValid}
  class:invalid={!isValid}
>
  <slot
    values={values}
    errors={errors}
    touched={touched}
    isValid={isValid}
    submitting={submitting}
  />

  {#if !$$slots.actions}
    <div class="form-actions">
      <button type="submit" class="btn btn-primary" disabled={submitting}>
        {submitting ? 'Submitting...' : (submitButtonText || 'Submit')}
      </button>

      {#if showResetButton}
        <button
          type="button"
          class="btn btn-secondary"
          on:click={resetForm}
          disabled={submitting || pristine}>
          {resetButtonText || 'Reset'}
        </button>
      {/if}
    </div>
  {:else}
    <slot name="actions" />
  {/if}
</form>

<style>
  .form {
    width: 100%;
  }

  .form-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  .btn {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    cursor: pointer;
  }

  .btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .btn-primary {
    color: #fff;
    background-color: #0066cc;
    border-color: #0066cc;
  }

  .btn-primary:hover:not(:disabled) {
    background-color: #0056b3;
    border-color: #0056b3;
  }

  .btn-secondary {
    color: #fff;
    background-color: #6c757d;
    border-color: #6c757d;
  }

  .btn-secondary:hover:not(:disabled) {
    background-color: #5a6268;
    border-color: #5a6268;
  }
</style>
