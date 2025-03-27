/**
 * UI Component Library
 * 
 * This file exports all UI components with TypeScript types.
 */

// Export components
export { default as Button } from './Button.svelte';
export { default as Card } from './Card.svelte';
export { default as Badge } from './Badge.svelte';
export { default as Input } from './Input.svelte';
export { default as Form } from './Form.svelte';
export { default as Select } from './Select.svelte';
export { default as Checkbox } from './Checkbox.svelte';
export { default as TextArea } from './TextArea.svelte';

// Export component types
export type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';
  size?: 'sm' | 'md' | 'lg';
  outline?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  block?: boolean;
  loading?: boolean;
  icon?: string;
  ariaLabel?: string;
};

export type CardProps = {
  title?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  imagePosition?: 'top' | 'bottom';
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  border?: boolean;
  rounded?: boolean;
  clickable?: boolean;
  href?: string;
};

export type BadgeProps = {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  outline?: boolean;
  pill?: boolean;
  href?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
};

export type ValidatorFn = (value: any) => string | null;

export type InputProps = {
  id?: string;
  name?: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';
  value?: string | number;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
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
};

export type SelectOption = {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
};

export type SelectProps = {
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
};

export type CheckboxProps = {
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
};

export type TextAreaProps = {
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
};

// Form types
export type FormValue = string | number | boolean | null | undefined;
export type FormValues = Record<string, FormValue>;
export type FormErrors = Record<string, string | null>;
export type ValidationResult = { valid: boolean; errors: FormErrors };
export type FormValidatorFn = (values: FormValues) => FormErrors;

export type FormProps = {
  id?: string;
  initialValues?: FormValues;
  validators?: FormValidatorFn[];
  noValidate?: boolean;
  autocomplete?: 'on' | 'off';
  method?: 'get' | 'post';
  action?: string;
  enableReinitialize?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  submitButtonText?: string;
  resetButtonText?: string;
  showResetButton?: boolean;
};