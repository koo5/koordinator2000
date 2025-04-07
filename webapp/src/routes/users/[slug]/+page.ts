import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
    console.log('user slug load');
    const { slug } = params;
    if (parseInt(slug) >= 0) {
        const user_id = slug;
        console.log(user_id);
        return { user_id };
    }
    return {};
};
