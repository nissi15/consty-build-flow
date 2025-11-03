-- Mark attendance for workers on October 27, 2024
-- This will automatically calculate lunch money and add to expenses

-- Insert attendance records
INSERT INTO public.attendance (worker_id, date, status, lunch_taken, hours, created_at)
SELECT 
  w.id,
  '2024-10-27'::DATE,
  'present',
  true, -- They took lunch
  8.0,
  NOW()
FROM public.workers w
WHERE w.name IN ('abiijuru', 'penreza', 'paccy', 'sayidi', 'Nduwa', 'kabanda', 'mukobwa', 'emmanuel', 'muganda')
  AND w.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.attendance a 
    WHERE a.worker_id = w.id AND a.date = '2024-10-27'
  )
ON CONFLICT DO NOTHING;

-- Verify what was inserted
SELECT 
  w.name,
  a.date,
  a.status,
  a.lunch_taken,
  w.daily_rate,
  w.lunch_allowance,
  (w.daily_rate + w.lunch_allowance) as total_cost
FROM public.attendance a
JOIN public.workers w ON a.worker_id = w.id
WHERE a.date = '2024-10-27'
ORDER BY w.name;








