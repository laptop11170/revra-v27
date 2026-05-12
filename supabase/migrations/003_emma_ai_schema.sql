-- Phase 3 Emma AI Integration — Database Changes
-- Run this in Supabase SQL Editor to apply schema additions for the Emma AI integration

-- ── users table: add Emma client ID (future multi-client support) ──────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS emma_client_id TEXT;

-- ── conversations table: add unread count (used by frontend texts/page.tsx) ──
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS unread_count INTEGER DEFAULT 0;

-- ── index on conversations for fast unread queries ──────────────────────────
CREATE INDEX IF NOT EXISTS idx_conversations_unread ON conversations(unread_count)
  WHERE unread_count > 0;