-- Drop existing tables and recreate them
DROP TABLE IF EXISTS public.payroll CASCADE;
DROP TABLE IF EXISTS public.owner_access_codes CASCADE;

-- Create owner_access_codes table
CREATE TABLE public.owner_access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) NOT NULL UNIQUE,
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  manager_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create payroll table
CREATE TABLE public.payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  days_worked INTEGER NOT NULL DEFAULT 0,
  daily_rate NUMERIC NOT NULL DEFAULT 0,
  lunch_deduction NUMERIC NOT NULL DEFAULT 0,
  gross_amount NUMERIC NOT NULL DEFAULT 0,
  lunch_total NUMERIC NOT NULL DEFAULT 0,
  net_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.owner_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;

-- RLS policies for owner_access_codes
CREATE POLICY "Managers can view their own codes" ON public.owner_access_codes
  FOR SELECT USING (manager_id = auth.uid());

CREATE POLICY "Managers can create codes" ON public.owner_access_codes
  FOR INSERT WITH CHECK (manager_id = auth.uid());

CREATE POLICY "Managers can update their own codes" ON public.owner_access_codes
  FOR UPDATE USING (manager_id = auth.uid());

CREATE POLICY "Managers can delete their own codes" ON public.owner_access_codes
  FOR DELETE USING (manager_id = auth.uid());

CREATE POLICY "Anyone can verify active codes" ON public.owner_access_codes
  FOR SELECT USING (is_active = true);

-- RLS policies for payroll
CREATE POLICY "Authenticated users can read payroll" ON public.payroll
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert payroll" ON public.payroll
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update payroll" ON public.payroll
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete payroll" ON public.payroll
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Create generate_payroll function
CREATE OR REPLACE FUNCTION public.generate_payroll(start_date DATE, end_date DATE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  processed_count INTEGER := 0;
BEGIN
  INSERT INTO public.payroll (worker_id, period_start, period_end, days_worked, daily_rate, lunch_deduction, gross_amount, lunch_total, net_amount)
  SELECT 
    w.id,
    start_date,
    end_date,
    COUNT(a.id)::INTEGER,
    w.daily_rate,
    w.lunch_allowance,
    w.daily_rate * COUNT(a.id),
    w.lunch_allowance * COUNT(a.id),
    (w.daily_rate * COUNT(a.id)) - (w.lunch_allowance * COUNT(a.id))
  FROM public.workers w
  LEFT JOIN public.attendance a ON a.worker_id = w.id 
    AND a.date BETWEEN start_date AND end_date
    AND a.status = 'present'
  WHERE w.is_active = true
  GROUP BY w.id, w.daily_rate, w.lunch_allowance;
  
  GET DIAGNOSTICS processed_count = ROW_COUNT;
  RETURN processed_count;
END;
$$;