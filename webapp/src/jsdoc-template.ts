/**
 * This file serves as a template for documenting TypeScript functions in this codebase.
 * Copy these documentation comments and adapt them when creating new functions.
 */

/**
 * Example function with TypeScript documentation
 * 
 * @param param1 - Description of first parameter
 * @param param2 - Description of optional second parameter with default value
 * @returns A Promise that resolves to a UserObject
 * @throws Error when something goes wrong
 * 
 * @example
 * // Example usage:
 * const result = await exampleFunction('test', 123);
 */
async function exampleFunction(param1: string, param2: number = 0): Promise<App.UserObject> {
  // Function implementation would go here
  return { id: 1, name: 'Example User' };
}

/**
 * Example class with TypeScript documentation
 */
class ExampleClass {
  private value: string;
  
  /**
   * Create a new instance
   * @param initialValue - The initial value
   */
  constructor(initialValue: string) {
    this.value = initialValue;
  }
  
  /**
   * Get the current value
   * @returns The current value
   */
  getValue(): string {
    return this.value;
  }
  
  /**
   * Set a new value
   * @param newValue - The new value to set
   */
  setValue(newValue: string): void {
    this.value = newValue;
  }
}

// Export not needed - this is just a template file