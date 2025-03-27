export interface User {
  id: number;
  name: string;
  email?: string;
  jwt?: string;
  auth_debug?: boolean;
  database_debug?: boolean;
  nag_postponement?: number;
  nag_backoff?: number;
  default_participations_display_style?: string;
  autoscroll?: boolean;
  hide_help?: boolean;
  saturate?: number;
  [key: string]: any;
}