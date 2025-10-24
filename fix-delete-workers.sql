-- Run this in your Supabase Dashboard SQL Editor
-- This will fix the delete permission issues

-- Drop any conflicting delete policies
DROP POLICY IF EXISTS "Allow public delete on workers" ON public.workers;
DROP POLICY IF EXISTS "Admins can delete workers" ON public.workers;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.workers;

-- Create a single, clear delete policy for authenticated users
CREATE POLICY "authenticated_users_can_delete_workers" 
ON public.workers
FOR DELETE 
TO authenticated 
USING (true);

-- Ensure realtime is enabled
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.workers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workers;

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'workers' AND cmd = 'DELETE';

