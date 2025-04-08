<script lang="ts">
    import { goto } from '$app/navigation';
    import { my_user } from '$lib/client/my_user';
    import { get } from 'svelte/store';
    import type { SharedStore } from '$lib/client/svelte-shared-store';

    let confirmDelete = false;
    let isDeleting = false;
    let error = '';

    async function deleteAccount() {
        if (!confirmDelete) {
            confirmDelete = true;
            return;
        }

        try {
            isDeleting = true;
            error = '';

            // Get the current user data
            const userData = get(my_user);

            // Check if the user has a valid JWT token
            if (!userData || !userData.jwt) {
                throw new Error('No authentication token available. Please log in again.');
            }

            // Call the server API to delete the account
            const response = await fetch('/api/delete-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.jwt}`
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to delete account');
            }

            // Redirect to home page after successful deletion
            localStorage.clear();
            sessionStorage.clear();
            
            // Cast to SharedStore type to access the set method
            (my_user as SharedStore<any>).set({ id: -1 });
            
            goto('/');
        } catch (err) {
            console.error('Error deleting account:', err);
            error = (err as Error).message || 'Failed to delete account. Please try again later.';
        } finally {
            isDeleting = false;
        }
    }

    function cancelDelete() {
        confirmDelete = false;
    }
</script>

<div class="delete-account-container">
    <h3>Delete Account</h3>

    {#if error}
        <div class="error-message">{error}</div>
    {/if}

    {#if !confirmDelete}
        <p class="warning-text">
            Warning: Deleting your account is permanent and cannot be undone.
            All your data will be permanently removed.
        </p>
        <button class="delete-button" on:click={deleteAccount}>Delete My Account</button>
    {:else}
        <p class="confirm-text">
            Are you sure you want to delete your account? This action cannot be undone.
        </p>
        <div class="button-group">
            <button class="cancel-button" on:click={cancelDelete} disabled={isDeleting}>Cancel</button>
            <button class="confirm-button" on:click={deleteAccount} disabled={isDeleting}>
                {#if isDeleting}
                    Deleting...
                {:else}
                    Confirm Delete
                {/if}
            </button>
        </div>
    {/if}
</div>

<style>
    .delete-account-container {
        margin: 2em 0;
        padding: 1.5em;
        border-radius: 8px;
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
    }

    h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: #dc3545;
    }

    .warning-text, .confirm-text {
        margin-bottom: 1.5rem;
        line-height: 1.5;
    }

    .warning-text {
        color: #721c24;
    }

    .confirm-text {
        color: #721c24;
        font-weight: bold;
    }

    .error-message {
        padding: 0.75rem;
        margin-bottom: 1rem;
        border-radius: 4px;
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }

    .button-group {
        display: flex;
        gap: 1rem;
    }

    button {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        border: none;
    }

    button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }

    .delete-button {
        background-color: #dc3545;
        color: white;
    }

    .cancel-button {
        background-color: #6c757d;
        color: white;
    }

    .confirm-button {
        background-color: #dc3545;
        color: white;
    }
</style>
