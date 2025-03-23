import { json, error } from '@sveltejs/kit';
import posts from '../_posts.js';

/** @type {import('./$types').RequestHandler} */
export function GET({ params }) {
  const { slug } = params;
  
  // Find the requested post
  const post = posts.find(post => post.slug === slug);
  
  if (post) {
    return json(post);
  }
  
  return error(404, 'Post not found');
}