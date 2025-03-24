/** @type {import('@sveltejs/kit').PageLoad} */
export async function load({ data }) {
  // Pass session data from parent layout directly (enables passing auth data)
  return { 
    session: data?.session || {},
    user: data?.user || null
  };
}

// Allow server-side rendering
export const ssr = true;
