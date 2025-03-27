/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
  return {
    session: locals.session
  };
}
