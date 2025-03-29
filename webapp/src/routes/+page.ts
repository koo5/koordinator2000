import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  // This replaces the preload function from Sapper
  // You can fetch data here that will be available to the page component
  
  try {
    // Example of fetching data
    // const response = await fetch('/api/some-data');
    // const data = await response.json();
    
    return {
      // Return data that will be available to the page
      pageTitle: 'Koordinator Home'
      // data
    };
  } catch (error) {
    console.error('Error loading ', error);
    return {
      pageTitle: 'Koordinator Home',
      error: 'Failed to load data'
    };
  }
};