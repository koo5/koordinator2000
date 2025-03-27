<script lang="ts">
  // Input component with TypeScript and Svelte 5 runes

  type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';
  type InputSize = 'sm' | 'md' | 'lg';

  // Generic validator function type
  type ValidatorFn = (value: any) => string | null;

  const props = $props<{
    id?: string;
    name?: string;
    label?: string;
    type?: InputType;
    value?: string | number;
    placeholder?: string;
    size?: InputSize;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    min?: number | string;
    max?: number | string;
    maxLength?: number;
    autofocus?: boolean;
    autocomplete?: string;
    validators?: ValidatorFn[];
    helpText?: string;
    tooltipText?: string;
    validClass?: string;
    invalidClass?: string;
    labelClass?: string;
    inputClass?: string;
    groupClass?: string;
    validateOnBlur?: boolean;
    validateOnChange?: boolean;
  }>();

  // Default values
  const type = $derived(props.type || 'text');
  const size = $derived(props.size || 'md');
  const validateOnBlur = $derived(props.validateOnBlur !== false);
  const validateOnChange = $derived(props.validateOnChange || false);
  const validClass = $derived(props.validClass || 'is-valid');
  const invalidClass = $derived(props.invalidClass || 'is-invalid');

  // State
  let inputValue = $state(props.value || '');
  let isDirty = $state(false);
  let isTouched = $state(false);
  let errorMessage = $state<string | null>(null);
  let id = $state(props.id || `input-${Math.random().toString(36).substring(2, 9)}`);

  // Derived values
  const isValid = $derived(!errorMessage && isDirty);
  const showError = $derived(errorMessage && isTouched);

  $effect(() => {
    // Update internal value when prop changes
    if (props.value !== undefined && props.value !== inputValue) {
      inputValue = props.value;
    }
  });

  // Input classes
  const inputClasses = $derived(() => {
    const classes = ['form-control'];

    // Size
    if (size !== 'md') {
      classes.push(`form-control-${size}`);
    }

    // Validation state
    if (isTouched) {
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

  // Validate the input
  function validate(value: any): string | null {
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
    inputValue = type === 'number' ? parseFloat(target.value) : target.value;
    isDirty = true;

    if (validateOnChange) {
      errorMessage = validate(inputValue);
    }

    // Dispatch change event
    dispatch('change', inputValue);
  }

  function handleBlur(): void {
    isTouched = true;

    if (validateOnBlur) {
      errorMessage = validate(inputValue);
    }

    // Dispatch blur event
    dispatch('blur', inputValue);
  }

  function handleFocus(): void {
    // Dispatch focus event
    dispatch('focus', inputValue);
  }

  // Create a dispatcher to emit events
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{
    change: any;
    blur: any;
    focus: any;
  }>();
</script>

<div class="form-group {props.groupClass || ''}">
  {#if props.label}
    <label for={id} class="{props.labelClass || ''}">
      {props.label}
      {#if props.required}
        <span class="required">*</span>
      {/if}
      {#if props.tooltipText}
        <span class="tooltip-icon" title={props.tooltipText}>ℹ️</span>
      {/if}
    </label>
  {/if}

  <input
    {id}
    name={props.name}
    type={type}
    value={inputValue}
    placeholder={props.placeholder}
    disabled={props.disabled}
    readonly={props.readonly}
    required={props.required}
    min={props.min}
    max={props.max}
    maxlength={props.maxLength}
    autocomplete={props.autocomplete}
    autofocus={props.autofocus}
    class={inputClasses}
    on:change={handleChange}
    on:input={handleChange}
    on:blur={handleBlur}
    on:focus={handleFocus}
  />

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

  label {
    display: inline-block;
    margin-bottom: 0.5rem;
    font-weight: 500;
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

  .form-control {
    display: block;
    width: 100%;
    height: calc(1.5em + 0.75rem + 2px);
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .form-control:focus {
    color: #495057;
    background-color: #fff;
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  .form-control:disabled,
  .form-control[readonly] {
    background-color: #e9ecef;
    opacity: 1;
  }

  /* Sizes */
  .form-control-sm {
    height: calc(1.5em + 0.5rem + 2px);
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    line-height: 1.5;
    border-radius: 0.2rem;
  }

  .form-control-lg {
    height: calc(1.5em + 1rem + 2px);
    padding: 0.5rem 1rem;
    font-size: 1.25rem;
    line-height: 1.5;
    border-radius: 0.3rem;
  }

  /* Validation states */
  .is-valid {
    border-color: #28a745;
    padding-right: calc(1.5em + 0.75rem);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3e%3cpath fill='%2328a745' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
  }

  .is-invalid {
    border-color: #dc3545;
    padding-right: calc(1.5em + 0.75rem);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23dc3545' viewBox='0 0 12 12'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
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
