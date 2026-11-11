-- =============================================================================
-- AI Music Studio — Supabase Initialization SQL
-- =============================================================================
-- How to run:
--   Option A (Supabase Dashboard):
--     1. Open your project at https://app.supabase.com
--     2. Navigate to "SQL Editor" in the left sidebar.
--     3. Paste the entire contents of this file and click "Run".
--
--   Option B (psql CLI):
--     psql "<your-supabase-connection-string>" -f supabase_init.sql
--
--   After running this SQL, also create the two Storage buckets described at
--   the bottom of this file — either through the Supabase Dashboard
--   (Storage > New bucket) or via the Management API.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

-- Enable the UUID generation extension (required for uuid_generate_v4()).
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- produced_tracks: stores metadata for every AI-generated track.
CREATE TABLE IF NOT EXISTS public.produced_tracks (
    id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt           TEXT        NOT NULL,
    raw_audio_url    TEXT,
    full_track_url   TEXT,
    vocals_url       TEXT,
    instrumental_url TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE  public.produced_tracks                 IS 'Metadata for every AI-produced music track.';
COMMENT ON COLUMN public.produced_tracks.id              IS 'Unique track identifier (UUID v4).';
COMMENT ON COLUMN public.produced_tracks.prompt          IS 'User-supplied text prompt used to guide generation.';
COMMENT ON COLUMN public.produced_tracks.raw_audio_url   IS 'Supabase Storage URL of the original uploaded audio.';
COMMENT ON COLUMN public.produced_tracks.full_track_url  IS 'URL of the AI-generated full song (Suno output).';
COMMENT ON COLUMN public.produced_tracks.vocals_url      IS 'URL of the RVC voice-converted vocals stem.';
COMMENT ON COLUMN public.produced_tracks.instrumental_url IS 'URL of the non-vocals instrumental stem (HTDemucs).';
COMMENT ON COLUMN public.produced_tracks.created_at      IS 'Timestamp when the track was produced (UTC).';

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ---------------------------------------------------------------------------

ALTER TABLE public.produced_tracks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read tracks (adjust to authenticated-only if needed).
CREATE POLICY "Allow public read"
    ON public.produced_tracks
    FOR SELECT
    USING (true);

-- Allow the service role (backend) full access.
CREATE POLICY "Allow service role all"
    ON public.produced_tracks
    FOR ALL
    USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- Storage Buckets
-- ---------------------------------------------------------------------------
-- Storage buckets cannot be created via SQL — use the Supabase Dashboard or
-- the Storage Management API.
--
-- Bucket 1: studio-raw-audio
--   Purpose : Raw audio files uploaded by users before processing.
--   Public  : true  (the AI services need publicly accessible URLs)
--
-- Bucket 2: studio-master-tracks
--   Purpose : Processed stems and master tracks produced by the pipeline.
--   Public  : true
--
-- Dashboard steps:
--   1. Go to Storage in your Supabase project.
--   2. Click "New bucket".
--   3. Name: studio-raw-audio   | toggle "Public bucket" ON  → Save.
--   4. Click "New bucket" again.
--   5. Name: studio-master-tracks | toggle "Public bucket" ON → Save.
-- ---------------------------------------------------------------------------
