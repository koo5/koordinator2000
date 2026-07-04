-- Campaign country: the country the campaign is relevant to (ISO 3166-1 alpha-2,
-- e.g. 'CZ', 'US'). NULL = global / country-agnostic (shown everywhere). This is
-- the coarse geo filter for discovery — unlike near-me it needs no geolocation
-- permission, which matters for the multi-country launch (CZ + US first).
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS country text;

CREATE INDEX IF NOT EXISTS campaigns_country_idx ON campaigns (country);
