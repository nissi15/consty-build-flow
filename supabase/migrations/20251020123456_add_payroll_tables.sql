-- Update workers table with new fields
ALTER TABLE public.workers
ADD COLUMN total_days_worked INTEGER DEFAULT 0,
ADD COLUMN total_payable DECIMAL(10,2) DEFAULT 0.00;

-- Create payroll table
CREATE TABLE public.payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  days_worked INTEGER NOT NULL DEFAULT 0,
  daily_rate DECIMAL(10,2) NOT NULL,
  lunch_deduction DECIMAL(10,2) NOT NULL,
  gross_amount DECIMAL(10,2) NOT NULL,
  lunch_total DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(worker_id, period_start, period_end)
);

-- Create payroll_items table for detailed breakdown
CREATE TABLE public.payroll_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_id UUID REFERENCES public.payroll(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  lunch_deduction DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to calculate worker's payroll
CREATE OR REPLACE FUNCTION calculate_worker_payroll(
  worker_id UUID,
  start_date DATE,
  end_date DATE
) RETURNS TABLE (
  days_worked INTEGER,
  gross_amount DECIMAL(10,2),
  lunch_total DECIMAL(10,2),
  net_amount DECIMAL(10,2)
) LANGUAGE plpgsql AS $$
DECLARE
  worker_record RECORD;
BEGIN
  -- Get worker details
  SELECT * INTO worker_record FROM workers WHERE id = worker_id;
  
  -- Calculate days worked in period
  SELECT 
    COUNT(*),
    COUNT(*) * worker_record.daily_rate,
    COUNT(*) * worker_record.lunch_allowance,
    (COUNT(*) * worker_record.daily_rate) - (COUNT(*) * worker_record.lunch_allowance)
  INTO
    days_worked,
    gross_amount,
    lunch_total,
    net_amount
  FROM attendance
  WHERE 
    worker_id = worker_record.id
    AND date BETWEEN start_date AND end_date
    AND status = 'present';
    
  RETURN NEXT;
END;
$$;

-- Function to generate payroll for all workers
CREATE OR REPLACE FUNCTION generate_payroll(
  start_date DATE,
  end_date DATE
) RETURNS SETOF payroll
LANGUAGE plpgsql AS $$
DECLARE
  worker_record RECORD;
  payroll_record payroll%ROWTYPE;
  calculation RECORD;
BEGIN
  -- Loop through active workers
  FOR worker_record IN SELECT * FROM workers WHERE is_active = true
  LOOP
    -- Calculate payroll for worker
    SELECT * INTO calculation 
    FROM calculate_worker_payroll(worker_record.id, start_date, end_date);
    
    -- Create payroll record
    INSERT INTO payroll (
      worker_id,
      period_start,
      period_end,
      days_worked,
      daily_rate,
      lunch_deduction,
      gross_amount,
      lunch_total,
      net_amount
    ) VALUES (
      worker_record.id,
      start_date,
      end_date,
      calculation.days_worked,
      worker_record.daily_rate,
      worker_record.lunch_allowance,
      calculation.gross_amount,
      calculation.lunch_total,
      calculation.net_amount
    )
    RETURNING * INTO payroll_record;
    
    -- Create expense record
    INSERT INTO expenses (
      category,
      amount,
      description,
      date
    ) VALUES (
      'Payroll',
      payroll_record.net_amount,
      'Payroll for ' || worker_record.name || ' (' || start_date || ' to ' || end_date || ')',
      end_date
    );
    
    -- Update budget
    UPDATE budget
    SET used_budget = used_budget + payroll_record.net_amount
    WHERE id = (SELECT id FROM budget ORDER BY created_at DESC LIMIT 1);
    
    -- Log activity
    INSERT INTO activity_log (
      message,
      action_type
    ) VALUES (
      'Generated payroll for ' || worker_record.name || ': $' || payroll_record.net_amount::TEXT,
      'payroll'
    );
    
    RETURN NEXT payroll_record;
  END LOOP;
END;
$$;

-- Enable RLS
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_items ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can read payroll"
  ON public.payroll
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage payroll"
  ON public.payroll
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can read payroll items"
  ON public.payroll_items
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage payroll items"
  ON public.payroll_items
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.payroll;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payroll_items;
