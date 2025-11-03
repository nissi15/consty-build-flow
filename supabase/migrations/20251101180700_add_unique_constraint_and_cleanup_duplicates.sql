-- Add UNIQUE constraint to prevent duplicate payroll records
-- And clean up existing duplicates

-- Step 1: Clean up existing duplicates FIRST (before adding constraint)
-- Strategy: Keep the most recent record, or if same date, keep the one with 'paid' status

-- First pass: Delete older records, keeping the most recent one
WITH ranked_payroll AS (
    SELECT 
        id,
        worker_id,
        period_start,
        period_end,
        created_at,
        status,
        ROW_NUMBER() OVER (
            PARTITION BY worker_id, period_start, period_end 
            ORDER BY created_at DESC, 
                     CASE WHEN status = 'paid' THEN 1 ELSE 2 END,
                     id ASC
        ) as rn
    FROM public.payroll
)
DELETE FROM public.payroll
WHERE id IN (
    SELECT id FROM ranked_payroll WHERE rn > 1
);

-- Step 2: Now add the UNIQUE constraint (after duplicates are cleaned)
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

