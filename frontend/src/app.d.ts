// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: {
				PUBLIC_URL: string;
				GRAPHQL_ENDPOINT: string;
				PUBLIC_GRAPHQL_HEADERS?: Record<string, string>;
				BASE_URL: string;
			},
			user?: {
				id: number;
				name: string;
				email?: string;
				jwt?: string;
				[key: string]: any;
			}
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
