import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getServerClient, gql, serverMutation } from '$lib/server/urql';

/**
 * Handle POST requests to delete a user account
 * This endpoint deletes the current user's account and associated data
 */
export async function POST(event: RequestEvent) {
    try {
        console.log('Received request to delete account');
        // The user authentication is already handled by hooks.server.ts
        // and made available through event.locals.user
        if (!event.locals.user || !event.locals.user.id) {
            console.log('User not authenticated');
            return json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Extract current user ID from locals
        const userId = event.locals.user.id;

        // Delete the user account
        const result = await deleteUserAccount(userId);

        if (result.error) {
            console.error('Error deleting account:', result.error);
            return json({
                error: 'Failed to delete account',
                message: 'An error occurred while deleting your account. Please try again later.'
            }, { status: 500 });
        }

        // Return success
        return json({
            success: true,
            message: 'Account successfully deleted'
        });
    } catch (error) {
        console.error('Error in account deletion:', error);
        return json({
            error: 'Internal server error during account deletion',
            message: 'An unexpected error occurred. Please try again later.'
        }, { status: 500 });
    }
}

/**
 * Delete a user account and all associated data
 * @param userId - The ID of the user to delete
 * @returns Result of the deletion operation
 */
async function deleteUserAccount(userId: number) {
    console.log('Deleting user account with ID:', userId);
    try {
        // First delete user authentications
        const authDeletionResult = await serverMutation(
            gql`
                mutation DeleteUserAuthentications($userId: Int!) {
                    delete_verified_user_authentications(where: {account_id: {_eq: $userId}}) {
                        affected_rows
                    }
                }
            `,
            { userId }
        );

        console.log('Auth deletion result:', JSON.stringify(authDeletionResult, null, 2));

        // Now delete the user account
        // Note: This relies on cascading deletes being set up in Hasura for all other user data
        const accountDeletionResult = await serverMutation(
            gql`
                mutation DeleteUserAccount($userId: Int!) {
                    delete_accounts_by_pk(id: $userId) {
                        id
                    }
                }
            `,
            { userId }
        );

        console.log('Account deletion result:', JSON.stringify(accountDeletionResult, null, 2));

        if (accountDeletionResult.error) {
            return { error: accountDeletionResult.error };
        }

        return { success: true };
    } catch (error) {
        console.error('Error in deleteUserAccount:', error);
        return { error };
    }
}
