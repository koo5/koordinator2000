-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  smazano BOOLEAN DEFAULT FALSE
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  suggested_optimal_threshold INTEGER NOT NULL DEFAULT 5
);

-- Create participations table
CREATE TABLE IF NOT EXISTS participations (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  threshold INTEGER NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, account_id)
);

-- Create campaign_dismissals table
CREATE TABLE IF NOT EXISTS campaign_dismissals (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, account_id)
);

-- Create verified_user_authentications table
CREATE TABLE IF NOT EXISTS verified_user_authentications (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  login_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, login_name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participations_campaign_id ON participations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_participations_account_id ON participations(account_id);
CREATE INDEX IF NOT EXISTS idx_participations_threshold ON participations(threshold);
CREATE INDEX IF NOT EXISTS idx_participations_confirmed ON participations(confirmed);
CREATE INDEX IF NOT EXISTS idx_campaign_dismissals_campaign_id ON campaign_dismissals(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_dismissals_account_id ON campaign_dismissals(account_id);
CREATE INDEX IF NOT EXISTS idx_verified_user_authentications_account_id ON verified_user_authentications(account_id);
