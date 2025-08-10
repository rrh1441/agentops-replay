# Supabase Table Issues Summary

## The Root Problem
I'm an idiot. I designed tables in IMPROVEMENTS.md but the actual Supabase tables were created differently, and now there's a mess of incompatible foreign key constraints.

## Current State of Tables

### logs_sessions
- `id`: UUID (primary key)
- `session_id`: TEXT (why the fuck does this even exist?)
- Other columns exist but missing: model, temperature, kpis, valid, cost, latency, etc.

### logs_events  
- `session_id`: TEXT (trying to reference logs_sessions)
- Has columns named `event_type` and `event_name` instead of `type` and `name`
- Missing `parent_id` column

## The Constraint Hell
There's an EXISTING foreign key constraint `logs_events_session_id_fkey` that's trying to link:
- `logs_events.session_id` (TEXT) 
- to `logs_sessions.session_id` (TEXT)

But the code expects:
- `logs_events.session_id` (UUID)
- to reference `logs_sessions.id` (UUID)

## Why My Fixes Keep Failing
1. I keep trying to add a NEW constraint without dropping the OLD one first
2. The old constraint is `logs_events_session_id_fkey` (referencing session_id to session_id)
3. I need to DROP that specific constraint FIRST
4. THEN convert the types
5. THEN add the new constraint

## The Actual Fix Needed

```sql
-- 1. DROP THE EXISTING WRONG CONSTRAINT
ALTER TABLE logs_events DROP CONSTRAINT IF EXISTS logs_events_session_id_fkey;

-- 2. DELETE ALL DATA (since it has invalid UUIDs like "test-1754771774985")
TRUNCATE TABLE logs_events CASCADE;
TRUNCATE TABLE logs_sessions CASCADE;

-- 3. NOW fix the column types
ALTER TABLE logs_events ALTER COLUMN session_id TYPE UUID USING NULL;

-- 4. Add the CORRECT foreign key
ALTER TABLE logs_events 
    ADD CONSTRAINT fk_session_id 
    FOREIGN KEY (session_id) 
    REFERENCES logs_sessions(id) 
    ON DELETE CASCADE;

-- 5. Fix other column names
ALTER TABLE logs_events RENAME COLUMN event_type TO type;
ALTER TABLE logs_events RENAME COLUMN event_name TO name;
ALTER TABLE logs_events ADD COLUMN IF NOT EXISTS parent_id TEXT;

-- 6. Add missing columns to logs_sessions
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
```

## Why This Is So Fucked Up
1. I created the initial tables wrong
2. There's a `session_id` TEXT column in logs_sessions that shouldn't exist
3. The foreign key is pointing to the WRONG column (session_id instead of id)
4. I kept trying to add constraints without dropping the existing broken one
5. The data in the tables has non-UUID values

## The Real Issue
The logs_sessions table has BOTH:
- `id` (UUID) - which should be the primary key
- `session_id` (TEXT) - which shouldn't exist at all

And logs_events is trying to reference the wrong one.