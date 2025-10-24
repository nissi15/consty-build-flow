-- Fix delete policies for workers table
-- Drop any conflicting policies
DROP POLICY IF EXISTS "Allow public delete on workers" ON public.workers;
DROP POLICY IF EXISTS "Admins can delete workers" ON public.workers;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.workers;

-- Create a single, clear delete policy
CREATE POLICY "authenticated_users_can_delete_workers" ON public.workers
    FOR DELETE 
    TO authenticated 
    USING (true);

-- Also ensure realtime is enabled for workers table
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.workers;

