-- SAFE method: Insert attendance one by one with explicit values
-- This bypasses RLS issues

-- Abiijuru
INSERT INTO public.attendance (worker_id, date, status, lunch_taken, hours, created_at)
SELECT id, '2025-10-27', 'present', true, 8.0, NOW()
FROM public.workers WHERE name = 'abiijuru'
ON CONFLICT (worker_id, date) DO UPDATE SET status = 'present', lunch_taken = true, hours = 8.0;

-- Penreza
INSERT INTO public.attendance (worker_id, date, status, lunch_taken, hours, created_at)
SELECT id, '2025-10-27', 'present', true, 8.0, NOW()
FROM public.workers WHERE name = 'penreza'
ON CONFLICT (worker_id, date) DO UPDATE SET status = 'present', lunch_taken = true, hours = 8.0;

-- Paccy
INSERT INTO public.attendance (worker_id, date, status, lunch_taken, hours, created_at)
SELECT id, '2025-10-27', 'present', true, 8.0, NOW()
FROM public.workers WHERE name = 'paccy'
ON CONFLICT (worker_id, date) DO UPDATE SET status = 'present', lunch_taken = true, hours = 8.0;

-- Sayidi
INSERT INTO public.attendance (worker_id, date, status, lunch_taken, hours, created_at)
SELECT id, '2025-10-27', 'present', true, 8.0, NOW()
FROM public.workers WHERE name = 'sayidi'
ON CONFLICT (worker_id, date) DO UPDATE SET status = 'present', lunch_taken = true, hours = 8.0;

-- Nduwa
INSERT INTO public.attendance (worker_id, date, status, lunch_taken, hours, created_at)
SELECT id, '2025-10-27', 'present', true, 8.0, NOW()
FROM public.workers WHERE name = 'Nduwa'
ON CONFLICT (worker_id, date) DO UPDATE SET status = 'present', lunch_taken = true, hours = 8.0;

-- Kabanda
INSERT INTO public.attendance (worker_id, date, status, lunch_taken, hours, created_at)
SELECT id, '2025-10-27', 'present', true, 8.0, NOW()
FROM public.workers WHERE name = 'kabanda'
ON CONFLICT (worker_id, date) DO UPDATE SET status = 'present', lunch_taken = true, hours = 8.0;

-- Mukobwa
INSERT INTO public.attendance (worker_id, date, status, lunch_taken, hours, created_at)
SELECT id, '2025-10-27', 'present', true, 8.0, NOW()
FROM public.workers WHERE name = 'mukobwa'
ON CONFLICT (worker_id, date) DO UPDATE SET status = 'present', lunch_taken = true, hours = 8.0;

-- Emmanuel
INSERT INTO public.attendance (worker_id, date, status, lunch_taken, hours, created_at)
SELECT id, '2025-10-27', 'present', true, 8.0, NOW()
FROM public.workers WHERE name = 'emmanuel'
ON CONFLICT (worker_id, date) DO UPDATE SET status = 'present', lunch_taken = true, hours = 8.0;

-- Muganda
INSERT INTO public.attendance (worker_id, date, status, lunch_taken, hours, created_at)
SELECT id, '2025-10-27', 'present', true, 8.0, NOW()
FROM public.workers WHERE name = 'muganda'
ON CONFLICT (worker_id, date) DO UPDATE SET status = 'present', lunch_taken = true, hours = 8.0;

-- Now add lunch money
UPDATE attendance
SET lunch_money = (SELECT lunch_allowance FROM workers WHERE workers.id = attendance.worker_id)
WHERE date = '2025-10-27' AND lunch_taken = true;

-- Verify
SELECT w.name, a.status, a.lunch_money
FROM attendance a
JOIN workers w ON a.worker_id = w.id
WHERE a.date = '2025-10-27'
ORDER BY w.name;








