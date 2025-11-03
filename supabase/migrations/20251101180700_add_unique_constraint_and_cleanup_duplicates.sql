-- Add UNIQUE constraint to prevent duplicate payroll records
-- And clean up existing duplicates

-- Step 1: Add UNIQUE constraint
-- First, check if constraint already exists and drop if needed
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'payroll_worker_period_unique'
    ) THEN
        ALTER TABLE public.payroll 
        DROP CONSTRAINT payroll_worker_period_unique;
    END IF;
END $$;

-- Add the UNIQUE constraint
ALTER TABLE public.payroll 
ADD CONSTRAINT payroll_worker_period_unique 
UNIQUE (worker_id, period_start, period_end);

-- Step 2: Clean up existing duplicates
-- Keep only the most recent record for each worker+period combination
DELETE FROM public.payroll p1
WHERE EXISTS (
    SELECT 1 FROM public.payroll p2
    WHERE p2.worker_id = p1.worker_id
      AND p2.period_start = p1.period_start
      AND p2.period_end = p1.period_end
      AND p2.created_at > p1.created_at
);

-- If there are still duplicates with the same created_at, keep the one with 'paid' status
-- (prefer paid over pending)
DELETE FROM public.payroll p1
WHERE EXISTS (
    SELECT 1 FROM public.payroll p2
    WHERE p2.worker_id = p1.worker_id
      AND p2.period_start = p1.period_start
      AND p2.period_end = p1.period_end
      AND p2.created_at = p1.created_at
      AND (
        (p2.status = 'paid' AND p1.status != 'paid')
        OR (p2.id < p1.id AND p2.status = p1.status) -- If same status, keep smaller id
      )
);

