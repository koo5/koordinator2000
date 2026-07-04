/**
 * Czech dictionary. Plural forms: `.one` (1), `.few` (2–4), `.other` (0, 5+);
 * Intl.PluralRules('cs') selects among them. Missing keys fall back to English.
 */
export const cs: Record<string, string> = {
    // header / nav
    'nav.campaigns': 'Kampaně',
    'nav.notifications': 'Oznámení',
    'nav.about': 'O projektu',
    'nav.start_campaign': '+ Založit kampaň',
    'nav.profile': 'Profil',
    'nav.account': 'Účet',
    'nav.verify_identity': 'Ověřit identitu',
    'nav.settings': 'Nastavení',
    'nav.logout': 'Odhlásit se',
    'nav.login': 'Přihlásit se',
    'nav.new_user': 'Nový uživatel',
    'nav.account_menu': 'Účet',

    // discovery toolbar
    'search.placeholder': 'Hledat kampaně',
    'search.button': 'Hledat',
    'search.sort_most_pledged': 'Nejvíce příslibů',
    'search.sort_recent': 'Nedávno aktivní',
    'search.sort_newest': 'Nejnovější',
    'search.sort_title': 'Název A–Z',
    'search.no_match': 'Žádné kampaně neodpovídají filtrům.',
    'search.load_more': 'Načíst další',

    // campaign sections
    'campaign.tags': 'Štítky',
    'campaign.my_participation': 'Moje účast',
    'campaign.progress': 'Průběh',
    'campaign.participants': 'Účastníci',
    'campaign.participants_hint': 'seřazeno podle prahu — každý se přidá, když se zapojí dost dalších',
    'campaign.not_interested': '✕ Nezajímá mě',

    // pledge control
    'pledge.prefix': 'Přidám se, když se zapojí',
    'pledge.suffix.one': 'další člověk',
    'pledge.suffix.few': 'další lidé',
    'pledge.suffix.other': 'dalších lidí',
    'pledge.button': '✓ Přislíbit',
    'pledge.update': 'Upravit',
    'pledge.withdraw': 'Odvolat',
    'pledge.suggested': 'doporučeno {lo}–{hi}, výchozí {def}',
    'pledge.not_pledged': 'U této kampaně zatím nemáte příslib.',
    'pledge.waiting': 'Přislíbeno — čeká se na další lidi.',
    'pledge.active': 'Váš práh je dosažen — vaše účast je aktivní.',

    // progress
    'progress.pledged.one': '{n} příslib',
    'progress.pledged.few': '{n} přísliby',
    'progress.pledged.other': '{n} příslibů',
    'progress.goal': 'cíl: {n}',
    'progress.goal_reached': '🎉 cíl {n} dosažen',

    // participants table
    'table.who': 'kdo',
    'table.joins_when': 'přidá se, když',
    'table.status': 'stav',
    'table.in': '● účastní se',
    'table.waiting': '○ čeká',
    'table.unconditionally': 'bezpodmínečně',
    'table.n_others.one': '{n} další',
    'table.n_others.few': '{n} další',
    'table.n_others.other': '{n} dalších',
    'table.goal_more': '🎯 ještě {n} (s výchozím prahem) do cíle {m} účastníků',
    'table.goal_reached': '🎉 cíl {m} účastníků dosažen',
    'table.you': 'vy',
    'table.in_title': 'Jejich práh je dosažen — účastní se',
    'table.waiting_title': 'Čeká se, až se zapojí víc lidí',
    'table.joins_when_title': 'Přidá se, když se zapojí tolik dalších',

    // swiper / discovery deck
    'swiper.im_in': '✓ Jdu do toho',
    'swiper.skip_title': 'Přeskočit (↑)',
    'swiper.dismiss_title': 'Skrýt (←)',
    'swiper.pledge_title': 'Přislíbit (→)',
    'swiper.caught_up': '🎉 Vše prohlédnuto.',
    'swiper.adjust_filters': 'Upravte filtry výše, nebo se vraťte později.',
    'swiper.loading': 'Načítám kampaně…',
    'swiper.hint_pledge': 'JDU DO TOHO',
    'swiper.hint_dismiss': 'SKRÝT',
    'swiper.hint_skip': 'PŘESKOČIT',
    'swiper.participating.one': '👥 {n} se účastní',
    'swiper.participating.few': '👥 {n} se účastní',
    'swiper.participating.other': '👥 {n} se účastní',
    'swiper.swipe_meta.one': '· přejetím doprava se přidáte, když se zapojí {n} další člověk',
    'swiper.swipe_meta.few': '· přejetím doprava se přidáte, když se zapojí {n} další lidé',
    'swiper.swipe_meta.other': '· přejetím doprava se přidáte, když se zapojí {n} dalších lidí',

    // action toast
    'toast.pledged.one': '✅ Přislíbeno — přidáte se, když se zapojí {n} další člověk.',
    'toast.pledged.few': '✅ Přislíbeno — přidáte se, když se zapojí {n} další lidé.',
    'toast.pledged.other': '✅ Přislíbeno — přidáte se, když se zapojí {n} dalších lidí.',
    'toast.dismissed': 'Skryto: {title}.',
    'toast.dismissed_plain': 'Skryto.',
    'toast.adjust': 'Upravit',
    'toast.undo': 'Zpět',
    'toast.undo_all': 'Vzít vše zpět',
    'toast.save': 'Uložit',
    'toast.cancel': 'Zrušit',
    'toast.join_if': 'Přidám se, když se zapojí',
    'toast.others_do': 'dalších',
    'toast.pledge_all_of': 'Přislíbit vše z: {label}',
    'toast.dismiss_all_of': 'Skrýt vše z: {label}',
    'toast.pledge_all_by': 'Přislíbit vše od: {label}',
    'toast.dismiss_all_by': 'Skrýt vše od: {label}',
    'toast.bulk_pledged': '✅ Přislíbeno všech {n} z: {label}.',
    'toast.bulk_dismissed': 'Skryto všech {n} z: {label}.',

    // listing (desktop)
    'listing.not_interested': '✕ Nezajímá mě',

    // login
    'login.title': 'Přihlášení',
    'login.subtitle':
        'Přihlášením přidáte ke svému účtu ověřenou identitu — nikdy jej nenahradí. Pokud jste Koordinator používali anonymně, vaše přísliby zůstávají.',
    'login.github': 'Pokračovat přes GitHub',
    'login.google': 'Pokračovat přes Google',
    'login.or_email': 'nebo použijte e-mail — bez hesla',
    'login.email_placeholder': 'vy@priklad.cz',
    'login.send_link': 'Poslat přihlašovací odkaz',
    'login.sending': 'Odesílám…',
    'login.sent': 'Podívejte se do e-mailu na přihlašovací odkaz.',
    'login.failed': 'Odkaz se nepodařilo odeslat.',
    'login.dev_link': 'Vývojářský odkaz (e-mail není nastaven):',
    'login.dev_link_open': 'otevřít',
};
