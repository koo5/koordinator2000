export interface CampaignDismissal {
  campaign_id: number;
  account_id: number;
  account: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface Participation {
  id: number;
  account_id: number;
  campaign_id: number;
  threshold: number;
  condition_is_fulfilled: boolean;
  confirmed: boolean;
  account: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface Campaign {
  id: number;
  title: string;
  description: string;
  maintainer_id: number;
  cause_id: number;
  suggested_highest_threshold: number;
  suggested_lowest_threshold: number;
  suggested_optimal_threshold: number;
  stealth: boolean;
  smazano: boolean;
  uri?: string;
  twitter_tag?: string;
  collect_confirmations: boolean;
  participations: Participation[];
  my_participations: Participation[];
  campaign_dismissals: CampaignDismissal[];
  unconfirmed_fulfilled_count?: {
    aggregate: {
      count: number;
    }
  };
  confirmed_fulfilled_count?: {
    aggregate: {
      count: number;
    }
  };
}