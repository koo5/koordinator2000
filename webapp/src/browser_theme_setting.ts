import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Theme types
 */
export type ThemeType = 'light' | 'dark';

/**
 * MediaQuery change event
 */
interface MediaQueryChangeEvent {
  matches: boolean;
}

/**
 * Creates a theme store that reacts to OS preference changes
 * @returns A writable store with the current theme
 */
export function theme(): Writable<ThemeType> {
	let r = writable<ThemeType>('light');
	if (!browser)
		return r;

	// Set up our MediaQueryList
	const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

	// Initial theme config from current state
	r.set(prefersDarkMode.matches ? 'dark' : 'light');

	// Update the store if OS preference changes
	const updateThemeOnChange = (e: MediaQueryChangeEvent | MediaQueryListEvent): void => 
		r.set(e.matches ? 'dark' : 'light');
		
	// Use the appropriate API based on browser support
	if (typeof prefersDarkMode.addEventListener === 'function') {
		prefersDarkMode.addEventListener('change', updateThemeOnChange as (e: MediaQueryListEvent) => void);
		// We could also return a function to clean up if needed:
		// return () => prefersDarkMode.removeEventListener('change', updateThemeOnChange);
	} else {
		// Fallback for older browsers
		prefersDarkMode.addListener(updateThemeOnChange as (e: MediaQueryListEvent) => void);
		// Cleanup: prefersDarkMode.removeListener(updateThemeOnChange);
	}

	// Debugging
	r.subscribe(newTheme => console.log('Switched to theme:', newTheme));

	return r;
}
