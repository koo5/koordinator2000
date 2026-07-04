/**
 * Supported campaign countries (ISO 3166-1 alpha-2). The launch set is CZ + US;
 * add codes here as new markets open. `null` everywhere = global/agnostic.
 * `label_key` resolves via i18n ($t).
 */
export interface Country {
    code: string;
    label_key: string;
}

export const COUNTRIES: Country[] = [
    { code: 'CZ', label_key: 'country.CZ' },
    { code: 'US', label_key: 'country.US' },
];

/** A sensible default country for a campaign author, inferred from UI locale. */
export function default_country_for_locale(locale: string): string {
    return locale === 'cs' ? 'CZ' : 'US';
}
