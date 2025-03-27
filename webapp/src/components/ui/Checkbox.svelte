<script lang="ts">
  // Checkbox component with TypeScript and Svelte 5 runes
  import { createEventDispatcher } from 'svelte';
  import type { ValidatorFn } from './index';

  const props = $props<{
    id?: string;
    name?: string;
    label?: string;
    value?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    validators?: ValidatorFn[];
    helpText?: string;
    tooltipText?: string;
    validClass?: string;
    invalidClass?: string;
    labelClass?: string;
    inputClass?: string;
    groupClass?: string;
    validateOnChange?: boolean;
    switch?: boolean;
    indeterminate?: boolean;
  }>();

  // Default values
  const validateOnChange = $derived(props.validateOnChange || false);
  const validClass = $derived(props.validClass || 'is-valid');
  const invalidClass = $derived(props.invalidClass || 'is-invalid');
  const isSwitch = $derived(props.switch || false);

  // State
  let checked = $state(props.value || false);
  let isDirty = $state(false);
  let errorMessage = $state<string | null>(null);
  let id = $state(props.id || `checkbox-${Math.random().toString(36).substring(2, 9)}`);

  // Derived values
  const isValid = $derived(!errorMessage && isDirty);
  const showError = $derived(!!errorMessage);

  $effect(() => {
    // Update internal value when prop changes
    if (props.value !== undefined && props.value !== checked) {
      checked = props.value;
    }
  });

  // Checkbox classes
  const checkboxClasses = $derived(() => {
    const formCheckClass = isSwitch ? 'form-switch' : 'form-check';
    const classes = [formCheckClass];

    return classes.join(' ');
  });

  const inputClasses = $derived(() => {
    const classes = ['form-check-input'];

    // Validation state
    if (isDirty) {
      if (isValid) {
        classes.push(validClass);
      } else if (errorMessage) {
        classes.push(invalidClass);
      }
    }

    // Custom classes
    if (props.inputClass) {
      classes.push(props.inputClass);
    }

    return classes.join(' ');
  });

  const labelClasses = $derived(() => {
    const classes = ['form-check-label'];

    if (props.labelClass) {
      classes.push(props.labelClass);
    }

    return classes.join(' ');
  });

  // Validate the checkbox
  function validate(value: boolean): string | null {
    if (!props.validators || props.validators.length === 0) {
      return null;
    }

    for (const validator of props.validators) {
      const error = validator(value);
      if (error) {
        return error;
      }
    }

    return null;
  }

  // Event handlers
  function handleChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    checked = target.checked;
    isDirty = true;

    if (validateOnChange) {
      errorMessage = validate(checked);
    }

    // Dispatch change event
    dispatch('change', checked);
  }

  // Handle indeterminate state with actions
  let inputElement: HTMLInputElement;

  function setIndeterminate(element: HTMLInputElement, indeterminate: boolean) {
    if (indeterminate) {
      element.indeterminate = true;
      element.checked = false;
      checked = false;
    } else {
      element.indeterminate = false;
    }
  }

  $effect(() => {
    if (inputElement && props.indeterminate !== undefined) {
      setIndeterminate(inputElement, props.indeterminate);
    }
  });

  // Create a dispatcher to emit events
  const dispatch = createEventDispatcher<{
    change: boolean;
  }>();
</script>

<div class="form-group {props.groupClass || ''}">
  <div class={checkboxClasses}>
    <input
      bind:this={inputElement}
      {id}
      type="checkbox"
      name={props.name}
      checked={checked}
      disabled={props.disabled}
      readonly={props.readonly}
      required={props.required}
      class={inputClasses}
      on:change={handleChange}
    />

    {#if props.label}
      <label for={id} class={labelClasses}>
        {props.label}
        {#if props.required}
          <span class="required">*</span>
        {/if}
        {#if props.tooltipText}
          <span class="tooltip-icon" title={props.tooltipText}>ℹ️</span>
        {/if}
      </label>
    {/if}
  </div>

  {#if props.helpText && !showError}
    <small class="form-text text-muted">{props.helpText}</small>
  {/if}

  {#if showError}
    <div class="invalid-feedback">{errorMessage}</div>
  {/if}
</div>

<style>
  .form-group {
    margin-bottom: 1rem;
  }

  .form-check {
    display: flex;
    align-items: center;
    min-height: 1.5rem;
    padding-left: 1.5rem;
    margin-bottom: 0.125rem;
  }

  .form-switch {
    display: flex;
    align-items: center;
    min-height: 1.5rem;
    padding-left: 2.5rem;
    margin-bottom: 0.125rem;
  }

  .form-check-input {
    margin-left: -1.5rem;
    margin-right: 0.5rem;
    width: 1rem;
    height: 1rem;
    appearance: none;
    background-color: #fff;
    border: 1px solid #adb5bd;
    position: absolute;
  }

  .form-check-input[type="checkbox"] {
    border-radius: 0.25em;
  }

  .form-check-input:checked {
    background-color: #0d6efd;
    border-color: #0d6efd;
  }

  .form-check-input:checked[type="checkbox"] {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 10l3 3l6-6'/%3e%3c/svg%3e");
  }

  .form-switch .form-check-input {
    width: 2em;
    margin-left: -2.5em;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='rgba%280, 0, 0, 0.25%29'/%3e%3c/svg%3e");
    background-position: left center;
    border-radius: 2em;
    transition: background-position 0.15s ease-in-out;
  }

  .form-switch .form-check-input:checked {
    background-position: right center;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
  }

  .form-check-input:focus {
    border-color: #86b7fe;
    outline: 0;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  }

  .form-check-input:disabled {
    pointer-events: none;
    filter: none;
    opacity: 0.5;
  }

  .form-check-label {
    display: inline-block;
    cursor: pointer;
  }

  label {
    font-weight: 400;
  }

  .required {
    color: #dc3545;
    margin-left: 0.25rem;
  }

  .tooltip-icon {
    margin-left: 0.25rem;
    cursor: help;
    opacity: 0.7;
  }

  /* Validation states */
  .is-valid {
    border-color: #28a745;
  }

  .is-invalid {
    border-color: #dc3545;
  }

  .invalid-feedback {
    display: block;
    width: 100%;
    margin-top: 0.25rem;
    font-size: 0.875em;
    color: #dc3545;
  }

  .form-text {
    display: block;
    margin-top: 0.25rem;
  }
</style>
