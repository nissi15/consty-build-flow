-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'worker');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'worker',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Create profiles table for additional user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Assign default worker role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'worker');
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile and role on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing RLS policies to require authentication
DROP POLICY IF EXISTS "Allow public read on workers" ON public.workers;
DROP POLICY IF EXISTS "Allow public insert on workers" ON public.workers;
DROP POLICY IF EXISTS "Allow public update on workers" ON public.workers;
DROP POLICY IF EXISTS "Allow public delete on workers" ON public.workers;

CREATE POLICY "Authenticated users can read workers" ON public.workers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert workers" ON public.workers
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update workers" ON public.workers
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete workers" ON public.workers
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Update attendance policies
DROP POLICY IF EXISTS "Allow public read on attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public insert on attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public update on attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public delete on attendance" ON public.attendance;

CREATE POLICY "Authenticated users can read attendance" ON public.attendance
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert attendance" ON public.attendance
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update attendance" ON public.attendance
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete attendance" ON public.attendance
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Update expenses policies
DROP POLICY IF EXISTS "Allow public read on expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow public insert on expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow public update on expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow public delete on expenses" ON public.expenses;

CREATE POLICY "Authenticated users can read expenses" ON public.expenses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert expenses" ON public.expenses
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update expenses" ON public.expenses
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete expenses" ON public.expenses
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Update budget policies
DROP POLICY IF EXISTS "Allow public read on budget" ON public.budget;
DROP POLICY IF EXISTS "Allow public update on budget" ON public.budget;
DROP POLICY IF EXISTS "Allow public insert on budget" ON public.budget;

CREATE POLICY "Authenticated users can read budget" ON public.budget
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert budget" ON public.budget
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update budget" ON public.budget
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Update activity_log policies
DROP POLICY IF EXISTS "Allow public read on activity_log" ON public.activity_log;
DROP POLICY IF EXISTS "Allow public insert on activity_log" ON public.activity_log;

CREATE POLICY "Authenticated users can read activity_log" ON public.activity_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert activity_log" ON public.activity_log
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;