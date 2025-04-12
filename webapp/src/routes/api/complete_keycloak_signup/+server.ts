import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { process_auth_event, create_signed_my_user, save_verified_authentication } from '$lib/server/auth';
import { getServerClient, gql, serverMutation } from '$lib/server/urql';

// Handle POST request to complete the Keycloak signup process
export const POST: RequestHandler = async ({ request }) => {
    try {
        // Get data from request body
        const { username, userId, keycloakInfo, keycloakToken } = await request.json();
        
        // Validate username
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            return json({ error: 'Invalid username' }, { status: 400 });
        }
        
        // Validate required data
        if (!userId || !keycloakInfo || !keycloakToken) {
            return json({ error: 'Missing session data. Please try again.' }, { status: 400 });
        }
        
        // Validate user ID
        if (isNaN(userId) || userId <= 0) {
            return json({ error: 'Invalid user ID' }, { status: 400 });
        }
        
        // Update the username in the database
        const updateResult = await serverMutation(
            gql`
                mutation UpdateUserName($id: Int!, $name: String!) {
                    update_accounts_by_pk(pk_columns: {id: $id}, _set: {name: $name}) {
                        id
                        name
                        email
                    }
                }
            `,
            {
                id: userId,
                name: username.trim()
            }
        );
        
        // Check for update errors
        if (!updateResult.data || !updateResult.data.update_accounts_by_pk) {
            console.error('Failed to update username:', updateResult.error);
            return json({ error: 'Failed to update username' }, { status: 500 });
        }
        
        // Link the Keycloak identity with the user
        await save_verified_authentication(userId, 'keycloak', {
            sub: keycloakInfo.sub,
            email: keycloakInfo.email
        });
        
        // Create a signed user object with JWT using the new helper function
        const signedUser = await create_signed_my_user(
            userId, 
            username.trim()
        );
        
        return json({ 
            success: true,
            user: signedUser
        });
        
    } catch (error) {
        console.error('Error completing Keycloak signup:', error);
        return json({ error: 'Failed to complete signup' }, { status: 500 });
    }
};