<script>
  // Props
  export let name = "";
  export let label = "";
  export let type = "text";
  export let value = "";
  export let error = "";
  export let placeholder = "";
  export let required = false;
  export let disabled = false;
  export let options = [];
  export let id = name;
  export let helpText = "";
  
  // For textarea
  export let rows = 3;

  // For number inputs
  export let min = undefined;
  export let max = undefined;
  export let step = undefined;
  
  // Generate unique ID if not provided
  if (!id) {
    id = `field-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  // Helper to handle change events
  function handleChange(event) {
    const eventValue = type === 'checkbox' ? event.target.checked : event.target.value;
    value = eventValue;
    dispatch('change', { name, value: eventValue });
  }
  
  // Compute CSS classes
  let className = '';
  export { className as class };
  
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div class="form-field {error ? 'form-field-error' : ''} {className}">
  <label for={id} class="form-label">
    {label}
    {#if required}
      <span class="required-indicator">*</span>
    {/if}
  </label>
  
  {#if type === 'textarea'}
    <textarea
      {id}
      {name}
      bind:value
      {rows}
      {placeholder}
      {disabled}
      {required}
      class="form-input textarea"
      on:input={handleChange}
      on:change
      on:blur
      on:focus
    ></textarea>
  {:else if type === 'select'}
    <select
      {id}
      {name}
      bind:value
      {disabled}
      {required}
      class="form-input select"
      on:change={handleChange}
      on:blur
      on:focus
    >
      {#if placeholder}
        <option value="" disabled>{placeholder}</option>
      {/if}
      
      {#each options as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
  {:else if type === 'checkbox'}
    <div class="checkbox-wrapper">
      <input
        {id}
        {name}
        {type}
        bind:checked={value}
        {disabled}
        {required}
        class="form-checkbox"
        on:change={handleChange}
        on:blur
        on:focus
      />
      <span class="checkbox-label">{label}</span>
    </div>
  {:else if type === 'radio'}
    <div class="radio-group">
      {#each options as option}
        <label class="radio-label">
          <input
            type="radio"
            {name}
            value={option.value}
            checked={value === option.value}
            {disabled}
            class="form-radio"
            on:change={handleChange}
            on:blur
            on:focus
          />
          {option.label}
        </label>
      {/each}
    </div>
  {:else}
    <input
      {id}
      {name}
      {type}
      bind:value
      {placeholder}
      {min}
      {max}
      {step}
      {disabled}
      {required}
      class="form-input"
      on:input={handleChange}
      on:change
      on:blur
      on:focus
    />
  {/if}
  
  {#if helpText && !error}
    <small class="help-text">{helpText}</small>
  {/if}
  
  {#if error}
    <small class="error-text">{error}</small>
  {/if}
</div>

<style>
  .form-field {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }
  
  .form-label {
    font-weight: 500;
    margin-bottom: 0.25rem;
    color: #333;
  }
  
  .required-indicator {
    color: #d32f2f;
    margin-left: 0.25rem;
  }
  
  .form-input,
  .form-checkbox,
  .form-radio {
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    font-size: 1rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  
  .form-input:focus,
  .form-checkbox:focus,
  .form-radio:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  
  .textarea {
    min-height: 100px;
    resize: vertical;
  }
  
  .select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 16px 12px;
  }
  
  .checkbox-wrapper {
    display: flex;
    align-items: center;
  }
  
  .form-checkbox {
    margin-right: 0.5rem;
  }
  
  .checkbox-label {
    margin-left: 0.5rem;
  }
  
  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .radio-label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .form-radio {
    margin-right: 0.5rem;
  }
  
  .form-field-error .form-input,
  .form-field-error .form-checkbox,
  .form-field-error .form-radio {
    border-color: #d32f2f;
  }
  
  .help-text {
    font-size: 0.75rem;
    color: #6c757d;
    margin-top: 0.25rem;
  }
  
  .error-text {
    font-size: 0.75rem;
    color: #d32f2f;
    margin-top: 0.25rem;
  }
</style>