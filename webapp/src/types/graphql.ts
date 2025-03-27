import type { Campaign, Participation } from './campaign';
import type { User } from './user';

// Common query result interfaces
export interface AggregateCount {
  aggregate: {
    count: number;
  };
}

// Campaign queries
export interface CampaignsQuery {
  campaigns: Campaign[];
}

export interface CampaignQuery {
  campaigns_by_pk: Campaign;
}

export interface CampaignParticipationsQuery {
  participations_aggregate: AggregateCount;
}

// Participation queries and mutations
export interface ParticipationQuery {
  participations: Participation[];
}

export interface ParticipationUpsertMutation {
  insert_participations: {
    affected_rows: number;
  };
}

export interface ParticipationDeleteMutation {
  delete_participations_by_pk: {
    id: number;
  };
}

// Campaign dismissal mutation
export interface CampaignDismissalMutation {
  insert_campaign_dismissals_one: {
    campaign_id: number;
    account_id: number;
  };
}

// User queries and mutations
export interface UserQuery {
  accounts_by_pk: User;
}

export interface UserCreateMutation {
  insert_accounts_one: {
    id: number;
    name: string;
    email?: string;
  };
}

// Subscription types
export interface SubscriptionData<T> {
  data: T;
  loading: boolean;
  error?: Error;
}

// Variables for GraphQL operations
export interface CampaignQueryVariables {
  id: number;
}

export interface ParticipationQueryVariables {
  campaign_id: number;
  account_id: number;
}

export interface ParticipationCountQueryVariables {
  threshold: number;
  campaign_id: number;
  confirmed: boolean;
}

export interface ParticipationUpsertVariables {
  campaign_id: number;
  user_id: number;
  threshold: number;
}

export interface CampaignDismissalVariables {
  campaign_id: number;
  user_id: number;
}