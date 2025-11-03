-- Fix payroll RLS policies to allow authenticated users to update payroll status
-- This allows users to mark workers as paid/unpaid

-- Drop existing admin-only policies
DROP POLICY IF EXISTS "Admins can insert payroll" ON public.payroll;
DROP POLICY IF EXISTS "Admins can update payroll" ON public.payroll;

-- Drop existing authenticated user policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can insert payroll" ON public.payroll;
DROP POLICY IF EXISTS "Authenticated users can update payroll" ON public.payroll;

-- Allow authenticated users to insert payroll records
CREATE POLICY "Authenticated users can insert payroll" ON public.payroll
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update payroll records (for marking as paid/unpaid)
CREATE POLICY "Authenticated users can update payroll" ON public.payroll
  FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete payroll records (for cleaning up duplicates)
DROP POLICY IF EXISTS "Admins can delete payroll" ON public.payroll;
CREATE POLICY "Authenticated users can delete payroll" ON public.payroll
  FOR DELETE 
  USING (auth.role() = 'authenticated');

