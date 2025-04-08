-- Migration: add_unique_constraint_to_verified_user_authentications
-- Created at: 2025-04-08T03:51:36.570Z

-- Write your SQL migration here
-- Write your statements here

-- Example:
-- CREATE TABLE my_table (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL
-- );

-- Functions to handle easy rollbacks:
-- Save the current state that we might want to roll back to
DO $$
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS _migration_backup_%s', '20250408035136');
END $$;

-- Save any existing tables we might modify (example)
-- DO $$
-- BEGIN
--   IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'table_to_modify') THEN
--     EXECUTE format('CREATE TABLE _migration_backup_%s.table_to_modify AS SELECT * FROM public.table_to_modify', '20250408035136');
--   END IF;
-- END $$;

-- Add your migration code here

-- Add unique constraint on provider and login_name
ALTER TABLE public.verified_user_authentications
ADD CONSTRAINT verified_user_authentications_provider_login_name_key
UNIQUE (provider, login_name);

