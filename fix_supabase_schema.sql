-- COMPLETE SUPABASE SCHEMA FIX
-- Run this entire script in your Supabase SQL editor

-- Step 1: Drop the broken foreign key constraint
ALTER TABLE logs_events DROP CONSTRAINT IF EXISTS logs_events_session_id_fkey;

-- Step 2: Clear all data (necessary because of invalid UUIDs)
TRUNCATE TABLE logs_events CASCADE;
TRUNCATE TABLE logs_sessions CASCADE;

-- Step 3: Fix logs_events column types
ALTER TABLE logs_events ALTER COLUMN session_id TYPE UUID USING NULL;

-- Step 4: Add the correct foreign key relationship
ALTER TABLE logs_events 
    ADD CONSTRAINT fk_session_id 
    FOREIGN KEY (session_id) 
    REFERENCES logs_sessions(id) 
    ON DELETE CASCADE;

-- Step 5: Rename columns to match expected schema
ALTER TABLE logs_events RENAME COLUMN event_type TO type;
ALTER TABLE logs_events RENAME COLUMN event_name TO name;

-- Step 6: Add missing columns to logs_events
ALTER TABLE logs_events ADD COLUMN IF NOT EXISTS parent_id TEXT;

-- Step 7: Add all missing columns to logs_sessions
ALTER TABLE logs_sessions ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE logs_sessions ADD COLUMN IF NOT EXISTS temperature NUMERIC;
ALTER TABLE logs_sessions ADD COLUMN IF NOT EXISTS kpis JSONB DEFAULT '{}'::jsonb;
ALTER TABLE logs_sessions ADD COLUMN IF NOT EXISTS valid BOOLEAN;
ALTER TABLE logs_sessions ADD COLUMN IF NOT EXISTS cost NUMERIC;
ALTER TABLE logs_sessions ADD COLUMN IF NOT EXISTS latency NUMERIC;
ALTER TABLE logs_sessions ADD COLUMN IF NOT EXISTS input_tokens INTEGER;
ALTER TABLE logs_sessions ADD COLUMN IF NOT EXISTS output_tokens INTEGER;
ALTER TABLE logs_sessions ADD COLUMN IF NOT EXISTS rating JSONB DEFAULT '{}'::jsonb;
ALTER TABLE logs_sessions ADD COLUMN IF NOT EXISTS parent_session_id UUID;
ALTER TABLE logs_sessions ADD COLUMN IF NOT EXISTS file_hash TEXT;

-- Step 8: Drop the unnecessary session_id column from logs_sessions
ALTER TABLE logs_sessions DROP COLUMN IF EXISTS session_id;

-- Verify the schema
SELECT 
    table_name,
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('logs_sessions', 'logs_events')
ORDER BY table_name, ordinal_position;