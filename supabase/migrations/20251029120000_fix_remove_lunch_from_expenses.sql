-- Remove lunch from expenses: lunch should NOT be added as an expense
-- Lunch is tracked in attendance but should not appear in the Expenses page
-- Labor expenses should only be the daily rate, not daily rate + lunch

-- Update the handle_attendance_expense function to NOT include lunch in expenses
CREATE OR REPLACE FUNCTION public.handle_attendance_expense()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  worker_record RECORD;
  labor_amount DECIMAL(10,2);
BEGIN
  -- Only process if status is 'present'
  IF NEW.status = 'present' THEN
    -- Get worker details
    SELECT daily_rate, lunch_allowance, name INTO worker_record
    FROM public.workers
    WHERE id = NEW.worker_id;
    
    -- Only use daily rate for Labor expense (lunch is tracked in attendance but not as expense)
    labor_amount := worker_record.daily_rate;
    
    -- Insert expense record with only daily rate (no lunch)
    INSERT INTO public.expenses (category, amount, description, date)
    VALUES (
      'Labor', 
      labor_amount, 
      'Daily wages for ' || worker_record.name || ' on ' || NEW.date::TEXT, 
      NEW.date
    );
    
    -- Update budget used_budget with only daily rate
    UPDATE public.budget
    SET used_budget = used_budget + labor_amount
    WHERE id = (SELECT id FROM public.budget ORDER BY created_at DESC LIMIT 1);
    
    -- Log activity
    INSERT INTO public.activity_log (message, action_type)
    VALUES (
      'Attendance marked for ' || worker_record.name || ' - Labor expense: RWF ' || labor_amount::TEXT, 
      'attendance'
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the trigger
    RAISE WARNING 'Error in handle_attendance_expense: %', SQLERRM;
    RETURN NEW;
END;
$$;



