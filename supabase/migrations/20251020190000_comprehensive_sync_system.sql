-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.workers CASCADE;
DROP TABLE IF EXISTS public.budget CASCADE;
DROP TABLE IF EXISTS public.activity_log CASCADE;

-- Create workers table
CREATE TABLE public.workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    lunch_allowance DECIMAL(10,2) DEFAULT 50.00,
    contact_info TEXT,
    join_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    total_days_worked INTEGER DEFAULT 0,
    total_paid DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'half-day')),
    lunch_taken BOOLEAN DEFAULT false,
    daily_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
    lunch_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_day_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    hours DECIMAL(4,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(worker_id, date)
);

-- Create expenses table
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('salary', 'lunch', 'material', 'misc', 'payroll')),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    worker_id UUID REFERENCES public.workers(id) ON DELETE SET NULL,
    attendance_id UUID REFERENCES public.attendance(id) ON DELETE SET NULL,
    budget_remaining DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create budget table
CREATE TABLE public.budget (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_budget DECIMAL(12,2) NOT NULL DEFAULT 0,
    used_budget DECIMAL(12,2) NOT NULL DEFAULT 0,
    budget_remaining DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create activity_log table
CREATE TABLE public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    action_type TEXT NOT NULL,
    worker_id UUID REFERENCES public.workers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON public.workers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.workers
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.workers
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.workers
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.attendance
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.attendance
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.attendance
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.attendance
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.expenses
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.expenses
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.expenses
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.expenses
    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.budget
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.budget
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.budget
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON public.activity_log
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.activity_log
    FOR INSERT TO authenticated WITH CHECK (true);

-- Function to handle attendance and expense creation
CREATE OR REPLACE FUNCTION public.handle_attendance_expense()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    worker_record RECORD;
    total_cost DECIMAL(10,2);
    lunch_cost DECIMAL(10,2);
    budget_record RECORD;
BEGIN
    -- Only process if status is 'present' or 'half-day'
    IF NEW.status IN ('present', 'half-day') THEN
        -- Get worker details
        SELECT daily_rate, lunch_allowance, name INTO worker_record
        FROM public.workers
        WHERE id = NEW.worker_id;
        
        -- Calculate costs
        lunch_cost := CASE 
            WHEN NEW.lunch_taken THEN worker_record.lunch_allowance 
            ELSE 0 
        END;
        
        total_cost := worker_record.daily_rate + lunch_cost;
        
        -- Update attendance record with calculated costs
        UPDATE public.attendance
        SET 
            daily_pay = worker_record.daily_rate,
            lunch_cost = lunch_cost,
            total_day_cost = total_cost
        WHERE id = NEW.id;
        
        -- Update worker totals
        UPDATE public.workers
        SET 
            total_days_worked = total_days_worked + 1,
            total_paid = total_paid + total_cost,
            updated_at = now()
        WHERE id = NEW.worker_id;
        
        -- Create expense record
        INSERT INTO public.expenses (type, description, amount, worker_id, attendance_id)
        VALUES (
            'salary',
            'Daily pay for ' || worker_record.name || ' on ' || NEW.date::TEXT,
            total_cost,
            NEW.worker_id,
            NEW.id
        );
        
        -- Update budget
        SELECT * INTO budget_record FROM public.budget ORDER BY created_at DESC LIMIT 1;
        
        IF budget_record IS NOT NULL THEN
            UPDATE public.budget
            SET 
                used_budget = used_budget + total_cost,
                budget_remaining = total_budget - (used_budget + total_cost),
                updated_at = now()
            WHERE id = budget_record.id;
        END IF;
        
        -- Log activity
        INSERT INTO public.activity_log (message, action_type, worker_id)
        VALUES (
            'Attendance marked for ' || worker_record.name || ' - Cost: $' || total_cost::TEXT,
            'attendance',
            NEW.worker_id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for attendance
CREATE TRIGGER trigger_handle_attendance_expense
    AFTER INSERT ON public.attendance
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_attendance_expense();

-- Function to update budget when expenses are added manually
CREATE OR REPLACE FUNCTION public.handle_manual_expense()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    budget_record RECORD;
BEGIN
    -- Only process if it's not a salary expense (those are handled by attendance trigger)
    IF NEW.type != 'salary' THEN
        -- Update budget
        SELECT * INTO budget_record FROM public.budget ORDER BY created_at DESC LIMIT 1;
        
        IF budget_record IS NOT NULL THEN
            UPDATE public.budget
            SET 
                used_budget = used_budget + NEW.amount,
                budget_remaining = total_budget - (used_budget + NEW.amount),
                updated_at = now()
            WHERE id = budget_record.id;
        END IF;
        
        -- Log activity
        INSERT INTO public.activity_log (message, action_type)
        VALUES (
            'Manual expense added: ' || NEW.description || ' - Amount: $' || NEW.amount::TEXT,
            'expense'
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for manual expenses
CREATE TRIGGER trigger_handle_manual_expense
    AFTER INSERT ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_manual_expense();

-- Insert initial data
INSERT INTO public.budget (total_budget, used_budget, budget_remaining)
VALUES (100000, 0, 100000)
ON CONFLICT DO NOTHING;

-- Insert sample worker
INSERT INTO public.workers (name, role, daily_rate, lunch_allowance, contact_info, join_date, status)
VALUES ('John Doe', 'Foreman', 150.00, 25.00, '+1234567890', CURRENT_DATE, 'active')
ON CONFLICT DO NOTHING;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.workers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budget;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
