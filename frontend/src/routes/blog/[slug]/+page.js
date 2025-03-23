/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
  const { slug } = params;
  const res = await fetch(`/blog/${slug}`);
  
  if (res.ok) {
    const post = await res.json();
    return { post };
  }
  
  throw new Error(`Could not load ${slug}`);
}