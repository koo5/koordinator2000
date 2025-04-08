<script lang="ts">
    import Campaign from './Campaign.svelte';
    import { type Campaign as CampaignType, my_user } from '$lib/client/my_user.ts';
    import { scrollTo } from '$lib/client/scroll-utils';
    import { browser } from '$app/environment';
    import { mobile, debug } from '$lib/stores.ts';
    import { onDestroy, onMount } from 'svelte';
    import { register } from 'swiper/element/bundle';


    export let items: CampaignType[];
    export let ids: number[] = [];


    let campaign_containers: HTMLDivElement | null = null;
    let my_timeout: ReturnType<typeof setTimeout> | undefined;
    let campaigns: CampaignType[] = [];


    // Register Swiper elements when the component mounts
    onMount(() => {
        if (browser) {
            register();

            // Add event listeners for mobile buttons
            setupMobileButtons();

            // Handle resize events to switch between mobile and desktop
            window.addEventListener('resize', handleResize);
            handleResize();
        }
    });

    // Clean up event listeners
    onDestroy(() => {
        if (browser) {
            window.removeEventListener('resize', handleResize);
        }
    });

    // Function to handle window resize
    function handleResize() {
        const isMobile = window.innerWidth <= 768;
        document.documentElement.classList.toggle('is-mobile', isMobile);
    }

    // Set up event listeners for mobile buttons
    function setupMobileButtons() {
        setTimeout(() => {
            // Find all mobile buttons and attach event handlers
            document.querySelectorAll('.mobile-btn').forEach(btn => {
                btn.addEventListener('click', handleMobileButtonClick);
            });
        }, 500);
    }

    // Handle mobile button clicks
    function handleMobileButtonClick(event: Event) {
        const button = event.currentTarget as HTMLElement;
        const campaignWrapper = button.closest('.campaign-wrapper') as HTMLElement;
        const campaignId = parseInt(campaignWrapper?.dataset.campaignId || '0', 10);

        if (button.classList.contains('dismiss')) {
            console.log('Mobile: Dismiss campaign', campaignId);
            // Implement dismiss logic
        } else if (button.classList.contains('participate')) {
            console.log('Mobile: Participate in campaign', campaignId);
            // Implement participate logic
            go_to_next_campaign(campaignId);
        } else if (button.classList.contains('dismiss-all')) {
            console.log('Mobile: Dismiss all campaigns', campaignId);
            // Implement dismiss all logic
        } else if (button.classList.contains('participate-all')) {
            console.log('Mobile: Participate in all campaigns', campaignId);
            // Implement participate all logic
        }
    }


    // Sort campaigns function to maintain the order specified by the ids array
    function sort_campaigns(ids: number[], unsorted_query_result): CampaignType[] {

        let items = unsorted_query_result?.campaigns || [];

        console.log('Sorting campaigns:', ids, items);

        if (!items) {
            console.log('No items to sort');
            return [];
        }

        const by_ids: Record<number, CampaignType> = {};

        items.forEach((c: CampaignType) => {
            by_ids[c.id] = c;
        });

        const result: CampaignType[] = [];

        ids.forEach((id: number) => {
            if (by_ids[id]) {
                result.push(by_ids[id]);
            }
        });

        console.log('Sorted campaigns:', result);
        return result;
    }

    $: campaigns = sort_campaigns(ids, items);


    // Reference to store swiper instances
    const swiperInstances: Record<number, any> = {};

    // Swiper parameters
    const swiperParams = {
        initialSlide: 2, // Start at the center slide (index 2)
        centeredSlides: true,
        spaceBetween: 10,
        grabCursor: true,
        pagination: {
            clickable: true,
            renderBullet: (index: number, className: string) => {
                const names = ['Dismiss All', 'Dismiss', 'View', 'Participate', 'Participate All'];
                return `<span class="${className}">${names[index]}</span>`;
            },
        },
        //keyboard: true,
        mousewheel: true,
        navigation: true,
        resistanceRatio: 0,
        threshold: 10,
        simulateTouch: true,
        followFinger: true,
    };

    function handleSlideChange(campaignId: number, swiper: any) {
        if (!$my_user.autoscroll) return;

        const activeIndex = swiper.activeIndex;

        // Only run auto-scroll if user moved away from the center slide
        if (activeIndex !== 2) {
            // Wait a bit for animations to complete, then scroll to next campaign
            my_timeout = setTimeout(() => {
                go_to_next_campaign(campaignId);
            }, 1000);
        }
    }

    function go_to_next_campaign(current_campaign_id: number): void {
        if (!$my_user.autoscroll) return;

        // Make sure campaign container exists
        if (!campaign_containers) return;
        const containerElement = campaign_containers as unknown as HTMLElement;
        if (!containerElement.children) return;

        const children = containerElement.children;
        for (let i = 0; i < children.length; i++) {
            const ch = children[i] as HTMLElement;
            if (!ch.dataset) return;

            const j = ch.dataset.campaignId;
            if (current_campaign_id.toString() === j) {
                const next_ch = children[i + 1] as HTMLElement;
                if (!next_ch) return;

                // Scroll to next campaign
                scrollTo({ delay: 0, element: next_ch });
                return;
            }
        }
    }

    // We don't need this interface anymore as we're using 'any' type

    // Initialize the Swiper instances after the DOM is updated
    function swiperInitialized(event: any, campaignId: number) {
        console.log('Swiper initialized for campaign:', campaignId);
        // Store reference to swiper instance
        const swiper = event.detail[0];
        swiperInstances[campaignId] = swiper;

        // Apply custom parameters programmatically
        Object.keys(swiperParams).forEach(key => {
            swiper.params[key] = swiperParams[key];
        });

        // Set specific handlers for better touch handling
        swiper.params.touchStartPreventDefault = false;
        swiper.params.touchStartForcePreventDefault = false;
        swiper.params.touchReleaseOnEdges = true;
        swiper.params.longSwipesRatio = 0.2;
        swiper.params.longSwipesMs = 100;
        swiper.params.autoHeight = false; // Ensure fixed height for all slides

        // Make sure height is consistent on desktop and scrollable on mobile
        setTimeout(() => {
            // Check if we're on mobile
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                // For mobile: enable scroll indicators and ensure slides are full height
                const slides = document.querySelectorAll(`[data-campaign-id="${campaignId}"] swiper-slide`);
                const slideHeight = window.innerHeight * 0.9; // 90% of viewport height

                slides.forEach(slide => {
                    const slideEl = slide as HTMLElement;

                    // Set height
                    slideEl.style.maxHeight = `${slideHeight}px`;

                    // Add scroll indicator if content is taller than container
                    const slideContent = slideEl.firstElementChild as HTMLElement;
                    if (slideContent && slideContent.scrollHeight > slideEl.clientHeight) {
                        // Create indicator if it doesn't exist
                        if (!slideEl.querySelector('.scroll-indicator')) {
                            const indicator = document.createElement('div');
                            indicator.className = 'scroll-indicator';
                            slideEl.appendChild(indicator);
                        }
                    }
                });
            } else {
                // For desktop: Find the tallest slide and set all slides to that height
                const slides = document.querySelectorAll(`[data-campaign-id="${campaignId}"] swiper-slide`);
                let maxHeight = 0;

                slides.forEach(slide => {
                    const slideEl = slide as HTMLElement;
                    const slideHeight = slideEl.offsetHeight;
                    if (slideHeight > maxHeight) {
                        maxHeight = slideHeight;
                    }
                });

                // Add 20px padding to ensure content fits
                maxHeight += 20;

                // Set height for all slides
                slides.forEach(slide => {
                    const slideEl = slide as HTMLElement;
                    slideEl.style.minHeight = `${maxHeight}px`;
                });
            }

            // Update swiper to reflect new heights
            swiper.update();
        }, 500);

        // Update swiper with the new parameters
        swiper.update();

        // Add event listeners for better cursor handling
        const swiperEl = document.querySelector(`[data-campaign-id="${campaignId}"] swiper-container`);
        if (swiperEl) {
            swiperEl.addEventListener('mousedown', () => {
                document.body.style.cursor = 'grabbing';
            });

            document.addEventListener('mouseup', () => {
                document.body.style.cursor = '';
            });
        }

        // Add slide change event handler
        swiper.on('slideChange', () => {
            handleSlideChange(campaignId, swiper);
        });
    }
</script>

<!-- Import Swiper styles -->
<svelte:head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
</svelte:head>

<!--ids: {JSON.stringify(ids)}-->
{#if $debug}CampaignListSorted ids={JSON.stringify(ids)}{/if}

<div bind:this={campaign_containers} class="campaign-container">
        {#each campaigns as campaign (campaign.id)}
            {#if browser}
                {#if !$mobile}
                    <div class="campaign-wrapper" data-campaign-id={campaign.id}>
                        <!-- Desktop: Swiper with horizontal slides -->
                        <div class="desktop-view">
                            <swiper-container class="campaign-swiper" data-campaign-id={campaign.id} initial-slide="2" centered-slides="true" space-between="10" slides-per-view="1" grab-cursor="true" navigation="true" resistance-ratio="0" threshold="10" simulate-touch="true" follow-finger="true" on:swiperinitialized={e => swiperInitialized(e, campaign.id)}>
                                <!-- Slide 0: Far Left - Dismiss All -->
                                <swiper-slide class="campaign-slide dismiss-all">
                                    <div class="action-panel">
                                        <h3>Dismiss All</h3>
                                        <p>Dismiss all campaigns of this cause/user</p>
                                        <button class="btn-action btn-dismiss-all">Dismiss all campaigns of this cause </button>
                                        <button class="btn-action btn-dismiss-user">Dismiss all campaigns of this user </button>
                                    </div>
                                </swiper-slide>

                                <!-- Slide 1: Left - Dismiss -->
                                <swiper-slide class="campaign-slide dismiss">
                                    <div class="action-panel">
                                        <h3>Dismiss</h3>
                                        <p>I don't care about this cause</p>
                                        <button class="btn-action btn-dismiss">Dismiss this campaign</button>
                                    </div>
                                </swiper-slide>

                                <!-- Slide 2: Center (Main) - Campaign View -->
                                <swiper-slide class="campaign-slide main">
                                    <div class="campaign-content">
                                        <Campaign {campaign} on:my_participation_upsert={() => go_to_next_campaign(campaign.id)} />
                                    </div>
                                </swiper-slide>

                                <!-- Slide 3: Right - Participate -->
                                <swiper-slide class="campaign-slide participate">
                                    <div class="action-panel">
                                        <h3>Participate</h3>
                                        <p>Mark as participating in this campaign</p>
                                        <button class="btn-action btn-participate">Participate in this campaign</button>
                                    </div>
                                </swiper-slide>

                                <!-- Slide 4: Far Right - Participate All -->
                                <swiper-slide class="campaign-slide participate-all">
                                    <div class="action-panel">
                                        <h3>Participate All</h3>
                                        <p>Participate in all related campaigns</p>
                                        <button class="btn-action btn-participate-all">Participate in all campaigns of this cause </button>
                                        <button class="btn-action btn-participate-user">Participate in all campaigns of this user </button>
                                    </div>
                                </swiper-slide>
                            </swiper-container>
                        </div>
                    </div>
                {:else}
                    <!-- Mobile: Simple card with action buttons -->
                    <div class="mobile-view">
                        <div class="campaign-card">
                            <div class="campaign-content-mobile">
                                <Campaign {campaign} on:my_participation_upsert={() => go_to_next_campaign(campaign.id)} />
                            </div>

                            <div class="mobile-actions">
                                <div class="button-row">
                                    <button class="mobile-btn dismiss">Dismiss</button>
                                    <button class="mobile-btn participate">Participate</button>
                                </div>
                                <div class="button-row secondary-actions">
                                    <button class="mobile-btn small dismiss-all">Dismiss All</button>
                                    <button class="mobile-btn small participate-all">Participate All</button>
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
            {:else}
                <!-- SSR fallback to show campaigns without swiper -->
                <div class="campaign-fallback">
                    <Campaign {campaign} on:my_participation_upsert={() => go_to_next_campaign(campaign.id)} />
                </div>
            {/if}
        {:else}
            <div class="no-campaigns">No campaigns found</div>
        {/each}

</div>

<style>
    :global(.info_tooltip) {
        padding: 1em;
    }

    :global(.confirmed) {
        background-color: #aaffaa;
    }

    :global(.condition_is_fulfilled) {
        background-color: #ccffcc;
    }

    :global(.condition_is_not_fulfilled) {
        background-color: #ffffcc;
    }

    .campaign-wrapper {
        margin: 2rem 0;
        position: relative;
        display: flex;
        flex-direction: column;
    }

    /* Mobile-specific styles for campaign wrapper */
    @media (max-width: 768px) {
        .campaign-wrapper {
            margin: 0.5rem 0;
        }
    }

    .campaign-fallback {
        margin: 1rem 0;
        padding: 1rem;
        border: 1px solid #eee;
    }

    :global(swiper-container) {
        width: 100%;
        height: auto;
        display: flex;
        align-items: center;
        --swiper-theme-color: #ff3e00;
        --swiper-pagination-bullet-inactive-color: #999;
        --swiper-navigation-color: #ff3e00;
        --swiper-navigation-size: 30px;
        touch-action: pan-y;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
    }

    /* Mobile-specific styles */
    @media (max-width: 768px) {
        :global(swiper-container) {
            height: 95vh; /* Fixed height on mobile */
            max-height: 95vh;
            min-height: 95vh;
        }
    }

    :global(swiper-slide) {
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: transform 300ms ease;
        height: auto;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Mobile-specific styles for slides */
    @media (max-width: 768px) {
        :global(swiper-slide) {
            overflow-y: auto; /* Enable vertical scrolling */
            max-height: 90vh; /* Fixed height with some room for pagination */
            align-items: flex-start; /* Align content to top to allow scrolling */
            padding-bottom: 4rem; /* Extra padding at bottom for visibility */
        }
    }

    :global(.swiper-initialized) {
        cursor: grab;
    }

    :global(.swiper-initialized:active) {
        cursor: grabbing;
    }

    :global(.campaign-slide) {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.3s ease;
        height: 100%;
        min-height: 60vh;
    }

    :global(.dismiss-all) {
        background-color: #ffe5e5;
    }

    :global(.dismiss) {
        background-color: #fff0e0;
    }

    :global(.main) {
        background-color: #ffffff;
    }

    :global(.participate) {
        background-color: #e0ffe0;
    }

    :global(.participate-all) {
        background-color: #d0ffd0;
    }

    .action-panel {
        text-align: center;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
    }

    /* Mobile-specific styles for action panels */
    @media (max-width: 768px) {
        .action-panel {
            justify-content: flex-start;
            padding-top: 2rem;
            overflow-y: auto;
        }
    }

    .action-panel h3 {
        margin-top: 0;
        margin-bottom: 0;
    }

    .action-panel p {
        color: #666;
    }

    :global(.btn-action) {
        display: inline-block;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    :global(.btn-dismiss-all),
    :global(.btn-dismiss) {
        background-color: #ffcccc;
        color: #990000;
    }

    :global(.btn-participate),
    :global(.btn-participate-all) {
        background-color: #ccffcc;
        color: #006600;
    }

    :global(.btn-dismiss-all:hover),
    :global(.btn-dismiss:hover) {
        background-color: #ffaaaa;
    }

    :global(.btn-participate:hover),
    :global(.btn-participate-all:hover) {
        background-color: #aaffaa;
    }

    .campaign-content {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    /* Mobile-specific styles for campaign content */
    @media (max-width: 768px) {
        .campaign-content {
            overflow-y: auto;
            justify-content: flex-start;
            padding-bottom: 2rem;
        }
    }

    .no-campaigns {
        padding: 2rem;
        text-align: center;
        font-style: italic;
        color: #666;
    }

    /* Mobile view styles */
    .desktop-view {
        display: block;
    }

    .mobile-view {
        display: none;
    }

    .campaign-card {
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
    }

    .campaign-content-mobile {
        flex: 1;
        min-height: fit-content;
        display: flex;
        flex-direction: column;
    }

    .mobile-actions {
        margin-top: 2rem;
        border-top: 1px solid #eee;
        padding-top: 1.5rem;
        position: relative;
    }

    /* Add visual separation */
    .mobile-actions::before {
        content: '';
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 50px;
        height: 4px;
        background-color: #f0f0f0;
        border-radius: 2px;
    }

    .button-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        gap: 0.5rem;
    }

    .secondary-actions {
        margin-top: 0.5rem;
    }

    .mobile-btn {
        flex: 1;
        padding: 0.75rem 0.5rem;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        min-height: 48px; /* Minimum touch target size */
    }

    .mobile-btn:active {
        transform: translateY(1px);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .mobile-btn.small {
        padding: 0.5rem 0.25rem;
        font-size: 0.85rem;
        min-height: 40px;
    }

    .mobile-btn.dismiss {
        background-color: #fff0e0;
        color: #990000;
    }

    .mobile-btn.participate {
        background-color: #e0ffe0;
        color: #006600;
    }

    .mobile-btn.dismiss-all {
        background-color: #ffe5e5;
        color: #990000;
    }

    .mobile-btn.participate-all {
        background-color: #d0ffd0;
        color: #006600;
    }


    /* Make sure items stay in a single column */
    :global(.subscribed-items-inner) {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
    }

    /* Media queries for responsive design */
    @media (max-width: 768px) {
        .desktop-view {
            display: none;
        }

        .mobile-view {
            display: block;
            width: 100% !important;
            max-width: 100vw !important;
            flex-basis: 100% !important;
            flex-shrink: 0 !important;
            box-sizing: border-box !important;
            overflow-x: hidden !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            padding-left: env(safe-area-inset-left, 1rem) !important;
            padding-right: env(safe-area-inset-right, 1rem) !important;
        }

        .campaign-wrapper {
            margin: 1rem 0;
            min-height: auto;
            width: 100%;
            flex-basis: 100%;
            flex-shrink: 0;
            box-sizing: border-box;
        }

        .campaign-card {
            height: auto;
            min-height: auto;
            max-height: none;
            display: flex;
            flex-direction: column;
            width: 100%;
            box-sizing: border-box;
        }

        /* Make campaign content has full height and doesn't get truncated */
        :global(.mobile-view .campaign-content) {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
        }

        :global(.mobile-view :is(article, section, div)) {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
        }

        /* Additional styles for campaign content */
        .campaign-content-mobile {
            height: auto !important;
            min-height: fit-content !important;
        }

        :global(.campaign-content-mobile > *) {
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
            overflow: visible !important;
        }

        /* Fix container layout issues - more aggressive approach */
        :global(body),
        :global(body > div),
        :global(body > div > div),
        :global(main),
        :global(.container),
        :global(.row),
        :global(.col) {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: hidden !important;
            flex-basis: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            box-sizing: border-box !important;
        }

        /* Force single column layout */
        :global(.campaign-container > div),
        :global(.campaign-container > div > div),
        :global(.campaign-wrapper) {
            display: block !important;
            width: 100% !important;
            grid-template-columns: 1fr !important;
            column-count: 1 !important;
            columns: 1 !important;
        }
    }
</style>
