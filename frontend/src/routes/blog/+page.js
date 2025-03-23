/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  const res = await fetch('/blog');
  const posts = await res.json();
  
  return { posts };
}