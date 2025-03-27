-- Migration: Initial Schema
-- Created at: 2025-03-26T00:00:00.000Z

-- This migration creates the initial database schema for the Koordinator2000 application
-- The schema is adapted from the existing koordinator.sql dump

-- First, create function for updating timestamp
DROP FUNCTION IF EXISTS public.set_current_timestamp_updated_at();
CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
declare
  _new record;
begin
  _new := new;
  _new."updated_at" = now();
  return _new;
end;
$$;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.accounts (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email text,
    name text UNIQUE,
    smazano boolean DEFAULT false NOT NULL
);

COMMENT ON COLUMN public.accounts.smazano IS 'deleted';

CREATE TABLE IF NOT EXISTS public.causes (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    maintainer_id integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.campaigns (
    id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    maintainer_id integer,
    title text,
    description text,
    cause_id integer,
    suggested_highest_threshold bigint DEFAULT '8000000000'::bigint NOT NULL,
    suggested_lowest_threshold bigint DEFAULT '1'::bigint,
    suggested_optimal_threshold bigint DEFAULT '10'::bigint NOT NULL,
    smazano boolean DEFAULT false NOT NULL,
    stealth boolean DEFAULT false NOT NULL,
    uri text UNIQUE,
    twitter_tag text
);

CREATE TABLE IF NOT EXISTS public.participations (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id integer NOT NULL,
    campaign_id integer NOT NULL,
    threshold integer NOT NULL,
    condition_is_fulfilled boolean DEFAULT false NOT NULL,
    confirmed boolean DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS public.campaign_dismissals (
    campaign_id integer NOT NULL,
    account_id integer NOT NULL,
    PRIMARY KEY (campaign_id, account_id)
);

CREATE TABLE IF NOT EXISTS public.campaign_notifications (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    campaign_id integer NOT NULL,
    content text NOT NULL,
    confirmed boolean DEFAULT false NOT NULL,
    read boolean DEFAULT false NOT NULL,
    account_id integer NOT NULL,
    ts timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    display_name text,
    avatar_url text
);

CREATE TABLE IF NOT EXISTS public.verified_user_authentications (
    account_id integer NOT NULL,
    provider text NOT NULL,
    login_name text NOT NULL
);

-- Add constraints and indexes (with safety checks)
DO $$
BEGIN
    -- Add unique constraint to participations
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'participations_campaign_id_user_id' AND conrelid = 'public.participations'::regclass
    ) THEN
        ALTER TABLE public.participations 
        ADD CONSTRAINT participations_campaign_id_user_id 
        UNIQUE (campaign_id, account_id);
    END IF;
    
    -- Add foreign keys 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'causes_maintainer_id_fkey' AND conrelid = 'public.causes'::regclass
    ) THEN
        ALTER TABLE public.causes 
        ADD CONSTRAINT causes_maintainer_id_fkey 
        FOREIGN KEY (maintainer_id) REFERENCES public.accounts(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'campaigns_maintainer_fkey' AND conrelid = 'public.campaigns'::regclass
    ) THEN
        ALTER TABLE public.campaigns 
        ADD CONSTRAINT campaigns_maintainer_fkey 
        FOREIGN KEY (maintainer_id) REFERENCES public.accounts(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'campaigns_cause_id_fkey' AND conrelid = 'public.campaigns'::regclass
    ) THEN
        ALTER TABLE public.campaigns 
        ADD CONSTRAINT campaigns_cause_id_fkey 
        FOREIGN KEY (cause_id) REFERENCES public.causes(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'participation_user_fkey' AND conrelid = 'public.participations'::regclass
    ) THEN
        ALTER TABLE public.participations 
        ADD CONSTRAINT participation_user_fkey 
        FOREIGN KEY (account_id) REFERENCES public.accounts(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'participation_campaign_fkey' AND conrelid = 'public.participations'::regclass
    ) THEN
        ALTER TABLE public.participations 
        ADD CONSTRAINT participation_campaign_fkey 
        FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'campaign_dismissals_campaign_id_fkey' AND conrelid = 'public.campaign_dismissals'::regclass
    ) THEN
        ALTER TABLE public.campaign_dismissals 
        ADD CONSTRAINT campaign_dismissals_campaign_id_fkey 
        FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'campaign_dismissals_user_id_fkey' AND conrelid = 'public.campaign_dismissals'::regclass
    ) THEN
        ALTER TABLE public.campaign_dismissals 
        ADD CONSTRAINT campaign_dismissals_user_id_fkey 
        FOREIGN KEY (account_id) REFERENCES public.accounts(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'campaign_notifications_campaign_id_fkey' AND conrelid = 'public.campaign_notifications'::regclass
    ) THEN
        ALTER TABLE public.campaign_notifications 
        ADD CONSTRAINT campaign_notifications_campaign_id_fkey 
        FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'campaign_notifications_user_id_fkey' AND conrelid = 'public.campaign_notifications'::regclass
    ) THEN
        ALTER TABLE public.campaign_notifications 
        ADD CONSTRAINT campaign_notifications_user_id_fkey 
        FOREIGN KEY (account_id) REFERENCES public.accounts(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'verified_user_authentications_user_id_fkey' AND conrelid = 'public.verified_user_authentications'::regclass
    ) THEN
        ALTER TABLE public.verified_user_authentications 
        ADD CONSTRAINT verified_user_authentications_user_id_fkey 
        FOREIGN KEY (account_id) REFERENCES public.accounts(id);
    END IF;
    
    -- Add trigger for users table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_public_users_updated_at'
    ) THEN
        DROP TRIGGER IF EXISTS set_public_users_updated_at ON public.users;
        CREATE TRIGGER set_public_users_updated_at
        BEFORE UPDATE ON public.users
        FOR EACH ROW
        EXECUTE FUNCTION public.set_current_timestamp_updated_at();
    END IF;
END;
$$;