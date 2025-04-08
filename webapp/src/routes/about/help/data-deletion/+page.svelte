<script lang="ts">
    // Import any necessary components or libraries
</script>

<svelte:head>
    <title>Account Deletion | Koordinator</title>
    <meta name="description" content="Learn how to delete your Koordinator account and your data" />
</svelte:head>

<div class="container">
    <h1>Account Deletion Guide</h1>

    <div class="content-section">
        <h2>How to Delete Your Account</h2>

        <p>
            Koordinator makes it easy to delete your account and all associated data when you no longer wish to use the service.
            All your personal information and participation data will be permanently removed from our systems.
        </p>

        <div class="process-steps">
            <h3>Deletion Process:</h3>

            <ol>
                <li>
                    <strong>Access Account Settings</strong>
                    <p>Navigate to your <a href="/account">Account Settings</a> page by clicking on your profile in the top navigation bar and selecting "Account".</p>
                </li>

                <li>
                    <strong>Find Delete Account Option</strong>
                    <p>Scroll down to the bottom of the Account Settings page and look for the "Delete Account" button or link.</p>
                </li>

                <li>
                    <strong>Initiate Deletion</strong>
                    <p>Click on the "Delete Account" button, which will take you to the account deletion page.</p>
                </li>

                <li>
                    <strong>Confirm Deletion</strong>
                    <p>Review the warning information about account deletion being permanent. If you wish to proceed, click "Delete My Account".</p>
                </li>

                <li>
                    <strong>Final Confirmation</strong>
                    <p>A confirmation dialog will appear to ensure this is what you want. Select "Confirm Delete" to permanently delete your account.</p>
                </li>
            </ol>
        </div>
    </div>

    <div class="content-section">
        <h2>What Gets Deleted</h2>

        <p>When you delete your account, the following data will be permanently removed from our systems:</p>

        <ul>
            <li><strong>Account Information</strong> - Your user profile, name, email, and authentication details</li>
            <li><strong>Participation Data</strong> - Your participation records in campaigns and actions</li>
            <li><strong>Comments & Activity</strong> - Any comments or activities you've made on the platform</li>
            <li><strong>Preferences & Settings</strong> - Your personal preferences and settings</li>
        </ul>

        <div class="note-box">
            <strong>Important:</strong> Once your account is deleted, all data associated with it will be permanently removed from our active systems. This action cannot be undone, and we cannot recover deleted accounts.
        </div>
    </div>

    <div class="content-section">
        <h2>Alternative Options</h2>

        <p>If you're concerned about privacy but don't want to delete your account entirely, consider these alternatives:</p>

        <ul>
            <li><strong>Update Your Information</strong> - You can modify or remove certain personal information from your profile</li>
            <li><strong>Change Your Email Address</strong> - Update your email address if you no longer want to use your current one</li>
            <li><strong>Delete Participations</strong> - Instead of deleting your account, you can withdraw your participations in campaigns</li>
        </ul>
    </div>

    <div class="content-section">
        <h2>Contact Us</h2>

        <p>
            If you're experiencing issues with account deletion or have questions about your data,
            please contact us through one of the channels listed on our <a href="/about">About page</a>.
        </p>

        <p>
            For data privacy concerns specifically, you can reach out via our GitHub issues page:
            <a href="https://github.com/koo5/koordinator2000/issues/" target="_blank" rel="noopener noreferrer">
                Submit a GitHub issue
            </a>
        </p>
    </div>

    <div class="back-link">
        <a href="/about">&larr; Back to About</a>
    </div>
</div>

<style>
    .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem;
        line-height: 1.6;
    }

    h1 {
        color: #333;
        margin-bottom: 1.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #eee;
    }

    .content-section {
        margin-bottom: 2.5rem;
    }

    h2 {
        color: #444;
        margin-top: 1.5rem;
        margin-bottom: 1rem;
    }

    h3 {
        color: #555;
        margin-top: 1.2rem;
        margin-bottom: 0.8rem;
    }

    p {
        margin-bottom: 1rem;
    }

    ul, ol {
        margin-bottom: 1.5rem;
        padding-left: 1.5rem;
    }

    li {
        margin-bottom: 0.5rem;
    }

    li strong {
        color: #333;
    }

    .process-steps {
        background-color: #f9f9f9;
        padding: 1.5rem;
        border-radius: 8px;
        margin: 1.5rem 0;
    }

    .note-box {
        background-color: #fff3cd;
        border-left: 4px solid #ffc107;
        padding: 1rem;
        margin: 1.5rem 0;
        border-radius: 4px;
    }

    .back-link {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
    }

    .back-link a {
        color: #666;
        text-decoration: none;
        display: inline-block;
        padding: 0.5rem 0;
    }

    .back-link a:hover {
        color: #000;
        text-decoration: underline;
    }

    a {
        color: #007bff;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }
</style>
