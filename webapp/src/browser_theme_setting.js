import {writable} from 'svelte/store'
import {browser} from '$app/environment';

export function theme() 
{
  let r = writable('light');
  if (!browser)
    return r;

  // Set up our MediaQueryList
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)')

  // Initial theme config from current state
  r.set(prefersDarkMode.matches ? 'dark' : 'light');

  // Update the store if OS preference changes
  const updateThemeOnChange = e => r.set(e.matches ? 'dark' : 'light')
  prefersDarkMode.addListener(updateThemeOnChange)

  // Clean up if this component is destroyed
  // (Maybe not needed if your store is outside a component)
  //onDestroy(() => prefersDarkMode.removeListener(updateThemeOnChange))

  // Debugging
  r.subscribe(newTheme => console.log('Switched to theme:', newTheme))

  return r;
}
