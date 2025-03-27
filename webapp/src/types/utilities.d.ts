/**
 * Type declarations for utility functions in the application
 */

declare module '../stuff.js' {
  /**
   * Returns the CSS class based on participation status
   */
  export function get_status_class(
    participation: import('./campaign').Participation, 
    collect_confirmations?: boolean
  ): string;
  
  /**
   * Returns the appropriate emoji icon for participation status
   */
  export function get_tickmark(
    participation: import('./campaign').Participation,
    collect_confirmations?: boolean
  ): string;
  
  /**
   * Sanitizes HTML content
   */
  export function sanitize_html(content: string): string;
  
  /**
   * Returns a short description of participation status
   */
  export function short_description(
    participation: import('./campaign').Participation,
    collect_confirmations?: boolean
  ): string;
  
  /**
   * Returns a longer description of participation status
   */
  export function long_description(
    participation: import('./campaign').Participation,
    collect_confirmations?: boolean
  ): string;
}