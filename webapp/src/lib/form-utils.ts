/**
 * Form handling utilities for SvelteKit
 */
import { browser } from '$app/environment';

/**
 * Form error with details
 */
interface ErrorWithDetails extends Error {
  details?: Record<string, string>;
  message: string;
}

/**
 * Form input event
 */
interface FormInputEvent extends Event {
  target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
}

/**
 * Form API interface
 */
export interface FormAPI<T extends Record<string, any>> {
  readonly data: T;
  readonly errors: Record<string, string>;
  readonly isSubmitting: boolean;
  readonly isDirty: boolean;
  resetForm: () => void;
  handleSubmit: (e?: Event) => Promise<void>;
  handleChange: (e: FormInputEvent) => void;
}

/**
 * Validator function type
 */
export type Validator = (value: any) => string | null;

/**
 * Validator function creator
 */
export type ValidatorCreator = (...args: any[]) => Validator;

/**
 * Validators record for a form data type
 */
export type FormValidators<T> = Partial<Record<keyof T, Validator>>;

/**
 * Enhanced form data management
 * 
 * @param initialData - Initial form data
 * @param onSubmit - Submit handler function
 * @returns Form handling utilities
 */
export function createForm<T extends Record<string, any>>(
  initialData: T, 
  onSubmit: (data: T) => Promise<any>
): FormAPI<T> {
  let data: T = { ...initialData };
  let errors: Record<string, string> = {};
  let isSubmitting = false;
  let isDirty = false;
  
  /**
   * Reset form to initial state
   */
  function resetForm(): void {
    data = { ...initialData };
    errors = {};
    isDirty = false;
  }
  
  /**
   * Handle form submission
   * @param e - Submit event
   */
  async function handleSubmit(e?: Event): Promise<void> {
    if (e) e.preventDefault();
    
    isSubmitting = true;
    errors = {};
    
    try {
      await onSubmit(data);
      // On successful submit, we might want to reset
      // resetForm(); // Uncomment if needed
    } catch (error) {
      // Handle form submission errors
      const err = error as ErrorWithDetails;
      if (err.details && typeof err.details === 'object') {
        errors = err.details;
      } else {
        errors = { _form: err.message || 'Submission failed' };
      }
      console.error('Form submission error:', error);
    } finally {
      isSubmitting = false;
    }
  }
  
  /**
   * Handle form field change
   * @param e - Change event
   */
  function handleChange(e: FormInputEvent): void {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const newValue = type === 'checkbox' ? checked : value;
    
    // Update data with type assertion since we know it's safe
    data = { ...data, [name]: newValue } as T;
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
 * @param data - Form data to validate
 * @param validators - Field validation functions
 * @returns Validation errors (empty if valid)
 */
export function validateForm<T extends Record<string, any>>(
  data: T, 
  validators: FormValidators<T>
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  
  Object.entries(validators).forEach(([field, validator]) => {
    if (!validator) return;
    
    const value = data[field as keyof T];
    const error = validator(value);
    
    if (error) {
      errors[field as keyof T] = error;
    }
  });
  
  return errors;
}

/**
 * Create common form validators
 */
export const validators: Record<string, ValidatorCreator> = {
  required: (message: string = 'This field is required'): Validator => 
    (value: any): string | null => (!value && value !== 0 && value !== false) ? message : null,
    
  minLength: (min: number, message: string = `Must be at least ${min} characters`): Validator => 
    (value: any): string | null => (value && value.length < min) ? message : null,
    
  maxLength: (max: number, message: string = `Must be at most ${max} characters`): Validator => 
    (value: any): string | null => (value && value.length > max) ? message : null,
    
  pattern: (regex: RegExp, message: string = 'Invalid format'): Validator => 
    (value: any): string | null => (value && !regex.test(value)) ? message : null,
    
  email: (message: string = 'Invalid email address'): Validator => 
    (value: any): string | null => (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) ? message : null,
    
  numeric: (message: string = 'Must be a number'): Validator => 
    (value: any): string | null => (value && isNaN(Number(value))) ? message : null,
    
  range: (min: number, max: number, message: string = `Must be between ${min} and ${max}`): Validator => 
    (value: any): string | null => {
      const num = Number(value);
      return (value && (!isNaN(num) && (num < min || num > max))) ? message : null;
    }
};