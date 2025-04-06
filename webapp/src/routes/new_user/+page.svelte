<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { my_user } from '$lib/client/my_user.ts';
    import { Button, Card, Input, FormGroup, Label } from '../../components/ui';
    
    let username = '';
    let isLoading = false;
    let errorMessage = '';
    let userData = null;
    
    import { browser } from '$app/environment';
    
    onMount(() => {
        if (!browser) return;
        
        // Get user data from URL parameter
        const searchParams = new URLSearchParams(window.location.search);
        const dataParam = searchParams.get('data');
        
        if (dataParam) {
            try {
                userData = JSON.parse(decodeURIComponent(dataParam));
                username = userData.suggestedName || '';
            } catch (error) {
                console.error('Error parsing user data:', error);
                errorMessage = 'Invalid session data. Please try again.';
            }
        } else {
            errorMessage = 'Missing session data. Please try again.';
        }
    });
    
    async function saveUser() {
        if (!username.trim()) {
            errorMessage = 'Username cannot be empty';
            return;
        }
        
        if (!userData) {
            errorMessage = 'Missing session data. Please try again.';
            return;
        }
        
        isLoading = true;
        errorMessage = '';
        
        try {
            const response = await fetch('/api/complete_keycloak_signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    userId: userData.userId,
                    keycloakInfo: userData.keycloakInfo,
                    keycloakToken: userData.keycloakToken
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save user');
            }
            
            const result = await response.json();
            
            // Update local user state
            if (result && result.user) {
                my_user.set(result.user);
                goto('/');
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Error saving user:', error);
            errorMessage = error.message || 'Failed to save user';
        } finally {
            isLoading = false;
        }
    }
    
    function forgetAuth() {
        // Simply reset user and redirect to home
        my_user.set({ id: -1 });
        goto('/');
    }
</script>

<svelte:head>
    <title>Welcome to Koordinator</title>
</svelte:head>

<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
            <Card>
                <div class="text-center mb-4">
                    <h2>Welcome to Koordinator</h2>
                    <p class="text-muted">Complete your account setup</p>
                </div>
                
                {#if errorMessage}
                    <div class="alert alert-danger">{errorMessage}</div>
                {/if}
                
                <FormGroup>
                    <Label for="username">Username</Label>
                    <Input type="text" id="username" bind:value={username} placeholder="Choose a username" />
                    <small class="form-text text-muted">This name will be visible to other users</small>
                </FormGroup>
                
                <div class="d-grid gap-2 mt-4">
                    <Button color="primary" disabled={isLoading} on:click={saveUser}>
                        {#if isLoading}
                            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {/if}
                        Complete Setup
                    </Button>
                </div>
                
                <hr class="my-4" />
                
                <div class="text-center">
                    <p class="mb-2">Not interested in using this authentication method?</p>
                    <Button color="link" on:click={forgetAuth} disabled={isLoading}>
                        Forget this authentication method
                    </Button>
                </div>
            </Card>
        </div>
    </div>
</div>

<style>
    .container {
        max-width: 600px;
    }
</style>