<script lang="ts">
    import DeleteSelf from '../../../components/DeleteSelf.svelte';
</script>

<div class="delete-page-container">
    <h2>Delete Account</h2>
    
    <div class="warning-box">
        <h3>⚠️ Warning: Account Deletion</h3>
        <p>
            This page allows you to permanently delete your account and all associated data.
            This action is irreversible.
        </p>
    </div>
    
    <DeleteSelf />
    
    <div class="back-link">
        <a href="/account">← Back to Account Settings</a>
    </div>
</div>

<style>
    .delete-page-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
    }
    
    h2 {
        margin-bottom: 1.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #dee2e6;
        color: #dc3545;
    }
    
    .warning-box {
        background-color: #fff3cd;
        border: 1px solid #ffeeba;
        border-radius: 6px;
        padding: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .warning-box h3 {
        color: #856404;
        margin-top: 0;
        margin-bottom: 1rem;
    }
    
    .warning-box p {
        color: #856404;
        margin-bottom: 0;
        line-height: 1.5;
    }
    
    .back-link {
        margin-top: 2rem;
    }
    
    .back-link a {
        color: #6c757d;
        text-decoration: none;
        display: inline-block;
        padding: 0.5rem 0;
    }
    
    .back-link a:hover {
        color: #343a40;
        text-decoration: underline;
    }
</style>