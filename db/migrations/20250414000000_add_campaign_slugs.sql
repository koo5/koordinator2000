-- Migration: Add Campaign Slugs
-- Created at: 2025-04-14T00:00:00.000Z

-- This migration adds support for multiple slugs per campaign

-- Functions to handle easy rollbacks:
-- Save the current state that we might want to roll back to
DO $$
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS _migration_backup_%s', '20250414000000');
END $$;

-- Save the campaigns table structure before modification
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaigns') THEN
    EXECUTE format('CREATE TABLE _migration_backup_%s.campaigns AS SELECT * FROM public.campaigns', '20250414000000');
  END IF;
END $$;

-- Create the campaign_slugs table
CREATE TABLE IF NOT EXISTS public.campaign_slugs (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  campaign_id INTEGER NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT campaign_slugs_campaign_id_fkey FOREIGN KEY (campaign_id)
    REFERENCES public.campaigns(id) ON DELETE CASCADE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS campaign_slugs_campaign_id_idx ON public.campaign_slugs (campaign_id);
CREATE INDEX IF NOT EXISTS campaign_slugs_slug_idx ON public.campaign_slugs (slug);
CREATE INDEX IF NOT EXISTS campaign_slugs_primary_idx ON public.campaign_slugs (campaign_id, is_primary);

-- Function to generate a slug from a title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT) RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove non-alphanumeric chars
  base_slug := LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  
  -- Ensure the slug is not empty
  IF LENGTH(base_slug) = 0 THEN
    base_slug := 'campaign';
  END IF;
  
  -- Check if the slug already exists
  final_slug := base_slug;
  WHILE EXISTS (SELECT FROM public.campaign_slugs WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Generate initial slugs for all existing campaigns
DO $$
DECLARE
  campaign_record RECORD;
BEGIN
  FOR campaign_record IN SELECT id, title, uri FROM public.campaigns WHERE NOT smazano LOOP
    -- First try to use the URI if it exists
    IF campaign_record.uri IS NOT NULL AND LENGTH(campaign_record.uri) > 0 THEN
      -- Extract the last part of the URI as the slug
      DECLARE
        uri_slug TEXT;
      BEGIN
        uri_slug := SPLIT_PART(campaign_record.uri, '/', -1);
        -- Only use if it's not empty and doesn't contain special characters
        IF LENGTH(uri_slug) > 0 AND uri_slug ~ '^[a-zA-Z0-9-]+$' THEN
          -- Check if this slug is already used
          IF NOT EXISTS (SELECT FROM public.campaign_slugs WHERE slug = uri_slug) THEN
            INSERT INTO public.campaign_slugs (campaign_id, slug, is_primary)
            VALUES (campaign_record.id, uri_slug, TRUE);
            CONTINUE; -- Skip to the next campaign
          END IF;
        END IF;
      END;
    END IF;
    
    -- If we get here, use the title to generate a slug
    INSERT INTO public.campaign_slugs (campaign_id, slug, is_primary)
    VALUES (
      campaign_record.id,
      generate_slug(campaign_record.title),
      TRUE
    );
    
    -- Also add the numeric ID as a slug (non-primary)
    INSERT INTO public.campaign_slugs (campaign_id, slug, is_primary)
    VALUES (
      campaign_record.id,
      campaign_record.id::TEXT,
      FALSE
    );
  END LOOP;
END $$;

-- Create trigger function to automatically generate slug when a new campaign is created
CREATE OR REPLACE FUNCTION public.create_campaign_slug() RETURNS TRIGGER AS $$
BEGIN
  -- Create a slug based on the title
  INSERT INTO public.campaign_slugs (campaign_id, slug, is_primary)
  VALUES (NEW.id, generate_slug(NEW.title), TRUE);
  
  -- Also add the numeric ID as a slug (non-primary)
  INSERT INTO public.campaign_slugs (campaign_id, slug, is_primary)
  VALUES (NEW.id, NEW.id::TEXT, FALSE);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to create slugs when a new campaign is inserted
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'create_campaign_slug_on_insert'
  ) THEN
    DROP TRIGGER IF EXISTS create_campaign_slug_on_insert ON public.campaigns;
    CREATE TRIGGER create_campaign_slug_on_insert
    AFTER INSERT ON public.campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.create_campaign_slug();
  END IF;
END $$;