import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
    const { slug } = params;
    if (parseInt(slug) >= 0) {
        const campaign_id = slug;
        console.log(campaign_id);
        return { campaign_id };
    }
    return {};
};
