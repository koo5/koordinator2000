-- Campaign language: the language the campaign's title/description are written in.
-- NULL = unspecified (treated as language-agnostic / shown to everyone). The
-- discovery deck defaults to the viewer's UI language + NULL, since a Czech
-- boycott is noise to a US reader ("deck relevance = language + location").
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS language text;

-- Partial index: the deck filters on language, and most rows will have one.
CREATE INDEX IF NOT EXISTS campaigns_language_idx ON campaigns (language);
