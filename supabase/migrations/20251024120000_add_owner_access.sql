-- Create owner access codes table
CREATE TABLE IF NOT EXISTS public.owner_access_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(6) UNIQUE NOT NULL,
    manager_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_name TEXT NOT NULL,
    owner_phone TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_accessed_at TIMESTAMPTZ,
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.owner_access_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Managers can view their own codes" 
ON public.owner_access_codes
FOR SELECT 
TO authenticated 
USING (manager_id = auth.uid());

CREATE POLICY "Managers can create codes" 
ON public.owner_access_codes
FOR INSERT 
TO authenticated 
WITH CHECK (manager_id = auth.uid());

CREATE POLICY "Managers can update their own codes" 
ON public.owner_access_codes
FOR UPDATE 
TO authenticated 
USING (manager_id = auth.uid());

CREATE POLICY "Managers can delete their own codes" 
ON public.owner_access_codes
FOR DELETE 
TO authenticated 
USING (manager_id = auth.uid());

-- Allow anyone to verify codes (for login)
CREATE POLICY "Anyone can verify active codes" 
ON public.owner_access_codes
FOR SELECT 
TO anon
USING (is_active = true);

-- Function to generate random 6-digit code
CREATE OR REPLACE FUNCTION generate_owner_code()
RETURNS VARCHAR(6)
LANGUAGE plpgsql
AS $$
DECLARE
    new_code VARCHAR(6);
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random 6-digit code
        new_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- Check if code already exists
        SELECT EXISTS(
            SELECT 1 FROM public.owner_access_codes WHERE code = new_code
        ) INTO code_exists;
        
        -- Exit loop if code is unique
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.owner_access_codes;

