<script>

</script>

<svelte:head>
    <title>About | Koordinator</title>
</svelte:head>

<div class="about-container">
    <h1>Koordinator</h1>

    <div class="content">
        <p>Koordinator is a platform for coordinating campaigns and actions. It helps people organize and participate in various initiatives.</p>

        <h2>Where am I?</h2>
        <div class="content_block">
            <p>This is a preview of Koordinator. It's like kickstarter, but not for collecting money, it's for doing things.</p>
            <p>On Kickstarter, people support campaigns by pledging money. If enough money is pledged, the campaign author can collect them. On Koordinator, you pledge your participation in campaigns, under a condition of a number of other participants.</p>
        </div>
    </div>
</div>

<style>
    .about-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }

    h1 {
        margin-bottom: 2rem;
        text-align: center;
    }

    .content {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        padding: 2rem;
    }

    p {
        margin-bottom: 1.5rem;
        line-height: 1.6;
    }

    a {
        color: #ff3e00;
        text-decoration: none;
        font-weight: bold;
    }

    a:hover {
        text-decoration: underline;
    }
</style>
