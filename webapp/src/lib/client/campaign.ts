import { my_user, type Participation } from '$lib/client/my_user.ts';
import sanitizeHtml from 'sanitize-html';
import { get } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Sanitizes HTML content to prevent XSS
 * @param x - HTML content to sanitize
 * @returns Sanitized HTML
 */
export function sanitize_html(x: string): string {
    return sanitizeHtml(x, { disallowedTagsMode: 'escape' });
}

/**
 * GraphQL fragment for campaign data
 */
export const CAMPAIGN_FRAGMENT = `
    {
        id,
        title,
        stealth,
        description,
        suggested_lowest_threshold,
        suggested_highest_threshold,
        suggested_optimal_threshold,
        created_at,
        updated_at,
        last_activity_at,
        participations(order_by: [{threshold: asc}], where:{ account:{smazano:{_eq: false}}} ) {
          id
          threshold
          account {
            id
            name
          }
          condition_is_fulfilled
        },
        my_participations: participations(where: {account_id: {_eq: $_user_id}}) {
          id
          threshold
          condition_is_fulfilled
        }
        campaign_dismissals {
          account_id
          account {
            id
            name
          }
        }
        tags: campaign_tags {
          tag {
            id
            name
            description
          }
        }
    }
`;

/**
 * Gets the CSS class for a participation based on its status
 * @param participation - The participation object
 * @returns CSS class name
 */
export function get_status_class(participation: Participation): string {
    if (participation.condition_is_fulfilled) {
        return 'confirmed';
    } else return 'condition_is_not_fulfilled';
}

/**
 * Gets the tickmark symbol for a participation
 * @param participation - The participation object
 * @returns Unicode symbol for status
 */
export function get_tickmark(participation: Participation | undefined | null): string {
    if (!participation || participation.threshold === undefined) return '';
    else {
        if (participation.condition_is_fulfilled) {
            return '✅';
        } else return '👁';
    }
}

/**
 * Gets a short description of participation status
 * @param participation - The participation object
 * @returns Short status description
 */
export function short_description(participation: Participation | undefined | null): string {
    if (!participation || participation.threshold === undefined) return '';
    else {
        if (participation.condition_is_fulfilled) {
            return 'participating';
        } else return 'waiting...';
    }
}

/**
 * Gets a long description of participation status
 * @param participation - The participation object
 * @returns Detailed status description
 */
export function long_description(participation: Participation | undefined | null): string {
    if (!participation || participation.threshold === undefined) return '';
    else {
        if (participation.condition_is_fulfilled) {
            return 'threshold is reached';
        } else return 'this user is waiting for more participants...';
    }
}

/**
 * Hack to fix modal backdrop saturation issues
 * @param isOpen - Whether modal is open
 */
export function modal_hack(isOpen: boolean): void {
    /* https://github.com/bestguy/sveltestrap/issues/248 */
    if (!browser) return;

    if (isOpen) document.documentElement.style.removeProperty('--saturate');
    else document.documentElement.style.setProperty('--saturate', saturate_computate(get(my_user).saturate || 0));
}

/**
 * Sets a CSS variable on the document root
 * @param name - Variable name
 * @param value - Variable value
 */
export function set_css_var(name: string, value: string): void {
    if (!browser) return;
    document.documentElement.style.setProperty(name, value);
}

/**
 * Calculates the saturation value for CSS
 * @param x - Saturation value
 * @returns Formatted saturation string
 */
export function saturate_computate(x: number): string {
    return 100 + (x || 0) + '%';
}
