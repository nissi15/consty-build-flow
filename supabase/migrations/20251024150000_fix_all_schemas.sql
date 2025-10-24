-- Comprehensive fix for all schema issues
-- Run this in your Supabase SQL Editor

-- First, let's make sure all columns exist in workers table
DO $$ 
BEGIN
    -- Add contact_info if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workers' AND column_name = 'contact_info'
    ) THEN
        ALTER TABLE public.workers ADD COLUMN contact_info TEXT;
    END IF;

    -- Add join_date if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workers' AND column_name = 'join_date'
    ) THEN
        ALTER TABLE public.workers ADD COLUMN join_date DATE DEFAULT CURRENT_DATE;
    END IF;

    -- Add is_active if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workers' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.workers ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    -- Add lunch_allowance if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workers' AND column_name = 'lunch_allowance'
    ) THEN
        ALTER TABLE public.workers ADD COLUMN lunch_allowance DECIMAL(10,2) DEFAULT 50.00;
    END IF;

    -- Add total_days_worked if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workers' AND column_name = 'total_days_worked'
    ) THEN
        ALTER TABLE public.workers ADD COLUMN total_days_worked INTEGER DEFAULT 0;
    END IF;

    -- Add total_payable if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workers' AND column_name = 'total_payable'
    ) THEN
        ALTER TABLE public.workers ADD COLUMN total_payable DECIMAL(12,2) DEFAULT 0;
    END IF;
END $$;

-- Ensure attendance table has all required columns
DO $$ 
BEGIN
    -- Add lunch_taken if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance' AND column_name = 'lunch_taken'
    ) THEN
        ALTER TABLE public.attendance ADD COLUMN lunch_taken BOOLEAN DEFAULT false;
    END IF;

    -- Add hours if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance' AND column_name = 'hours'
    ) THEN
        ALTER TABLE public.attendance ADD COLUMN hours DECIMAL(4,2) DEFAULT 8.0;
    END IF;
END $$;

-- Ensure expenses table has all required columns
DO $$ 
BEGIN
    -- Add type if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expenses' AND column_name = 'type'
    ) THEN
        ALTER TABLE public.expenses ADD COLUMN type TEXT;
    END IF;

    -- Add description if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expenses' AND column_name = 'description'
    ) THEN
        ALTER TABLE public.expenses ADD COLUMN description TEXT;
    END IF;
END $$;

-- Ensure budget table has budget_remaining column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'budget' AND column_name = 'budget_remaining'
    ) THEN
        ALTER TABLE public.budget ADD COLUMN budget_remaining DECIMAL(12,2) DEFAULT 0;
    END IF;
END $$;

-- Drop ALL existing RLS policies and recreate them simply
DROP POLICY IF EXISTS "Allow public read on workers" ON public.workers;
DROP POLICY IF EXISTS "Allow public insert on workers" ON public.workers;
DROP POLICY IF EXISTS "Allow public update on workers" ON public.workers;
DROP POLICY IF EXISTS "Allow public delete on workers" ON public.workers;
DROP POLICY IF EXISTS "Authenticated users can read workers" ON public.workers;
DROP POLICY IF EXISTS "Admins can insert workers" ON public.workers;
DROP POLICY IF EXISTS "Admins can update workers" ON public.workers;
DROP POLICY IF EXISTS "Admins can delete workers" ON public.workers;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.workers;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.workers;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.workers;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.workers;

-- Create simple, working policies for workers
CREATE POLICY "allow_all_authenticated_workers" ON public.workers
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_anon_read_workers" ON public.workers
    FOR SELECT TO anon USING (true);

-- Drop and recreate attendance policies
DROP POLICY IF EXISTS "Allow public read on attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public insert on attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public update on attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public delete on attendance" ON public.attendance;
DROP POLICY IF EXISTS "Authenticated users can read attendance" ON public.attendance;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.attendance;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.attendance;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.attendance;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.attendance;

CREATE POLICY "allow_all_authenticated_attendance" ON public.attendance
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_anon_read_attendance" ON public.attendance
    FOR SELECT TO anon USING (true);

-- Drop and recreate expenses policies
DROP POLICY IF EXISTS "Allow public read on expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow public insert on expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow public update on expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow public delete on expenses" ON public.expenses;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.expenses;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.expenses;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.expenses;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.expenses;

CREATE POLICY "allow_all_authenticated_expenses" ON public.expenses
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_anon_read_expenses" ON public.expenses
    FOR SELECT TO anon USING (true);

-- Drop and recreate budget policies
DROP POLICY IF EXISTS "Allow public read on budget" ON public.budget;
DROP POLICY IF EXISTS "Allow public update on budget" ON public.budget;
DROP POLICY IF EXISTS "Allow public insert on budget" ON public.budget;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.budget;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.budget;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.budget;

CREATE POLICY "allow_all_authenticated_budget" ON public.budget
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_anon_read_budget" ON public.budget
    FOR SELECT TO anon USING (true);

-- Drop and recreate activity_log policies
DROP POLICY IF EXISTS "Allow public read on activity_log" ON public.activity_log;
DROP POLICY IF EXISTS "Allow public insert on activity_log" ON public.activity_log;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.activity_log;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.activity_log;

CREATE POLICY "allow_all_authenticated_activity_log" ON public.activity_log
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_anon_read_activity_log" ON public.activity_log
    FOR SELECT TO anon USING (true);

-- Ensure realtime is enabled for all tables
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.workers;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.attendance;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.expenses;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.budget;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.activity_log;

ALTER PUBLICATION supabase_realtime ADD TABLE public.workers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budget;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;

-- Verify everything
SELECT 'Migration completed successfully!' as status;

