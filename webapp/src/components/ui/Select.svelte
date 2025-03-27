<script lang="ts">
  // Select component with TypeScript and Svelte 5 runes
  import { createEventDispatcher } from 'svelte';
  import type { ValidatorFn } from './index';

  // Option type for select items
  export type SelectOption = {
    value: string | number;
    label: string;
    disabled?: boolean;
    group?: string;
  };

  const props = $props<{
    id?: string;
    name?: string;
    label?: string;
    value?: string | number | (string | number)[];
    placeholder?: string;
    options: SelectOption[];
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    multiple?: boolean;
    validators?: ValidatorFn[];
    helpText?: string;
    tooltipText?: string;
    validClass?: string;
    invalidClass?: string;
    labelClass?: string;
    selectClass?: string;
    groupClass?: string;
    validateOnBlur?: boolean;
    validateOnChange?: boolean;
  }>();

  // Default values
  const size = $derived(props.size || 'md');
  const validateOnBlur = $derived(props.validateOnBlur !== false);
  const validateOnChange = $derived(props.validateOnChange || false);
  const validClass = $derived(props.validClass || 'is-valid');
  const invalidClass = $derived(props.invalidClass || 'is-invalid');
  const multiple = $derived(props.multiple || false);

  // Group options by their group property
  const groupedOptions = $derived(() => {
    const groups: Record<string, SelectOption[]> = {};
    const ungrouped: SelectOption[] = [];

    for (const option of props.options) {
      if (option.group) {
        if (!groups[option.group]) {
          groups[option.group] = [];
        }
        groups[option.group].push(option);
      } else {
        ungrouped.push(option);
      }
    }

    return { groups, ungrouped };
  });

  // State
  let selectValue = $state<string | number | (string | number)[]>(
    props.value !== undefined ? props.value : multiple ? [] : ''
  );
  let isDirty = $state(false);
  let isTouched = $state(false);
  let errorMessage = $state<string | null>(null);
  let id = $state(props.id || `select-${Math.random().toString(36).substring(2, 9)}`);

  // Derived values
  const isValid = $derived(!errorMessage && isDirty);
  const showError = $derived(errorMessage && isTouched);

  $effect(() => {
    // Update internal value when prop changes
    if (props.value !== undefined && props.value !== selectValue) {
      selectValue = props.value;
    }
  });

  // Select classes
  const selectClasses = $derived(() => {
    const classes = ['form-select'];

    // Size
    if (size !== 'md') {
      classes.push(`form-select-${size}`);
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
    if (props.selectClass) {
      classes.push(props.selectClass);
    }

    return classes.join(' ');
  });

  // Validate the select
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
    const target = e.target as HTMLSelectElement;

    if (multiple) {
      // Handle multiple select
      const selectedOptions = Array.from(target.selectedOptions).map(option => {
        const value = option.value;
        return isNaN(Number(value)) ? value : Number(value);
      });

      selectValue = selectedOptions;
    } else {
      // Handle single select
      const value = target.value;
      selectValue = isNaN(Number(value)) ? value : Number(value);
    }

    isDirty = true;

    if (validateOnChange) {
      errorMessage = validate(selectValue);
    }

    // Dispatch change event
    dispatch('change', selectValue);
  }

  function handleBlur(): void {
    isTouched = true;

    if (validateOnBlur) {
      errorMessage = validate(selectValue);
    }

    // Dispatch blur event
    dispatch('blur', selectValue);
  }

  function handleFocus(): void {
    // Dispatch focus event
    dispatch('focus', selectValue);
  }

  // Create a dispatcher to emit events
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

  <select
    {id}
    name={props.name}
    value={selectValue}
    multiple={multiple}
    disabled={props.disabled}
    readonly={props.readonly}
    required={props.required}
    class={selectClasses}
    on:change={handleChange}
    on:blur={handleBlur}
    on:focus={handleFocus}
  >
    {#if props.placeholder && !multiple}
      <option value="" disabled selected={!selectValue}>
        {props.placeholder}
      </option>
    {/if}

    {#if Object.keys(groupedOptions.groups).length === 0}
      {#each props.options as option}
        <option
          value={option.value}
          disabled={option.disabled}
          selected={multiple ?
            (selectValue as (string | number)[]).includes(option.value) :
            selectValue === option.value}
        >
          {option.label}
        </option>
      {/each}
    {:else}
      {#if groupedOptions.ungrouped.length > 0}
        {#each groupedOptions.ungrouped as option}
          <option
            value={option.value}
            disabled={option.disabled}
            selected={multiple ?
              (selectValue as (string | number)[]).includes(option.value) :
              selectValue === option.value}
          >
            {option.label}
          </option>
        {/each}
      {/if}

      {#each Object.entries(groupedOptions.groups) as [groupName, options]}
        <optgroup label={groupName}>
          {#each options as option}
            <option
              value={option.value}
              disabled={option.disabled}
              selected={multiple ?
                (selectValue as (string | number)[]).includes(option.value) :
                selectValue === option.value}
            >
              {option.label}
            </option>
          {/each}
        </optgroup>
      {/each}
    {/if}
  </select>

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

  .form-select {
    display: block;
    width: 100%;
    padding: 0.375rem 2.25rem 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 16px 12px;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    appearance: none;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .form-select:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  .form-select[multiple] {
    padding-right: 0.75rem;
    background-image: none;
  }

  .form-select:disabled {
    background-color: #e9ecef;
    opacity: 1;
  }

  /* Sizes */
  .form-select-sm {
    height: calc(1.5em + 0.5rem + 2px);
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    padding-left: 0.5rem;
    font-size: 0.875rem;
  }

  .form-select-lg {
    height: calc(1.5em + 1rem + 2px);
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    padding-left: 1rem;
    font-size: 1.25rem;
  }

  /* Validation states */
  .is-valid {
    border-color: #28a745;
    padding-right: calc(1.5em + 0.75rem);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%2328a745' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e"), url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
    background-position: right calc(0.375em + 0.1875rem) center, right 0.75rem center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem), 16px 12px;
    background-repeat: no-repeat;
  }

  .is-invalid {
    border-color: #dc3545;
    padding-right: calc(1.5em + 0.75rem);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23dc3545' viewBox='0 0 12 12'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e"), url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
    background-position: right calc(0.375em + 0.1875rem) center, right 0.75rem center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem), 16px 12px;
    background-repeat: no-repeat;
  }

  .is-valid[multiple], .is-invalid[multiple] {
    background-image: none;
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
