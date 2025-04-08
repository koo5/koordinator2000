/**
 * Utility functions for scrolling that work with Svelte 5
 */

/**
 * Scrolls to a specific element
 * @param options Configuration options
 */
export function scrollTo(options: { element: HTMLElement | null; delay?: number }): void {
  const { element, delay = 0 } = options;
  
  if (!element) return;
  
  setTimeout(() => {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, delay);
}

/**
 * Scrolls to a specific position
 * @param options Configuration options
 */
export function scrollToPosition(options: { x?: number; y?: number; delay?: number }): void {
  const { x = 0, y = 0, delay = 0 } = options;
  
  setTimeout(() => {
    window.scrollTo({
      top: y,
      left: x,
      behavior: 'smooth'
    });
  }, delay);
}