-- RUN THIS IN YOUR SUPABASE DASHBOARD > SQL EDITOR
-- This fixes the 401 error preventing worker deletion

-- First, drop ALL conflicting delete policies
DROP POLICY IF EXISTS "Allow public delete on workers" ON public.workers;
DROP POLICY IF EXISTS "Admins can delete workers" ON public.workers;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.workers;
DROP POLICY IF EXISTS "authenticated_users_can_delete_workers" ON public.workers;

-- Create a single, simple policy that allows any authenticated user to delete workers
CREATE POLICY "allow_authenticated_delete_workers" 
ON public.workers
FOR DELETE 
TO authenticated 
USING (true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'workers' AND cmd = 'DELETE';

