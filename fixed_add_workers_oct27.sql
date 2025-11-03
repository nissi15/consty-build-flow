-- Step 1: Check which workers exist
SELECT name, lunch_allowance, daily_rate FROM workers 
WHERE name IN ('abiijuru', 'penreza', 'paccy', 'sayidi', 'Nduwa', 'kabanda', 'mukobwa', 'emmanuel', 'muganda')
ORDER BY name;

-- Step 2: Insert ALL workers for Oct 27, 2025 (removed updated_at)
INSERT INTO public.attendance (worker_id, date, status, lunch_taken, hours, created_at)
SELECT w.id, '2025-10-27'::DATE, 'present', true, 8.0, NOW()
FROM public.workers w
WHERE w.name IN ('abiijuru', 'penreza', 'paccy', 'sayidi', 'Nduwa', 'kabanda', 'mukobwa', 'emmanuel', 'muganda')
  AND w.is_active = true
ON CONFLICT (worker_id, date) 
DO UPDATE SET status = 'present', lunch_taken = true, hours = 8.0;

-- Step 3: Add lunch money for all workers
UPDATE attendance a
SET lunch_money = w.lunch_allowance
FROM workers w
WHERE a.worker_id = w.id AND a.date = '2025-10-27' AND a.lunch_taken = true;

-- Step 4: Verify it worked (should show all 9 workers)
SELECT w.name, a.date, a.status, a.lunch_money, w.daily_rate
FROM public.attendance a
JOIN public.workers w ON a.worker_id = w.id
WHERE a.date = '2025-10-27'
ORDER BY w.name;








