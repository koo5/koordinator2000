# UI Component Library

A type-safe UI component library built with Svelte 5 and TypeScript.

## Features

- Built with Svelte 5 Runes API
- Fully typed with TypeScript
- Accessible and responsive
- Customizable through props
- Form validation system
- Consistent styling with CSS variables

## Components

### Button

A versatile button component with various styles, sizes, and states.

```svelte
<script>
  import { Button } from './components/ui';
</script>

<Button variant="primary">Click me</Button>
<Button variant="secondary" outline>Outline</Button>
<Button variant="success" size="lg" disabled>Large Disabled</Button>
<Button variant="danger" icon="⚠️">Warning</Button>
```

### Badge

Badges for highlighting status, counts, or categories.

```svelte
<script>
  import { Badge } from './components/ui';
</script>

<Badge variant="primary">New</Badge>
<Badge variant="success" pill>Success</Badge>
<Badge variant="warning" outline>Warning</Badge>
<Badge variant="info" icon="ℹ️">Info</Badge>
```

### Card

Container for displaying content in a clear, organized layout.

```svelte
<script>
  import { Card, Button } from './components/ui';
</script>

<Card 
  title="Card Title" 
  subtitle="Card subtitle"
  image="/path/to/image.jpg"
  imageAlt="Image description"
  elevation={2}
  rounded
>
  <p>Card content goes here</p>
  
  <div slot="footer">
    <Button variant="primary" size="sm">Action</Button>
  </div>
</Card>
```

## Form Components

### Input

Input field with built-in validation and styling.

```svelte
<script>
  import { Input } from './components/ui';
  import * as validators from './components/ui/validators';
</script>

<Input 
  label="Username" 
  name="username"
  placeholder="Enter username"
  validators={[
    validators.required(),
    validators.minLength(3)
  ]}
  helpText="Your unique username"
  required
/>

<Input 
  label="Email" 
  type="email"
  name="email"
  validators={[validators.email()]}
  validateOnBlur
/>
```

### Select

Dropdown select with support for option groups and multi-select.

```svelte
<script>
  import { Select } from './components/ui';
  import type { SelectOption } from './components/ui';
  
  const countryOptions: SelectOption[] = [
    { value: 'us', label: 'United States', group: 'North America' },
    { value: 'ca', label: 'Canada', group: 'North America' },
    { value: 'uk', label: 'United Kingdom', group: 'Europe' },
    { value: 'fr', label: 'France', group: 'Europe' }
  ];
</script>

<Select 
  label="Country" 
  name="country"
  options={countryOptions}
  placeholder="Select a country"
  required
/>

<Select 
  label="Interests" 
  name="interests"
  options={interestOptions}
  multiple={true}
  helpText="Select all that apply"
/>
```

### TextArea

Multi-line text input with autogrow and character count.

```svelte
<script>
  import { TextArea } from './components/ui';
</script>

<TextArea 
  label="Bio" 
  name="bio"
  placeholder="Tell us about yourself"
  rows={4}
  maxLength={500}
  autogrow={true}
  helpText="Maximum 500 characters"
/>

<TextArea 
  label="Comments" 
  name="comments"
  resizable="vertical"
  validators={[validators.required()]}
  required
/>
```

### Checkbox

Checkbox and toggle switch input.

```svelte
<script>
  import { Checkbox } from './components/ui';
</script>

<Checkbox 
  label="Subscribe to newsletter" 
  name="subscribe"
  helpText="Get updates about our products"
/>

<Checkbox 
  label="I accept the Terms and Conditions" 
  name="acceptTerms"
  validators={[(value) => value ? null : 'You must accept the terms']}
  required
/>

<Checkbox 
  label="Enable dark mode" 
  name="darkMode"
  switch={true}
/>
```

### Form

Complete form handling with validation, submission, and state management.

```svelte
<script>
  import { Form, Input, Select, TextArea, Checkbox } from './components/ui';
  import * as validators from './components/ui/validators';
  
  const initialValues = {
    username: '',
    email: '',
    country: '',
    bio: '',
    acceptTerms: false
  };
  
  function handleSubmit(event) {
    const values = event.detail.values;
    console.log('Form submitted:', values);
    // Submit to API, etc.
  }
</script>

<Form
  initialValues={initialValues}
  validateOnSubmit={true}
  validateOnBlur={true}
  on:submit={handleSubmit}
>
  <Input
    label="Username"
    name="username"
    validators={[validators.required()]}
    required
  />
  
  <Input
    label="Email"
    name="email"
    type="email"
    validators={[validators.required(), validators.email()]}
    required
  />
  
  <Select
    label="Country"
    name="country"
    options={countryOptions}
    required
  />
  
  <TextArea
    label="Bio"
    name="bio"
    placeholder="Tell us about yourself"
    rows={3}
  />
  
  <Checkbox
    label="I accept the Terms and Conditions"
    name="acceptTerms"
    validators={[(value) => value ? null : 'You must accept the terms']}
    required
  />
  
  <div slot="actions">
    <button type="submit">Create Account</button>
    <button type="reset">Reset</button>
  </div>
</Form>
```

## Validation

The library includes a comprehensive validation system with predefined validators and the ability to create custom ones.

### Available validators

- `required()` - Ensures a field has a value
- `minLength(min)` - Validates minimum string length
- `maxLength(max)` - Validates maximum string length
- `email()` - Validates email format
- `url()` - Validates URL format
- `pattern(regex, message)` - Validates against a custom regex pattern
- `min(value)` - Validates minimum numeric value
- `max(value)` - Validates maximum numeric value
- `equals(value, message)` - Validates that a field equals a specific value
- `compose(...validators)` - Chains multiple validators together

### Form-level validators

- `fieldsMatch(field1, field2, message)` - Validates that two fields have the same value
- `requiredIf(field, dependsOn, dependsOnValue, message)` - Makes a field required based on another field's value
- `createFormValidator(validatorFn)` - Creates a custom form validator
- `composeFormValidators(...validators)` - Chains multiple form validators together

## TypeScript Integration

All components are fully typed with TypeScript, providing autocomplete and type safety. The library exports type definitions for all components and their props.

```typescript
import type { 
  ButtonProps,
  CardProps, 
  BadgeProps, 
  InputProps, 
  FormProps,
  ValidatorFn,
  FormValidatorFn,
  FormValues
} from './components/ui';

// Create a custom validator
const myValidator: ValidatorFn = (value) => {
  // Custom validation logic
  return value === 'special' ? null : 'Must be special';
};

// Create a form-level validator
const myFormValidator: FormValidatorFn = (values) => {
  // Cross-field validation logic
  const errors: Record<string, string | null> = {};
  
  if (values.startDate && values.endDate) {
    if (new Date(values.startDate) > new Date(values.endDate)) {
      errors.endDate = 'End date must be after start date';
    }
  }
  
  return errors;
};
```

## Styling

The components use a consistent style system that can be customized through CSS variables or by passing class names through props.

### CSS Variables

```css
:root {
  /* Colors */
  --primary-color: #0066cc;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  
  /* Typography */
  --font-family: system-ui, -apple-system, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.25rem;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  
  /* Border radius */
  --border-radius-sm: 0.2rem;
  --border-radius-md: 0.25rem;
  --border-radius-lg: 0.3rem;
  --border-radius-pill: 50rem;
}
```

### Customizing Components

Most components accept class props to override default styling:

```svelte
<Input 
  label="Custom Input" 
  labelClass="my-custom-label"
  inputClass="my-custom-input"
  groupClass="my-custom-group"
/>

<Form class="my-custom-form">
  <!-- Form contents -->
</Form>
```

## Future Enhancements

- Dark mode support
- Additional form components (Select, Checkbox, Radio, TextArea)
- Enhanced accessibility features
- Animation and transitions
- Icon system integration