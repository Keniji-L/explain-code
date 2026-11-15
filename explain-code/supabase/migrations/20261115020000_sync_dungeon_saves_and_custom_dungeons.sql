-- Sync user dungeon save checkpoints and custom dungeons across devices
-- Accessed exclusively via server-side /api/lms using service_role (getSupabaseAdmin)

CREATE TABLE IF NOT EXISTS public.user_dungeon_saves (
  user_id text NOT NULL,
  language text NOT NULL,
  save_data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, language)
);

CREATE TABLE IF NOT EXISTS public.user_custom_dungeons (
  id text NOT NULL,
  user_id text NOT NULL,
  language text NOT NULL,
  dungeon_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_user_dungeon_saves_user_updated
  ON public.user_dungeon_saves (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_custom_dungeons_user_updated
  ON public.user_custom_dungeons (user_id, updated_at DESC);

ALTER TABLE public.user_dungeon_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_dungeons ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.user_dungeon_saves FROM anon, authenticated;
REVOKE ALL ON public.user_custom_dungeons FROM anon, authenticated;
