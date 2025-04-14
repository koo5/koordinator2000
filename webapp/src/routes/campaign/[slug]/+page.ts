import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { gql, getContextClient } from '$lib/urql.ts';
import { browser } from '$app/environment';

export const load: PageLoad = async ({ params }) => {
    const { slug } = params;
    
    // If the slug is a number, assume it's a direct campaign ID
    if (parseInt(slug) >= 0) {
        const campaign_id = slug;
        return { campaign_id };
    }
    
    // When rendered on the server, return the slug
    if (!browser) {
        return { slug };
    }
    
    // If the slug is not a number, look up the campaign_id using GraphQL
    try {
        const query = gql`
            query GetCampaignIdBySlug($slug: String!) {
                campaign_slugs(where: {slug: {_eq: $slug}}, limit: 1) {
                    campaign_id
                }
            }
        `;
        
        const client = getContextClient();
        const result = await client.query(query, { slug }).toPromise();
        
        if (result.error) {
            console.error('Error fetching campaign by slug:', result.error);
            throw error(404, 'Campaign not found');
        }
        
        if (!result.data?.campaign_slugs?.length) {
            throw error(404, 'Campaign not found');
        }
        
        return { campaign_id: result.data.campaign_slugs[0].campaign_id };
    } catch (e) {
        console.error('Error fetching campaign by slug:', e);
        throw error(404, 'Campaign not found');
    }
};
