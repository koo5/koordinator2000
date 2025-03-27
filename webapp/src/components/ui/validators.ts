/**
 * Form Validation Utilities
 * 
 * This file provides common validators for use with the Input and Form components.
 */

import type { ValidatorFn, FormValidatorFn, FormValues } from './index';

// Single field validators

/**
 * Validates that a field is not empty
 */
export const required = (message = 'This field is required'): ValidatorFn => {
  return (value: any) => {
    if (value === undefined || value === null || value === '') {
      return message;
    }
    
    if (typeof value === 'string' && value.trim() === '') {
      return message;
    }
    
    return null;
  };
};

/**
 * Validates that a field has a minimum length
 */
export const minLength = (min: number, message?: string): ValidatorFn => {
  return (value: any) => {
    if (value === undefined || value === null || value === '') {
      return null; // Let required validator handle empty values
    }
    
    const stringValue = String(value);
    if (stringValue.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    
    return null;
  };
};

/**
 * Validates that a field has a maximum length
 */
export const maxLength = (max: number, message?: string): ValidatorFn => {
  return (value: any) => {
    if (value === undefined || value === null || value === '') {
      return null; // Let required validator handle empty values
    }
    
    const stringValue = String(value);
    if (stringValue.length > max) {
      return message || `Must be ${max} characters or less`;
    }
    
    return null;
  };
};

/**
 * Validates that a field matches a regular expression
 */
export const pattern = (regex: RegExp, message: string): ValidatorFn => {
  return (value: any) => {
    if (value === undefined || value === null || value === '') {
      return null; // Let required validator handle empty values
    }
    
    const stringValue = String(value);
    if (!regex.test(stringValue)) {
      return message;
    }
    
    return null;
  };
};

/**
 * Validates that a field is a valid email address
 */
export const email = (message = 'Please enter a valid email address'): ValidatorFn => {
  // RFC 5322 compliant regex
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return pattern(emailRegex, message);
};

/**
 * Validates that a field is a valid URL
 */
export const url = (message = 'Please enter a valid URL'): ValidatorFn => {
  const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
  return pattern(urlRegex, message);
};

/**
 * Validates that a numeric field has a minimum value
 */
export const min = (minValue: number, message?: string): ValidatorFn => {
  return (value: any) => {
    if (value === undefined || value === null || value === '') {
      return null; // Let required validator handle empty values
    }
    
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < minValue) {
      return message || `Must be at least ${minValue}`;
    }
    
    return null;
  };
};

/**
 * Validates that a numeric field has a maximum value
 */
export const max = (maxValue: number, message?: string): ValidatorFn => {
  return (value: any) => {
    if (value === undefined || value === null || value === '') {
      return null; // Let required validator handle empty values
    }
    
    const numValue = Number(value);
    if (isNaN(numValue) || numValue > maxValue) {
      return message || `Must be ${maxValue} or less`;
    }
    
    return null;
  };
};

/**
 * Creates a validator that checks if the field matches a specific value
 */
export const equals = (otherValue: any, message?: string): ValidatorFn => {
  return (value: any) => {
    if (value !== otherValue) {
      return message || `Value must equal ${otherValue}`;
    }
    
    return null;
  };
};

/**
 * Chains multiple validators together
 */
export const compose = (...validators: ValidatorFn[]): ValidatorFn => {
  return (value: any) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        return error;
      }
    }
    
    return null;
  };
};

// Form-level validators

/**
 * Validates that two fields match (useful for password confirmation)
 */
export const fieldsMatch = (field1: string, field2: string, message: string): FormValidatorFn => {
  return (values: FormValues) => {
    const errors: Record<string, string | null> = {};
    
    if (values[field1] !== values[field2]) {
      errors[field2] = message;
    }
    
    return errors;
  };
};

/**
 * Validates that a field is required only if another field has a specific value
 */
export const requiredIf = (field: string, dependsOn: string, dependsOnValue: any, message?: string): FormValidatorFn => {
  return (values: FormValues) => {
    const errors: Record<string, string | null> = {};
    
    if (values[dependsOn] === dependsOnValue) {
      if (values[field] === undefined || values[field] === null || values[field] === '') {
        errors[field] = message || 'This field is required';
      }
    }
    
    return errors;
  };
};

/**
 * Creates a custom form-level validator
 */
export const createFormValidator = (
  validatorFn: (values: FormValues) => Record<string, string | null>
): FormValidatorFn => {
  return validatorFn;
};

/**
 * Chains multiple form validators together
 */
export const composeFormValidators = (...validators: FormValidatorFn[]): FormValidatorFn => {
  return (values: FormValues) => {
    let allErrors: Record<string, string | null> = {};
    
    for (const validator of validators) {
      const errors = validator(values);
      allErrors = { ...allErrors, ...errors };
    }
    
    return allErrors;
  };
};