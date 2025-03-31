<svelte:head>
    <title>About</title>
</svelte:head>
<div class="content_block">
    <h1>About fullcracy/koordinator</h1>

    <h4>Talk</h4>

    <a href="https://github.com/koo5/koordinator2000/issues/">github</a><br />
    <a href="https://webchat.freenode.net/#koordinator">IRC</a><br />
    <a href="https://discord.gg/QP9mhdEk">discord</a>.<br />

    <h4>Help</h4>
    <a href="https://www.codetriage.com/koo5/koordinator2000">
        <img src="https://www.codetriage.com/koo5/koordinator2000/badges/users.svg" alt="codetriage" />
    </a>

    <h4>Fund</h4>

    <h5>Liberapay</h5>
    <script src="https://liberapay.com/koo5/widgets/button.js"></script>
    {@html '<script src="https://liberapay.com/koo5/widgets/receiving.js"></script>'}
    <a href="https://liberapay.com/koo5/donate">
        <img src="https://img.shields.io/liberapay/receives/koo5.svg?logo=liberapay" alt="liberapay" />
    </a>

    <h5>GitHub</h5>
    <a href="https://github.com/sponsors/koo5">GitHub Sponsors</a>

    <h4>Friend projects</h4>

    <a rel="prefetch" href="see_also">see_also</a>.

    <h4>Thank You</h4>

    Thank you for you attention! Created by koo &amp; aindilis.<a
        href="https://github.com/koo5/koordinator2000/
blob/master/README.md">https://github.com/koo5/koordinator2000/blob/master/README.md</a
    >
</div>

<style>
    h1, /* h2, h3, */
    h4, h5 {
        /*border-left: 7vw solid #eef872;*/
        border-left-color: rgb(238, 248, 114);
        border-left-style: solid;
        border-left-width: 2vw;
        /*border-radius: 10em;*/
        /*border-right-style: solid;
		border-right-width: 7vw;
		border-right-color: rgb(238, 248, 114);*/

        font-family: serif;
        margin-top: 1em;
        margin-bottom: 1em;
        /* margin-left: calc(calc(50% - 30rem) - min(calc(50% - 30rem), 6em)); */
        padding: 0;
        margin-left: max(min(0, calc(30rem - 50%)), min(-10em, max(0em, calc(0px - min(calc(50% - 30rem))))));
        /*margin-right: clamp(0px, calc((50% - 30rem) - 10em), calc(50% - 30rem));*/
    }
</style>
