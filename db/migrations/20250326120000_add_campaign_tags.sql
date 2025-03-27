-- Migration: Add Campaign Tags
-- Created at: 2025-03-26T12:00:00.000Z

-- This migration adds a tags system for categorizing campaigns

-- Functions to handle easy rollbacks:
-- Save the current state that we might want to roll back to
DO $$
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS _migration_backup_%s', '20250326120000');
END $$;

-- Save the campaigns table structure before modification
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaigns') THEN
    EXECUTE format('CREATE TABLE _migration_backup_%s.campaigns AS SELECT * FROM public.campaigns', '20250326120000');
  END IF;
END $$;

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create campaign_tags junction table
CREATE TABLE IF NOT EXISTS public.campaign_tags (
  campaign_id INTEGER NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  PRIMARY KEY (campaign_id, tag_id)
);

-- Add some initial tags
INSERT INTO public.tags (name, description) VALUES
('environment', 'Environmental campaigns'),
('politics', 'Political campaigns'),
('health', 'Health-related campaigns'),
('education', 'Educational campaigns'),
('consumer', 'Consumer rights campaigns'),
('social', 'Social justice campaigns')
ON CONFLICT (name) DO NOTHING;