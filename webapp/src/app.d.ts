// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			code?: string;
			message: string;
			details?: Record<string, unknown>;
		}
		
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
				auth_debug?: boolean;
				nag_postponement?: number;
				nag_backoff?: number;
				default_participations_display_style?: string;
				autoscroll?: boolean;
				[key: string]: any;
			}
		}
		
		interface PageData {
			user?: App.Locals['user'];
			session?: App.Locals['session'];
		}
		
		// interface Platform {}
	}
}

// Define additional types for use throughout the application
declare type GqlStatus = {
	loading: boolean;
	error?: Error;
};

declare type UserParticipation = {
	id: number;
	status?: string;
	[key: string]: any;
};

declare type Campaign = {
	id: number;
	name: string;
	my_participations?: UserParticipation[];
	[key: string]: any;
};

export {};
