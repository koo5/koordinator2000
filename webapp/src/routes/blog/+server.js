import { json } from '@sveltejs/kit';
import posts from './_posts.js';

/** @type {import('./$types').RequestHandler} */
export function GET() {
  const data = posts.map(post => {
    return {
      title: post.title,
      slug: post.slug
    };
  });
  
  return json(data);
}