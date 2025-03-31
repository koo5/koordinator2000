<script lang="ts">
    import { my_user } from '../../my_user.ts';
    import { CAMPAIGN_FRAGMENT } from '../../stuff.ts';
    import { gql, subscribe } from '$lib/urql.ts';
    // Show headers being used
    import { public_env } from '$lib/public_env.ts';

    let segment: string = 'dev_area';
    let currentData: string | null = null;
    let error: string | null = null;

    // Query to test the campaign data structure
    $: my_user_id = $my_user.id;
    $: campaign_test = subscribe(
        gql`
			subscription ($_user_id: Int!) {
				campaigns(limit: 1) ${CAMPAIGN_FRAGMENT}
			}
		`,
        {
            variables: {
                _user_id: my_user_id,
            },
        }
    );

    let graphqlHeaders = JSON.stringify(public_env.PUBLIC_GRAPHQL_HEADERS, null, 2);

    // Update when data changes
    $: {
        if ($campaign_test.data) {
            currentData = JSON.stringify($campaign_test.data, null, 2);
        }
        if ($campaign_test.error) {
            error = $campaign_test.error.message;
        }
    }
</script>

<div class="content_block">
    <ul>
        <li><a href="/login">login</a></li>

        <li><a aria-current={segment === 'about' ? 'page' : undefined} href="/about">about</a></li>
        <li><a data-sveltekit-preload-data aria-current={segment === 'blog' ? 'page' : undefined} href="/blog">blog</a></li>
        <li><a data-sveltekit-preload-data aria-current={segment === 'causes' ? 'page' : undefined} href="/causes">Causes</a></li>
        <li><a data-sveltekit-preload-data aria-current={segment === 'add_cause' ? 'page' : undefined} href="/add_cause">Add Cause</a></li>
        <li><a data-sveltekit-preload-data aria-current={segment === 'users' ? 'page' : undefined} href="/users">users</a></li>
    </ul>
    <img src="/less_sat_by_telepatx_d2n736h-fullview.jpg" alt="alt" />

    <h2>GraphQL Schema Debug</h2>

    <div>
        <h3>Error Output:</h3>
        {#if error}
            <pre style="background-color: #ffeeee; padding: 10px; border: 1px solid #ff0000;">{error}</pre>
        {:else}
            <p>No errors</p>
        {/if}
    </div>

    <div>
        <h3>GraphQL Headers:</h3>
        <pre>{graphqlHeaders}</pre>
    </div>

    <div>
        <h3>Data Structure:</h3>
        {#if currentData}
            <pre style="background-color: #eeffee; padding: 10px; border: 1px solid #ccc; max-height: 400px; overflow: auto;">{currentData}</pre>
        {:else}
            <p>No data yet...</p>
        {/if}
    </div>
</div>

<style>
    ul {
        margin: 0;
        padding: 0;
    }

    ul::after {
        content: '';
        display: block;
        clear: both;
    }

    li {
        display: block;
        float: left;
    }

    a {
        text-decoration: none;
        padding: 1em 0.5em;
        display: block;
    }
</style>
