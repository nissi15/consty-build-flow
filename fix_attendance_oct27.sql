-- Fix: Mark ALL workers present for October 27, 2024
-- This handles both new and existing records

INSERT INTO public.attendance (worker_id, date, status, lunch_taken, hours, created_at)
SELECT 
  w.id,
  '2024-10-27'::DATE,
  'present',
  true,
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

-- Verify ALL workers are marked present
SELECT 
  w.name,
  a.date,
  a.status,
  w.daily_rate,
  w.lunch_allowance,
  (w.daily_rate + w.lunch_allowance) as total_cost_per_worker
FROM public.attendance a
JOIN public.workers w ON a.worker_id = w.id
WHERE a.date = '2024-10-27'
  AND w.is_active = true
ORDER BY w.name;








