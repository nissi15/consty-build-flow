-- Fix lunch deduction in expenses: lunch should be SUBTRACTED from daily rate (not added)
-- This matches the Payroll behavior where lunch is deducted from salary

-- Update the handle_attendance_expense function to subtract lunch instead of adding it
CREATE OR REPLACE FUNCTION public.handle_attendance_expense()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  worker_record RECORD;
  lunch_amount DECIMAL(10,2);
  net_amount DECIMAL(10,2); -- Daily rate MINUS lunch (net amount to pay)
BEGIN
  -- Only process if status is 'present'
  IF NEW.status = 'present' THEN
    -- Get worker details
    SELECT daily_rate, lunch_allowance, name INTO worker_record
    FROM public.workers
    WHERE id = NEW.worker_id;
    
    -- Determine lunch amount to deduct
    -- Use lunch_taken boolean if available, otherwise use lunch_money
    IF NEW.lunch_taken IS NOT NULL THEN
      -- Use lunch_taken boolean
      lunch_amount := CASE WHEN NEW.lunch_taken THEN worker_record.lunch_allowance ELSE 0 END;
    ELSE
      -- Fall back to lunch_money field
      lunch_amount := COALESCE(NEW.lunch_money, 0);
    END IF;
    
    -- Calculate NET amount: daily rate MINUS lunch deduction (like in Payroll)
    net_amount := worker_record.daily_rate - lunch_amount;
    
    -- Ensure net_amount is not negative
    IF net_amount < 0 THEN
      net_amount := 0;
    END IF;
    
    -- Insert expense record with NET amount using category (primary schema)
    INSERT INTO public.expenses (category, amount, description, date)
    VALUES (
      'Labor', 
      net_amount, 
      'Daily wages for ' || worker_record.name || ' on ' || NEW.date::TEXT, 
      NEW.date
    );
    
    -- Update budget used_budget with NET amount
    UPDATE public.budget
    SET used_budget = used_budget + net_amount
    WHERE id = (SELECT id FROM public.budget ORDER BY created_at DESC LIMIT 1);
    
    -- Log activity
    INSERT INTO public.activity_log (message, action_type)
    VALUES (
      'Attendance marked for ' || worker_record.name || ' - Net expense: RWF ' || net_amount::TEXT || ' (Daily: ' || worker_record.daily_rate::TEXT || ' - Lunch: ' || lunch_amount::TEXT || ')', 
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






