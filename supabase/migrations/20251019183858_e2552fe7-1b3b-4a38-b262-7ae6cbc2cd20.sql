-- Create workers table
CREATE TABLE public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  lunch_allowance DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  lunch_money DECIMAL(10,2) DEFAULT 0,
  hours DECIMAL(4,1) DEFAULT 8.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(worker_id, date)
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create budget table
CREATE TABLE public.budget (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_budget DECIMAL(12,2) NOT NULL DEFAULT 0,
  used_budget DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create activity_log table
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  action_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public access for now - refine based on auth later)
CREATE POLICY "Allow public read on workers" ON public.workers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on workers" ON public.workers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on workers" ON public.workers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on workers" ON public.workers FOR DELETE USING (true);

CREATE POLICY "Allow public read on attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Allow public insert on attendance" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on attendance" ON public.attendance FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on attendance" ON public.attendance FOR DELETE USING (true);

CREATE POLICY "Allow public read on expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert on expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on expenses" ON public.expenses FOR DELETE USING (true);

CREATE POLICY "Allow public read on budget" ON public.budget FOR SELECT USING (true);
CREATE POLICY "Allow public update on budget" ON public.budget FOR UPDATE USING (true);
CREATE POLICY "Allow public insert on budget" ON public.budget FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on activity_log" ON public.activity_log FOR SELECT USING (true);
CREATE POLICY "Allow public insert on activity_log" ON public.activity_log FOR INSERT WITH CHECK (true);

-- Create function to automatically add expense when attendance is marked
CREATE OR REPLACE FUNCTION public.handle_attendance_expense()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  worker_record RECORD;
  total_amount DECIMAL(10,2);
BEGIN
  -- Only process if status is 'present'
  IF NEW.status = 'present' THEN
    -- Get worker details
    SELECT daily_rate, lunch_allowance, name INTO worker_record
    FROM public.workers
    WHERE id = NEW.worker_id;
    
    -- Calculate total amount
    total_amount := worker_record.daily_rate + COALESCE(NEW.lunch_money, worker_record.lunch_allowance);
    
    -- Insert expense record
    INSERT INTO public.expenses (category, amount, description, date)
    VALUES ('Labor', total_amount, 'Daily wages for ' || worker_record.name || ' on ' || NEW.date::TEXT, NEW.date);
    
    -- Update budget used_budget
    UPDATE public.budget
    SET used_budget = used_budget + total_amount
    WHERE id = (SELECT id FROM public.budget ORDER BY created_at DESC LIMIT 1);
    
    -- Log activity
    INSERT INTO public.activity_log (message, action_type)
    VALUES ('Attendance marked for ' || worker_record.name || ' - Expense added: $' || total_amount::TEXT, 'attendance');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for attendance expense automation
CREATE TRIGGER on_attendance_create
  AFTER INSERT ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_attendance_expense();

-- Insert initial budget record
INSERT INTO public.budget (total_budget, used_budget) 
VALUES (500000, 0);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.workers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budget;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;