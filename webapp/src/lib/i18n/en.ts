/**
 * English dictionary — the source of truth for translation keys.
 * Plural forms use the `.one` / `.few` / `.many` / `.other` suffix convention
 * (picked via Intl.PluralRules; missing forms fall back to `.other`).
 */
export const en = {
    // header / nav
    'nav.campaigns': 'Campaigns',
    'nav.notifications': 'Notifications',
    'nav.about': 'About',
    'nav.start_campaign': '+ Start a campaign',
    'nav.profile': 'Profile',
    'nav.account': 'Account',
    'nav.verify_identity': 'Verify identity',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.new_user': 'New user',
    'nav.account_menu': 'Account',

    // discovery toolbar
    'search.placeholder': 'Search campaigns',
    'search.button': 'Search',
    'search.sort_most_pledged': 'Most pledged',
    'search.sort_recent': 'Recently active',
    'search.sort_newest': 'Newest',
    'search.sort_title': 'Title A–Z',
    'search.no_match': 'No campaigns match your filters.',
    'search.load_more': 'Load more',

    // campaign sections
    'campaign.tags': 'Tags',
    'campaign.my_participation': 'My participation',
    'campaign.progress': 'Progress',
    'campaign.participants': 'Participants',
    'campaign.participants_hint': 'sorted by threshold — each person joins when enough others are in',
    'campaign.not_interested': '✕ Not interested',

    // pledge control
    'pledge.prefix': "I'll join if",
    'pledge.suffix.one': 'other joins',
    'pledge.suffix.other': 'others join',
    'pledge.button': '✓ Pledge',
    'pledge.update': 'Update',
    'pledge.withdraw': 'Withdraw',
    'pledge.suggested': 'suggested {lo}–{hi}, default {def}',
    'pledge.not_pledged': "You're not pledged on this campaign.",
    'pledge.waiting': 'Pledged — waiting for more people to join.',
    'pledge.active': 'Your threshold is met — your participation is active.',

    // progress
    'progress.pledged.one': '{n} pledged',
    'progress.pledged.other': '{n} pledged',
    'progress.goal': 'goal: {n}',
    'progress.goal_reached': '🎉 goal of {n} reached',

    // participants table
    'table.who': 'who',
    'table.joins_when': 'joins when',
    'table.status': 'status',
    'table.in': '● in',
    'table.waiting': '○ waiting',
    'table.unconditionally': 'unconditionally',
    'table.n_others.one': '{n} other',
    'table.n_others.other': '{n} others',
    'table.goal_more': '🎯 {n} more (at the default threshold) to reach the goal of {m}',
    'table.goal_reached': '🎉 goal of {m} participants reached',
    'table.you': 'you',
    'table.in_title': "Their threshold is met — they're participating",
    'table.waiting_title': 'Waiting for more people to join',
    'table.joins_when_title': 'Joins when this many others participate',

    // swiper / discovery deck
    'swiper.im_in': "✓ I'm in",
    'swiper.skip_title': 'Skip (↑)',
    'swiper.dismiss_title': 'Dismiss (←)',
    'swiper.pledge_title': 'Pledge (→)',
    'swiper.caught_up': "🎉 You're all caught up.",
    'swiper.adjust_filters': 'Adjust your filters above, or check back later.',
    'swiper.loading': 'Loading campaigns…',
    'swiper.hint_pledge': "I'M IN",
    'swiper.hint_dismiss': 'DISMISS',
    'swiper.hint_skip': 'SKIP',
    'swiper.participating.one': '👥 {n} participating',
    'swiper.participating.other': '👥 {n} participating',
    'swiper.swipe_meta.one': '· swipe right to join if {n} other joins',
    'swiper.swipe_meta.other': '· swipe right to join if {n} others join',

    // action toast
    'toast.pledged.one': "✅ Pledged — you'll join if {n} other joins.",
    'toast.pledged.other': "✅ Pledged — you'll join if {n} others join.",
    'toast.dismissed': 'Dismissed {title}.',
    'toast.dismissed_plain': 'Dismissed.',
    'toast.adjust': 'Adjust',
    'toast.undo': 'Undo',
    'toast.undo_all': 'Undo all',
    'toast.save': 'Save',
    'toast.cancel': 'Cancel',
    'toast.join_if': 'Join if',
    'toast.others_do': 'others do',
    'toast.pledge_all_of': 'Pledge all of {label}',
    'toast.dismiss_all_of': 'Dismiss all of {label}',
    'toast.pledge_all_by': 'Pledge all by {label}',
    'toast.dismiss_all_by': 'Dismiss all by {label}',
    'toast.bulk_pledged': '✅ Pledged all {n} of {label}.',
    'toast.bulk_dismissed': 'Dismissed all {n} of {label}.',

    // listing (desktop)
    'listing.not_interested': '✕ Not interested',

    // login
    'login.title': 'Sign in',
    'login.subtitle':
        "Signing in adds a verified identity to your account — it never replaces it. If you've been using Koordinator anonymously, your pledges carry over.",
    'login.github': 'Continue with GitHub',
    'login.google': 'Continue with Google',
    'login.or_email': 'or use your email — no password',
    'login.email_placeholder': 'you@example.com',
    'login.send_link': 'Send me a sign-in link',
    'login.sending': 'Sending…',
    'login.sent': 'Check your email for a sign-in link.',
    'login.failed': 'Could not send the link.',
    'login.dev_link': 'Dev link (email not configured):',
    'login.dev_link_open': 'open',
} as const;

export type TranslationKey = keyof typeof en;
