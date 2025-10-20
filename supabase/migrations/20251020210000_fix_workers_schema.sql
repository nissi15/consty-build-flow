-- Fix workers table schema to ensure all required columns exist
-- This migration ensures the workers table matches the code expectations

-- First, check if contact_info column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workers' 
        AND column_name = 'contact_info'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.workers ADD COLUMN contact_info TEXT;
    END IF;
END $$;

-- Check if join_date column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workers' 
        AND column_name = 'join_date'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.workers ADD COLUMN join_date DATE DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- Check if is_active column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workers' 
        AND column_name = 'is_active'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.workers ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Ensure lunch_allowance column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workers' 
        AND column_name = 'lunch_allowance'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.workers ADD COLUMN lunch_allowance DECIMAL(10,2) DEFAULT 50.00;
    END IF;
END $$;

-- Update any existing workers to have default values for new columns
UPDATE public.workers 
SET 
    contact_info = COALESCE(contact_info, 'No contact'),
    join_date = COALESCE(join_date, CURRENT_DATE),
    is_active = COALESCE(is_active, true),
    lunch_allowance = COALESCE(lunch_allowance, 50.00)
WHERE 
    contact_info IS NULL 
    OR join_date IS NULL 
    OR is_active IS NULL 
    OR lunch_allowance IS NULL;
