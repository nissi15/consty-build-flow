-- Add multi-project support
-- Create projects table

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add project_id to existing tables
ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.budget ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.activity_log ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workers_project_id ON public.workers(project_id);
CREATE INDEX IF NOT EXISTS idx_attendance_project_id ON public.attendance(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON public.expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_project_id ON public.budget(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_project_id ON public.activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_manager_id ON public.projects(manager_id);

-- Enable RLS on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Authenticated users can view their own projects" ON public.projects
    FOR SELECT TO authenticated
    USING (auth.uid() = manager_id);

CREATE POLICY "Authenticated users can create projects" ON public.projects
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Authenticated users can update their own projects" ON public.projects
    FOR UPDATE TO authenticated
    USING (auth.uid() = manager_id);

CREATE POLICY "Authenticated users can delete their own projects" ON public.projects
    FOR DELETE TO authenticated
    USING (auth.uid() = manager_id);

-- Function to check project count limit (max 3 projects per manager)
CREATE OR REPLACE FUNCTION check_project_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM public.projects WHERE manager_id = NEW.manager_id AND is_active = true) >= 3 THEN
        RAISE EXCEPTION 'Maximum of 3 projects allowed per manager';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce project limit
DROP TRIGGER IF EXISTS enforce_project_limit ON public.projects;
CREATE TRIGGER enforce_project_limit
    BEFORE INSERT ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION check_project_limit();

-- Enable realtime for projects
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;

-- Add comment
COMMENT ON TABLE public.projects IS 'Stores construction projects, each manager can have up to 3 active projects';

