-- Example seed data for development

-- Insert some test accounts
INSERT INTO public.accounts (email, name) VALUES
('admin@example.com', 'admin'),
('user1@example.com', 'user1'),
('user2@example.com', 'user2')
ON CONFLICT (name) DO NOTHING;

-- Insert some test causes
INSERT INTO public.causes (title, description, maintainer_id)
SELECT 'Environmental Protection', 'Projects focused on protecting the environment.', id 
FROM public.accounts WHERE name = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO public.causes (title, description, maintainer_id)
SELECT 'Education', 'Projects focused on improving education.', id 
FROM public.accounts WHERE name = 'admin'
ON CONFLICT DO NOTHING;

-- Insert some test campaigns
INSERT INTO public.campaigns (maintainer_id, title, description, cause_id, uri, twitter_tag)
SELECT 
  a.id, 
  'Clean the Beach', 
  'Community beach cleanup project', 
  c.id,
  'clean-the-beach',
  'cleanbeach'
FROM 
  public.accounts a,
  public.causes c
WHERE 
  a.name = 'admin' AND
  c.title = 'Environmental Protection'
ON CONFLICT (uri) DO NOTHING;

INSERT INTO public.campaigns (maintainer_id, title, description, cause_id, uri, twitter_tag)
SELECT 
  a.id, 
  'Community Garden', 
  'Start a community garden in the neighborhood', 
  c.id,
  'community-garden',
  'communitygarden'
FROM 
  public.accounts a,
  public.causes c
WHERE 
  a.name = 'admin' AND
  c.title = 'Environmental Protection'
ON CONFLICT (uri) DO NOTHING;

-- Insert some test participations
INSERT INTO public.participations (account_id, campaign_id, threshold)
SELECT 
  a.id,
  c.id,
  10
FROM 
  public.accounts a,
  public.campaigns c
WHERE 
  a.name = 'user1' AND
  c.uri = 'clean-the-beach'
ON CONFLICT DO NOTHING;

INSERT INTO public.participations (account_id, campaign_id, threshold)
SELECT 
  a.id,
  c.id,
  5
FROM 
  public.accounts a,
  public.campaigns c
WHERE 
  a.name = 'user2' AND
  c.uri = 'clean-the-beach'
ON CONFLICT DO NOTHING;