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
    'search.sort_nearest': 'Nearest',
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

    // home (auth error banner)
    'home.auth_error_title': 'Authentication Error',
    'home.auth_error_body': 'There was a problem with authentication: {error}',
    'home.auth_error_retry': 'Please try again or contact support if the problem persists.',

    // error page
    'error.home': 'Go to home page',

    // auth completion
    'authc.signing_in': 'Signing you in…',
    'authc.done': 'Signed in! Redirecting…',
    'authc.failed': 'Sign-in could not be completed.',

    // campaign detail page
    'detail.slug_lookup': 'Looking up campaign…',
    'detail.not_found': "This campaign doesn't exist.",
    'detail.loading': 'Campaign is loading…',
    'detail.more': 'more campaigns',

    // notifications
    'notif.mark_all': 'Mark all read',
    'notif.empty': 'No notifications yet. They arrive when a campaign crosses one of your thresholds.',
    'notif.mark_read': 'Mark as read',
    'notif.mark_unread': 'Mark as unread',
    'notif.unknown_campaign': 'Unknown Campaign',
    'time.just_now': 'just now',
    'time.m_ago': '{n}m ago',
    'time.h_ago': '{n}h ago',
    'time.d_ago': '{n}d ago',

    // account page
    'account.title': 'Account Management',
    'account.your': 'Your Account',
    'account.username': 'Username:',
    'account.not_set': 'Not set',
    'account.id': 'Account ID:',
    'account.danger': 'Danger Zone',
    'account.delete_info': 'Need to delete your account? You can do that from our dedicated page.',
    'account.delete_link': 'Delete Account →',
    'account.delete_help': 'Learn more about account deletion in our',
    'account.delete_guide': 'data deletion guide',

    // verified identities
    'ident.title': 'Verified identities',
    'ident.subtitle': 'Each verified identity adds trust to your account. You can connect more than one.',
    'ident.loading': 'Loading…',
    'ident.error': "Couldn't load your identities.",
    'ident.none': 'No verified identities yet — this account is anonymous.',
    'ident.add': 'Add a verified identity',

    // delete account
    'del.title': 'Delete Account',
    'del.warning': 'Warning: Deleting your account is permanent and cannot be undone. All your data will be permanently removed.',
    'del.button': 'Delete My Account',
    'del.confirm_text': 'Are you sure you want to delete your account? This action cannot be undone.',
    'del.cancel': 'Cancel',
    'del.deleting': 'Deleting…',
    'del.confirm': 'Confirm Delete',

    // start-a-campaign form
    'addc.title': 'Start a campaign',
    'addc.subtitle': 'Describe the collective action, and suggest how many people it takes to matter. People pledge with their own threshold — "I\'ll join if N others do."',
    'addc.form_title': 'Title',
    'addc.title_placeholder': 'e.g. Boycott MegaCorp until they drop supplier X',
    'addc.description': 'Description',
    'addc.desc_placeholder': "What's the action, who is it aimed at, and when is the goal reached?",
    'addc.thresholds': 'Thresholds',
    'addc.min_hint': 'Minimum — below this, participating brings no effect (or risks harm)',
    'addc.default_hint': 'Suggested default — the campaign goal',
    'addc.max_hint': 'Maximum sensible — e.g. the size of the affected community',
    'addc.created': '🎉 Campaign created!',
    'addc.add_tags': 'Add tags so people can find it',
    'addc.view': 'View your campaign',
    'addc.another': 'Create another',
    'addc.submit': 'Create campaign',

    // nag modal
    'nag.title': 'Please!',
    'nag.done': 'Done',
    'nag.later': 'Remind me later',
    'nag.never': 'Remind me never',

    // you / profile
    'you.welcome': 'Welcome, visitor!',
    'you.assigned_username': 'Your automatically-assigned username is "{name}".',
    'you.enter_email': 'Please add your e-mail or sign in with a provider — otherwise you can lose access to your account!',
    'you.account': 'account',
    'you.username': 'username',
    'you.change': '(change…)',
    'you.save': 'Save',
    'you.authentication': 'authentication',
    'you.loading_account': 'Loading account data…',
    'you.link_social': 'Link your account to a social login:',
    'you.login': 'Log in:',
    'you.messaging': 'messaging',
    'you.email_optin': 'also, tick these checkboxes to agree to receive e-mail from us:',
    'you.optin1': 'receive e-mail when a campaign I participate in reaches its suggested threshold',
    'you.optin2': 'receive news about my campaigns',
    'you.optin3': 'receive occasional news about Fullcracy/Koordinator',

    // about
    'about.intro': 'Koordinator is a platform for coordinating campaigns and actions. It helps people organize and participate in various initiatives. On a crowdfunding website, people support campaigns by pledging money. If enough money is pledged, the campaign author can collect them. On Koordinator, you pledge your participation in campaigns, under conditions that you set. You are notified when the conditions are met, and you are then expected to participate.',
    'about.open_source': 'Open Source',
    'about.view_source': 'View source on GitHub',
    'about.contact': 'Contact',
    'about.help': 'Help',
    'about.fund': 'Fund',


    // account page


    // notifications

    // campaign detail page

    // profile / nag
    'you.email': 'E-mail:',
    'you.title': 'Your profile',
    'you.user_id': 'User ID:',
    'you.loading': 'Loading user data…',


    // tag manager
    'tags.none': 'No tags',
    'tags.add_button': '+ Add Tags',
    'tags.add_existing': 'Add existing tag',
    'tags.select': 'Select a tag',
    'tags.add': 'Add',
    'tags.create_new': 'Create new tag',
    'tags.new_ph': 'Enter new tag name',
    'tags.create': 'Create',
    'tags.remove': 'Remove tag',
    'tags.added': 'Tag added',
    'tags.removed': 'Tag removed',
    'tags.created': 'Tag created',

    // misc
    'misc.loading': 'Loading…',

    // add cause
    'cause.intro': 'Multiple campaigns can be grouped under one cause. Before filling in data, consider verifying your identity so your data does not become orphaned.',
    'cause.submit': 'Add cause',

    // location
    'loc.section': 'Location (optional)',
    'loc.hint': 'Where is this campaign relevant? Local campaigns reach the right people.',
    'loc.search_ph': 'Search for a place…',
    'loc.search': 'Search',
    'loc.use_mine': 'Use my location',
    'loc.map_label': 'Location picker map',
    'loc.click_hint': 'Click the map to set the spot; adjust the relevance radius below.',
    'loc.radius': 'radius',
    'loc.clear': 'Remove location',
    'near.button': '📍 Near me',
    'near.on': '📍 Near me ({km} km)',
    'near.denied': 'Location access was denied.',

    // language field + deck filter
    'lang.field': 'Language',
    'lang.hint': 'The language this campaign is written in — it surfaces to readers of that language.',
    'lang.en': 'English',
    'lang.cs': 'Čeština',
    'lang.unspecified': 'Unspecified',
    'deck.all_languages': '🌐 All languages',
    'deck.my_language': '🌐 {lang} only',

    // edit campaign (maintainer only)
    'edit.button': '✎ Edit campaign',
    'edit.title': 'Edit campaign',
    'edit.save': 'Save changes',
    'edit.saving': 'Saving…',
    'edit.cancel': 'Cancel',
    'edit.saved': '✅ Saved.',
    'edit.error': 'Could not save your changes.',

    // country field + deck filter
    'country.CZ': 'Czech Republic',
    'country.US': 'United States',
    'country.global': 'Global (any country)',
    'country.field': 'Country',
    'country.hint': 'Which country this campaign is about — used to surface it to the right audience.',
    'deck.everywhere': '🌍 Everywhere',

    // cause create/edit (maintainer)
    'cause.edit_title': 'Edit cause',
    'cause.title_label': 'Title',
    'cause.title_ph': 'e.g. Big Tech accountability',
    'cause.desc_label': 'Description',
    'cause.desc_ph': 'What ties these campaigns together?',
    'cause.save': 'Save cause',
    'cause.saving': 'Saving…',
    'cause.saved': '✅ Saved.',
    'cause.error': 'Could not save the cause.',
    'cause.not_found': 'This cause no longer exists.',
    'cause.not_yours': 'Only the cause’s creator can edit it.',
    'cause.loading': 'Loading…',
} as const;

export type TranslationKey = keyof typeof en;
