-- Migration: notification delivery tracking
-- Created at: 2026-07-03T00:00:00.000Z
--
-- Records which campaign_notifications have been pushed over which channel
-- (telegram today; email/web-push later). Replaces the Telegram bot's fragile
-- JSON watermark file — durable, backed up, and idempotent per notification.

CREATE TABLE IF NOT EXISTS public.notification_deliveries (
    notification_id integer NOT NULL REFERENCES public.campaign_notifications(id) ON DELETE CASCADE,
    channel text NOT NULL,
    delivered_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (notification_id, channel)
);

CREATE INDEX IF NOT EXISTS notification_deliveries_channel_idx
    ON public.notification_deliveries (channel);

-- Backfill: treat all EXISTING notifications as already handled for telegram, so
-- a freshly-connected bot pushes only NEW crossings (no history blast).
INSERT INTO public.notification_deliveries (notification_id, channel)
    SELECT id, 'telegram' FROM public.campaign_notifications
    ON CONFLICT DO NOTHING;
