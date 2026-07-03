import type { PageServerLoad } from './$types';

/**
 * Reads the one-time session handoff cookie set by an OAuth callback and returns
 * the signed user to the page, which stores it in localStorage (my_user).
 */
export const load: PageServerLoad = ({ cookies }) => {
    const raw = cookies.get('koord_session_handoff');
    if (raw) cookies.delete('koord_session_handoff', { path: '/' });

    let user: App.UserObject | undefined = undefined;
    if (raw) {
        try {
            user = JSON.parse(raw) as App.UserObject;
        } catch {
            user = undefined;
        }
    }
    return { user };
};
