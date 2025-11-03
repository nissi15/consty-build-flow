-- Cleanup: Remove existing lunch expenses and adjust budget
-- This one-time cleanup removes incorrectly added lunch expenses

DO $$
DECLARE
  total_lunch_amount DECIMAL(10,2);
  latest_budget_id UUID;
BEGIN
  -- Calculate total amount of all lunch expenses
  SELECT COALESCE(SUM(amount), 0) INTO total_lunch_amount
  FROM public.expenses
  WHERE category = 'Lunch';
  
  -- Get the latest budget record
  SELECT id INTO latest_budget_id
  FROM public.budget
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Delete all lunch expenses
  DELETE FROM public.expenses
  WHERE category = 'Lunch';
  
  -- Update budget: subtract lunch expense amounts from used_budget
  IF latest_budget_id IS NOT NULL AND total_lunch_amount > 0 THEN
    UPDATE public.budget
    SET used_budget = GREATEST(0, used_budget - total_lunch_amount)
    WHERE id = latest_budget_id;
    
    -- Log the cleanup
    INSERT INTO public.activity_log (message, action_type)
    VALUES (
      'Cleanup: Removed lunch expenses totaling RWF ' || total_lunch_amount::TEXT || ' from expenses and budget',
      'maintenance'
    );
  END IF;
  
  RAISE NOTICE 'Cleanup complete: Removed lunch expenses totaling RWF %', total_lunch_amount;
END $$;






