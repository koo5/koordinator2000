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
    'search.sort_nearest': 'Nejbližší',
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

    // home (auth error banner)
    'home.auth_error_title': 'Chyba přihlášení',
    'home.auth_error_body': 'Při přihlašování nastal problém: {error}',
    'home.auth_error_retry': 'Zkuste to prosím znovu; pokud problém přetrvává, ozvěte se nám.',

    // error page
    'error.home': 'Zpět na hlavní stránku',

    // auth completion
    'authc.signing_in': 'Přihlašuji…',
    'authc.done': 'Přihlášeno! Přesměrovávám…',
    'authc.failed': 'Přihlášení se nepodařilo dokončit.',

    // campaign detail page
    'detail.slug_lookup': 'Hledám kampaň…',
    'detail.not_found': 'Tato kampaň neexistuje.',
    'detail.loading': 'Kampaň se načítá…',
    'detail.more': 'další kampaně',

    // notifications
    'notif.mark_all': 'Označit vše jako přečtené',
    'notif.empty': 'Zatím žádná oznámení. Přijdou, když kampaň překročí některý z vašich prahů.',
    'notif.mark_read': 'Označit jako přečtené',
    'notif.mark_unread': 'Označit jako nepřečtené',
    'notif.unknown_campaign': 'Neznámá kampaň',
    'time.just_now': 'právě teď',
    'time.m_ago': 'před {n} min',
    'time.h_ago': 'před {n} h',
    'time.d_ago': 'před {n} dny',

    // account page
    'account.title': 'Správa účtu',
    'account.your': 'Váš účet',
    'account.username': 'Uživatelské jméno:',
    'account.not_set': 'Nenastaveno',
    'account.id': 'ID účtu:',
    'account.danger': 'Nebezpečná zóna',
    'account.delete_info': 'Potřebujete smazat účet? Můžete na vyhrazené stránce.',
    'account.delete_link': 'Smazat účet →',
    'account.delete_help': 'Více o mazání účtu najdete v našem dokumentu',
    'account.delete_guide': 'průvodce mazáním dat',

    // verified identities
    'ident.title': 'Ověřené identity',
    'ident.subtitle': 'Každá ověřená identita zvyšuje důvěryhodnost vašeho účtu. Můžete jich připojit víc.',
    'ident.loading': 'Načítám…',
    'ident.error': 'Identity se nepodařilo načíst.',
    'ident.none': 'Zatím žádné ověřené identity — tento účet je anonymní.',
    'ident.add': 'Přidat ověřenou identitu',

    // delete account
    'del.title': 'Smazání účtu',
    'del.warning': 'Pozor: Smazání účtu je trvalé a nelze jej vzít zpět. Všechna vaše data budou nenávratně odstraněna.',
    'del.button': 'Smazat můj účet',
    'del.confirm_text': 'Opravdu chcete svůj účet smazat? Tuto akci nelze vzít zpět.',
    'del.cancel': 'Zrušit',
    'del.deleting': 'Mažu…',
    'del.confirm': 'Potvrdit smazání',

    // start-a-campaign form
    'addc.title': 'Založit kampaň',
    'addc.subtitle': 'Popište společnou akci a navrhněte, kolik lidí je potřeba, aby měla smysl. Lidé slibují účast s vlastním prahem — „přidám se, když se zapojí N dalších".',
    'addc.form_title': 'Název',
    'addc.title_placeholder': 'např. Bojkot MegaCorpu, dokud nezmění dodavatele X',
    'addc.description': 'Popis',
    'addc.desc_placeholder': 'O jakou akci jde, na koho míří a kdy je cíle dosaženo?',
    'addc.thresholds': 'Prahy',
    'addc.min_hint': 'Minimum — pod touto hranicí účast nemá účinek (nebo hrozí újma)',
    'addc.default_hint': 'Doporučený výchozí práh — cíl kampaně',
    'addc.max_hint': 'Nejvyšší smysluplný — např. velikost dotčené komunity',
    'addc.created': '🎉 Kampaň založena!',
    'addc.add_tags': 'Přidejte štítky, ať ji lidé najdou',
    'addc.view': 'Zobrazit kampaň',
    'addc.another': 'Založit další',
    'addc.submit': 'Založit kampaň',

    // nag modal
    'nag.title': 'Prosíme!',
    'nag.done': 'Hotovo',
    'nag.later': 'Připomenout později',
    'nag.never': 'Nepřipomínat',

    // you / profile
    'you.welcome': 'Vítejte!',
    'you.assigned_username': 'Vaše automaticky přidělené uživatelské jméno je „{name}".',
    'you.enter_email': 'Přidejte prosím svůj e-mail nebo se přihlaste přes poskytovatele — jinak můžete o účet přijít!',
    'you.account': 'účet',
    'you.username': 'uživatelské jméno',
    'you.change': '(změnit…)',
    'you.save': 'Uložit',
    'you.authentication': 'přihlášení',
    'you.loading_account': 'Načítám údaje účtu…',
    'you.link_social': 'Propojte svůj účet s dalším přihlášením:',
    'you.login': 'Přihlásit se:',
    'you.messaging': 'zprávy',
    'you.email_optin': 'zaškrtnutím políček souhlasíte se zasíláním e-mailů:',
    'you.optin1': 'dostávat e-mail, když kampaň, které se účastním, dosáhne cíle',
    'you.optin2': 'dostávat novinky o mých kampaních',
    'you.optin3': 'občas dostávat novinky o projektu Fullcracy/Koordinator',

    // about
    'about.intro': 'Koordinator je platforma pro koordinaci kampaní a společných akcí. Pomáhá lidem organizovat se a zapojovat do nejrůznějších iniciativ. Na crowdfundingovém webu lidé podporují kampaně přislíbením peněz — když se jich sejde dost, autor je může vybrat. Na Koordinatoru slibujete svou účast v kampaních, a to za podmínek, které si sami určíte. Když jsou podmínky splněny, dostanete zprávu — a pak se očekává, že se zapojíte.',
    'about.open_source': 'Otevřený software',
    'about.view_source': 'Zdrojový kód na GitHubu',
    'about.contact': 'Kontakt',
    'about.help': 'Pomozte',
    'about.fund': 'Podpořte',


    // account page


    // notifications

    // campaign detail page

    // profile / nag
    'you.email': 'E-mail:',
    'you.title': 'Váš profil',
    'you.user_id': 'ID uživatele:',
    'you.loading': 'Načítám data uživatele…',


    // tag manager
    'tags.none': 'Bez štítků',
    'tags.add_button': '+ Přidat štítky',
    'tags.add_existing': 'Přidat existující štítek',
    'tags.select': 'Vyberte štítek',
    'tags.add': 'Přidat',
    'tags.create_new': 'Vytvořit nový štítek',
    'tags.new_ph': 'Název nového štítku',
    'tags.create': 'Vytvořit',
    'tags.remove': 'Odebrat štítek',
    'tags.added': 'Štítek přidán',
    'tags.removed': 'Štítek odebrán',
    'tags.created': 'Štítek vytvořen',

    // misc
    'misc.loading': 'Načítám…',

    // add cause
    'cause.intro': 'Více kampaní lze seskupit pod jednu kauzu. Než začnete vyplňovat údaje, zvažte ověření identity, ať vaše data nezůstanou bez vlastníka.',
    'cause.submit': 'Přidat kauzu',

    // location
    'loc.section': 'Místo (volitelné)',
    'loc.hint': 'Kde je kampaň relevantní? Místní kampaně osloví ty správné lidi.',
    'loc.search_ph': 'Hledat místo…',
    'loc.search': 'Hledat',
    'loc.use_mine': 'Použít moji polohu',
    'loc.map_label': 'Mapa pro výběr místa',
    'loc.click_hint': 'Klikněte do mapy pro umístění bodu; níže upravte okruh působnosti.',
    'loc.radius': 'okruh',
    'loc.clear': 'Odebrat místo',
    'near.button': '📍 Poblíž mě',
    'near.on': '📍 Poblíž mě ({km} km)',
    'near.denied': 'Přístup k poloze byl odepřen.',

    // language field + deck filter
    'lang.field': 'Jazyk',
    'lang.hint': 'Jazyk, ve kterém je kampaň napsaná — zobrazí se čtenářům tohoto jazyka.',
    'lang.en': 'Angličtina',
    'lang.cs': 'Čeština',
    'lang.unspecified': 'Neurčeno',
    'deck.all_languages': '🌐 Všechny jazyky',
    'deck.my_language': '🌐 Jen {lang}',

    // edit campaign (maintainer only)
    'edit.button': '✎ Upravit kampaň',
    'edit.title': 'Upravit kampaň',
    'edit.save': 'Uložit změny',
    'edit.saving': 'Ukládám…',
    'edit.cancel': 'Zrušit',
    'edit.saved': '✅ Uloženo.',
    'edit.error': 'Změny se nepodařilo uložit.',

    // country field + deck filter
    'country.CZ': 'Česko',
    'country.US': 'Spojené státy',
    'country.global': 'Globální (bez země)',
    'country.field': 'Země',
    'country.hint': 'Které země se kampaň týká — pomáhá ji ukázat správnému publiku.',
    'deck.everywhere': '🌍 Všude',
};
