/** @type {import('./$types').PageLoad} */
export function load({ params }) {
  const { slug } = params;
  if (parseInt(slug) >= 0) {
    const campaign_id = slug;
    console.log(campaign_id);
    return { campaign_id };
  }
  return {};
}