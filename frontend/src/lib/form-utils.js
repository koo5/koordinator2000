/**
 * Form handling utilities for SvelteKit
 */
import { browser } from '$app/environment';

/**
 * Enhanced form data management
 * 
 * @template T
 * @param {T} initialData - Initial form data
 * @param {(data: T) => Promise<any>} onSubmit - Submit handler function
 * @returns {{ 
 *   data: T, 
 *   errors: Record<keyof T, string>, 
 *   isSubmitting: boolean,
 *   isDirty: boolean,
 *   resetForm: () => void,
 *   handleSubmit: (e: Event) => Promise<void>,
 *   handleChange: (e: Event) => void
 * }} Form handling utilities
 */
export function createForm(initialData, onSubmit) {
  let data = { ...initialData };
  let errors = {};
  let isSubmitting = false;
  let isDirty = false;
  
  /**
   * Reset form to initial state
   */
  function resetForm() {
    data = { ...initialData };
    errors = {};
    isDirty = false;
  }
  
  /**
   * Handle form submission
   * @param {Event} e - Submit event
   */
  async function handleSubmit(e) {
    if (e) e.preventDefault();
    
    isSubmitting = true;
    errors = {};
    
    try {
      await onSubmit(data);
      // On successful submit, we might want to reset
      // resetForm(); // Uncomment if needed
    } catch (error) {
      // Handle form submission errors
      if (error.details && typeof error.details === 'object') {
        errors = error.details;
      } else {
        errors = { _form: error.message || 'Submission failed' };
      }
      console.error('Form submission error:', error);
    } finally {
      isSubmitting = false;
    }
  }
  
  /**
   * Handle form field change
   * @param {Event} e - Change event
   */
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const newValue = type === 'checkbox' ? checked : value;
    
    // Update data
    data = { ...data, [name]: newValue };
    isDirty = true;
    
    // Clear error for this field when it's changed
    if (errors[name]) {
      errors = { ...errors };
      delete errors[name];
    }
  }
  
  return {
    get data() { return data; },
    get errors() { return errors; },
    get isSubmitting() { return isSubmitting; },
    get isDirty() { return isDirty; },
    resetForm,
    handleSubmit,
    handleChange
  };
}

/**
 * Validate form data against a schema
 * 
 * @template T
 * @param {T} data - Form data to validate
 * @param {Record<keyof T, (value: any) => string|null>} validators - Field validation functions
 * @returns {Record<keyof T, string>} Validation errors (empty if valid)
 */
export function validateForm(data, validators) {
  const errors = {};
  
  Object.entries(validators).forEach(([field, validator]) => {
    const value = data[field];
    const error = validator(value);
    
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
}

/**
 * Create common form validators
 */
export const validators = {
  required: (message = 'This field is required') => 
    value => (!value && value !== 0 && value !== false) ? message : null,
    
  minLength: (min, message = `Must be at least ${min} characters`) => 
    value => (value && value.length < min) ? message : null,
    
  maxLength: (max, message = `Must be at most ${max} characters`) => 
    value => (value && value.length > max) ? message : null,
    
  pattern: (regex, message = 'Invalid format') => 
    value => (value && !regex.test(value)) ? message : null,
    
  email: (message = 'Invalid email address') => 
    value => (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) ? message : null,
    
  numeric: (message = 'Must be a number') => 
    value => (value && isNaN(Number(value))) ? message : null,
    
  range: (min, max, message = `Must be between ${min} and ${max}`) => 
    value => {
      const num = Number(value);
      return (value && (!isNaN(num) && (num < min || num > max))) ? message : null;
    }
};