/**
 * Minimal hand-rolled i18n (zero deps). Two locales: en + cs.
 *
 * Usage in components:
 *   import { t, tp, locale, set_locale } from '$lib/i18n';
 *   $t('nav.campaigns')                     — plain string
 *   $t('pledge.suggested', { lo: 1, hi: 9 }) — {param} interpolation
 *   $tp('toast.pledged', 5)                 — plural (Intl.PluralRules picks
 *                                             `.one`/`.few`/`.many`/`.other`)
 *
 * Locale resolution:
 *   server: cookie override > Accept-Language > 'en'   (see routes/+layout.server.ts)
 *   client: the layout initializes the store from server data; set_locale()
 *           persists the user's choice in the `koord_locale` cookie.
 */
import { derived, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { en, type TranslationKey } from './en.ts';
import { cs } from './cs.ts';

export type Locale = 'en' | 'cs';
export const LOCALES: Locale[] = ['en', 'cs'];
export const LOCALE_COOKIE = 'koord_locale';

const dicts: Record<Locale, Record<string, string>> = { en, cs };

export const locale = writable<Locale>('en');

export function as_locale(value: unknown): Locale | null {
    return value === 'cs' || value === 'en' ? value : null;
}

/** Set + persist the user's language choice (cookie is SSR-readable). */
export function set_locale(l: Locale): void {
    locale.set(l);
    if (browser) {
        document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
        document.documentElement.lang = l;
    }
}

function lookup(l: Locale, key: string): string | undefined {
    return dicts[l][key] ?? dicts.en[key];
}

function interpolate(s: string, params?: Record<string, string | number>): string {
    if (!params) return s;
    for (const [k, v] of Object.entries(params)) {
        s = s.replaceAll(`{${k}}`, String(v));
    }
    return s;
}

/** Plain translation: $t('key') / $t('key', { param: value }) */
export const t = derived(
    locale,
    l =>
        (key: TranslationKey | string, params?: Record<string, string | number>): string =>
            interpolate(lookup(l, key) ?? key, params)
);

/** Plural translation: $tp('key', n) picks `key.one|few|many|other` and fills {n}. */
export const tp = derived(
    locale,
    l =>
        (key: string, n: number, params?: Record<string, string | number>): string => {
            const form = new Intl.PluralRules(l).select(n);
            const s =
                lookup(l, `${key}.${form}`) ??
                lookup(l, `${key}.other`) ??
                lookup(l, key) ?? // flat (non-plural) key fallback
                key;
            return interpolate(s, { n, ...params });
        }
);
