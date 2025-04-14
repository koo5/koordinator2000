<script>
    import { debug } from '$lib/stores.ts';

</script>

<svelte:head>
    <title>About | Koordinator</title>
</svelte:head>

<div class="about-container">
    <h1>Koordinator</h1>

    <div class="content">
        <p>Koordinator is a platform for coordinating campaigns and actions. It helps people organize and participate in various initiatives. On a crowdfunding website, people support campaigns by pledging money. If enough money is pledged, the campaign author can collect them. On Koordinator, you pledge your participation in campaigns, under conditions that you set. You are notified when the conditions are met, and you are then expected to participate.</p>

        <h2>Open Source</h2>
        <div class="content_block github-section">
            <a href="https://github.com/koo5/koordinator2000/" target="_blank" rel="noopener noreferrer" class="github-link">
                <svg class="github-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>View source on GitHub</span>
            </a>
        </div>


        <h2>Contact</h2>
        <ul>
            <li>
        <a href="https://github.com/koo5/koordinator2000/issues/">github</a>
            </li>
            <li>

        <a href="https://webchat.freenode.net/#koordinator">IRC</a>
            </li>
            <li>
        <a href="https://discord.gg/QP9mhdEk">discord</a>
            </li>
        </ul>

        <h2>Help</h2>
        <ul>
            <li>CodeTriage:
        <a href="https://www.codetriage.com/koo5/koordinator2000">
            <img src="https://www.codetriage.com/koo5/koordinator2000/badges/users.svg" alt="codetriage" />
        </a>
            </li>
        </ul>

        <h2>Fund</h2>

        <ul>
            <li>Liberapay:

        <a href="https://liberapay.com/koo5/donate">
            <img src="https://img.shields.io/liberapay/receives/koo5.svg?logo=liberapay" alt="liberapay" />
        </a>

            </li>
            <li>GitHub Sponsors:
        <a href="https://github.com/sponsors/koo5" target="_blank" rel="noopener noreferrer">
            <img src="https://img.shields.io/badge/sponsor-koo5-ff69b4.svg?logo=github" alt="github" />
        </a>
            </li>
        </ul>

        <h2>Docs</h2>
        <ul>
            <li>
                <a href="/about/privacy_policy">Privacy Policy</a>
            </li>
            <li>
                <a href="/about/terms_of_service">Terms of Service</a>
            </li>
            <li>
                <a href="/about/help/data-deletion">Data Deletion & Account Removal</a>
            </li>
        </ul>

    </div>
</div>

{#if $debug}
    <a href="/dev_area" class="dev-area-link">Dev Area</a>
{/if}

<style>

    .github-section {
        display: flex;
        margin: 1rem;
    }

    .github-link {
        display: flex;
        align-items: center;
        padding: 10px 16px;
        background-color: #24292e;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        transition: background-color 0.2s;
    }

    .github-link:hover {
        background-color: #2c3338;
    }

    .github-icon {
        margin-right: 8px;
        fill: white;
    }

</style>
