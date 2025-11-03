-- Add ALL workers for October 27, 2025
-- First, let's see what workers exist

SELECT name, lunch_allowance, daily_rate FROM workers 
WHERE name IN ('abiijuru', 'penreza', 'paccy', 'sayidi', 'Nduwa', 'kabanda', 'mukobwa', 'emmanuel', 'muganda')
ORDER BY name;

-- Now insert/update attendance for ALL workers
INSERT INTO public.attendance (worker_id, date, status, lunch_taken, hours, created_at)
SELECT 
  w.id,
  '2025-10-27'::DATE,
  'present',
  true, -- They took lunch
  8.0,
  NOW()
FROM public.workers w
WHERE w.name IN ('abiijuru', 'penreza', 'paccy', 'sayidi', 'Nduwa', 'kabanda', 'mukobwa', 'emmanuel', 'muganda')
  AND w.is_active = true
ON CONFLICT (worker_id, date) 
DO UPDATE SET
  status = 'present',
  lunch_taken = true,
  hours = 8.0,
  updated_at = NOW();

-- Now manually update lunch_money for each worker
UPDATE attendance a
SET lunch_money = w.lunch_allowance
FROM workers w
WHERE a.worker_id = w.id
  AND a.date = '2025-10-27'
  AND a.lunch_taken = true;

-- Verify all workers are present with lunch money
SELECT 
  w.name,
  a.date,
  a.status,
  a.hours,
  w.daily_rate,
  w.lunch_allowance,
  a.lunch_money,
  (w.daily_rate + COALESCE(a.lunch_money, w.lunch_allowance)) as total_cost
FROM public.attendance a
JOIN public.workers w ON a.worker_id = w.id
WHERE a.date = '2025-10-27'
  AND a.status = 'present'
ORDER BY w.name;








