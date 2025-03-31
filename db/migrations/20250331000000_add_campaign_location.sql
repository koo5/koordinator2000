-- Migration: Add Campaign Location
-- Created at: 2025-03-31T00:00:00.000Z

-- This migration adds location information to campaigns for better geographical filtering

-- Functions to handle easy rollbacks:
-- Save the current state that we might want to roll back to
DO $$
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS _migration_backup_%s', '20250331000000');
END $$;

-- Save the campaigns table structure before modification
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaigns') THEN
    EXECUTE format('CREATE TABLE _migration_backup_%s.campaigns AS SELECT * FROM public.campaigns', '20250331000000');
  END IF;
END $$;

-- Add location columns to campaigns table
-- First check if the columns already exist to avoid errors
DO $$
BEGIN
  -- Add location_name column (for human-readable location names)
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'location_name'
  ) THEN
    ALTER TABLE public.campaigns ADD COLUMN location_name TEXT;
  END IF;

  -- Add latitude and longitude for precise location
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE public.campaigns ADD COLUMN latitude DECIMAL(10, 8);
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE public.campaigns ADD COLUMN longitude DECIMAL(11, 8);
  END IF;

  -- Add location_radius field (in kilometers) to define campaign area
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'location_radius'
  ) THEN
    ALTER TABLE public.campaigns ADD COLUMN location_radius DECIMAL(10, 2) DEFAULT 5.0;
  END IF;

  -- Add timestamps for when campaigns were created and last updated
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.campaigns ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.campaigns ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- Add specific timestamp for last activity
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE public.campaigns ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- Add trigger to update the updated_at timestamp
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_public_campaigns_updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS set_public_campaigns_updated_at ON public.campaigns;
    CREATE TRIGGER set_public_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();
  END IF;
END $$;

-- Create function to update last_activity_at
CREATE OR REPLACE FUNCTION public.update_campaign_last_activity() 
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$;

-- Add trigger to update last_activity_at when campaign is updated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_public_campaigns_last_activity'
  ) THEN
    DROP TRIGGER IF EXISTS set_public_campaigns_last_activity ON public.campaigns;
    CREATE TRIGGER set_public_campaigns_last_activity
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.update_campaign_last_activity();
  END IF;
END $$;

-- Create function to update campaign's last_activity_at when a participation is created or updated
CREATE OR REPLACE FUNCTION public.update_campaign_activity_from_participation() 
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.campaigns
  SET last_activity_at = NOW()
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$;

-- Add trigger to update campaign's last_activity_at when a participation is created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_campaign_last_activity_on_participation'
  ) THEN
    DROP TRIGGER IF EXISTS set_campaign_last_activity_on_participation ON public.participations;
    CREATE TRIGGER set_campaign_last_activity_on_participation
    AFTER INSERT OR UPDATE ON public.participations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_campaign_activity_from_participation();
  END IF;
END $$;

-- Create an index for geographical queries if PostGIS is available
DO $$
BEGIN
  -- Check if PostGIS extension is available
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'postgis'
  ) THEN
    -- Create a spatial index if PostGIS is available
    -- This would require PostGIS extension to be installed
    EXECUTE 'CREATE INDEX IF NOT EXISTS campaigns_location_idx ON public.campaigns USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326))';
  ELSE
    -- If PostGIS not available, create regular indexes on lat/long columns
    CREATE INDEX IF NOT EXISTS campaigns_latitude_idx ON public.campaigns (latitude);
    CREATE INDEX IF NOT EXISTS campaigns_longitude_idx ON public.campaigns (longitude);
  END IF;
END $$;

-- Optionally add a function to calculate distance between campaigns and a point
-- This is useful for proximity searches
CREATE OR REPLACE FUNCTION public.campaign_distance(campaign_id INTEGER, lat DECIMAL, long DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
  c_lat DECIMAL;
  c_long DECIMAL;
  distance DECIMAL;
  earth_radius DECIMAL := 6371; -- Earth radius in kilometers
  lat1_rad DECIMAL;
  long1_rad DECIMAL;
  lat2_rad DECIMAL;
  long2_rad DECIMAL;
  delta_lat DECIMAL;
  delta_long DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  -- Get campaign coordinates
  SELECT latitude, longitude INTO c_lat, c_long
  FROM public.campaigns
  WHERE id = campaign_id;
  
  -- If no coordinates, return NULL
  IF c_lat IS NULL OR c_long IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Calculate distance using Haversine formula
  
  -- Convert degrees to radians
  lat1_rad := RADIANS(c_lat);
  long1_rad := RADIANS(c_long);
  lat2_rad := RADIANS(lat);
  long2_rad := RADIANS(long);
  
  -- Haversine formula components
  delta_lat := lat2_rad - lat1_rad;
  delta_long := long2_rad - long1_rad;
  a := SIN(delta_lat/2)^2 + COS(lat1_rad) * COS(lat2_rad) * SIN(delta_long/2)^2;
  c := 2 * ASIN(SQRT(a));
  
  distance := earth_radius * c;
  
  RETURN distance;
END;
$$ LANGUAGE plpgsql;