<script lang="ts">
  // TextArea component with TypeScript and Svelte 5 runes
  import { createEventDispatcher } from 'svelte';
  import type { ValidatorFn } from './index';

  const props = $props<{
    id?: string;
    name?: string;
    label?: string;
    value?: string;
    placeholder?: string;
    rows?: number;
    cols?: number;
    maxLength?: number;
    minLength?: number;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    resizable?: boolean | 'vertical' | 'horizontal' | 'none';
    validators?: ValidatorFn[];
    helpText?: string;
    tooltipText?: string;
    validClass?: string;
    invalidClass?: string;
    labelClass?: string;
    textareaClass?: string;
    groupClass?: string;
    validateOnBlur?: boolean;
    validateOnChange?: boolean;
    autogrow?: boolean;
  }>();

  // Default values
  const validateOnBlur = $derived(props.validateOnBlur !== false);
  const validateOnChange = $derived(props.validateOnChange || false);
  const validClass = $derived(props.validClass || 'is-valid');
  const invalidClass = $derived(props.invalidClass || 'is-invalid');
  const rows = $derived(props.rows || 3);
  const cols = $derived(props.cols || 40);
  const autogrow = $derived(props.autogrow || false);
  const resizable = $derived(() => {
    if (props.resizable === undefined) return 'vertical';
    return props.resizable;
  });

  // State
  let textValue = $state(props.value || '');
  let isDirty = $state(false);
  let isTouched = $state(false);
  let errorMessage = $state<string | null>(null);
  let id = $state(props.id || `textarea-${Math.random().toString(36).substring(2, 9)}`);

  // Derived values
  const isValid = $derived(!errorMessage && isDirty);
  const showError = $derived(errorMessage && isTouched);

  $effect(() => {
    // Update internal value when prop changes
    if (props.value !== undefined && props.value !== textValue) {
      textValue = props.value;
    }
  });

  // Textarea classes
  const textareaClasses = $derived(() => {
    const classes = ['form-control'];

    // Resizing
    if (resizable !== true) {
      classes.push(`resize-${resizable}`);
    }

    // Validation state
    if (isTouched) {
      if (isValid) {
        classes.push(validClass);
      } else if (errorMessage) {
        classes.push(invalidClass);
      }
    }

    // Autogrow
    if (autogrow) {
      classes.push('autogrow');
    }

    // Custom classes
    if (props.textareaClass) {
      classes.push(props.textareaClass);
    }

    return classes.join(' ');
  });

  // Validate the textarea
  function validate(value: string): string | null {
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
    const target = e.target as HTMLTextAreaElement;
    textValue = target.value;
    isDirty = true;

    if (validateOnChange) {
      errorMessage = validate(textValue);
    }

    // Handle autogrow
    if (autogrow && target) {
      autoResize(target);
    }

    // Dispatch change event
    dispatch('change', textValue);
  }

  function handleInput(e: Event): void {
    const target = e.target as HTMLTextAreaElement;
    textValue = target.value;

    // Handle autogrow
    if (autogrow && target) {
      autoResize(target);
    }

    // Dispatch input event
    dispatch('input', textValue);
  }

  function handleBlur(): void {
    isTouched = true;

    if (validateOnBlur) {
      errorMessage = validate(textValue);
    }

    // Dispatch blur event
    dispatch('blur', textValue);
  }

  function handleFocus(): void {
    // Dispatch focus event
    dispatch('focus', textValue);
  }

  // Autogrow functionality
  function autoResize(textarea: HTMLTextAreaElement): void {
    // Reset height to get the right scrollHeight
    textarea.style.height = 'auto';

    // Set the height to match content
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  // Initialize autogrow on mount
  let textarea: HTMLTextAreaElement;

  $effect(() => {
    if (autogrow && textarea && textValue) {
      // Use a setTimeout to ensure the DOM has updated
      setTimeout(() => autoResize(textarea), 0);
    }
  });

  // Create a dispatcher to emit events
  const dispatch = createEventDispatcher<{
    change: string;
    input: string;
    blur: string;
    focus: string;
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

  <textarea
    bind:this={textarea}
    {id}
    name={props.name}
    {rows}
    {cols}
    placeholder={props.placeholder}
    disabled={props.disabled}
    readonly={props.readonly}
    required={props.required}
    maxlength={props.maxLength}
    minlength={props.minLength}
    class={textareaClasses}
    on:change={handleChange}
    on:input={handleInput}
    on:blur={handleBlur}
    on:focus={handleFocus}
  >{textValue}</textarea>

  {#if props.helpText && !showError}
    <small class="form-text text-muted">{props.helpText}</small>
  {/if}

  {#if showError}
    <div class="invalid-feedback">{errorMessage}</div>
  {/if}

  {#if props.maxLength}
    <div class="character-count {textValue.length > (props.maxLength * 0.9) ? 'near-limit' : ''}">
      {textValue.length} / {props.maxLength}
    </div>
  {/if}
</div>

<style>
  .form-group {
    margin-bottom: 1rem;
    position: relative;
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

  /* Resize options */
  .resize-vertical {
    resize: vertical;
  }

  .resize-horizontal {
    resize: horizontal;
  }

  .resize-none {
    resize: none;
  }

  /* Auto-grow */
  .autogrow {
    overflow: hidden;
    resize: none;
    min-height: calc(1.5em + 0.75rem + 2px);
  }

  /* Validation states */
  .is-valid {
    border-color: #28a745;
    padding-right: calc(1.5em + 0.75rem);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3e%3cpath fill='%2328a745' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) top calc(0.375em + 0.1875rem);
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
  }

  .is-invalid {
    border-color: #dc3545;
    padding-right: calc(1.5em + 0.75rem);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23dc3545' viewBox='0 0 12 12'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) top calc(0.375em + 0.1875rem);
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

  .character-count {
    display: block;
    text-align: right;
    font-size: 0.75rem;
    color: #6c757d;
    margin-top: 0.25rem;
  }

  .near-limit {
    color: #fd7e14;
    font-weight: 500;
  }
</style>
