-- Migration to preserve existing data by creating a default project and assigning all existing data to it

-- Step 1: Create a default project for existing data
-- We'll insert a default project that will be assigned to the first manager we find, or create a generic one
DO $$
DECLARE
  default_project_id UUID;
  first_manager_id UUID;
BEGIN
  -- Try to find the first user (manager/owner)
  SELECT id INTO first_manager_id FROM auth.users LIMIT 1;
  
  -- If no users exist yet, we'll just prepare the schema but not migrate data
  IF first_manager_id IS NOT NULL THEN
    -- Create default project
    INSERT INTO projects (name, description, manager_id, is_active)
    VALUES ('Main Project', 'Default project for existing data', first_manager_id, true)
    RETURNING id INTO default_project_id;
    
    -- Step 2: Update all existing records to use the default project
    -- Only update records that have NULL project_id
    
    UPDATE workers 
    SET project_id = default_project_id 
    WHERE project_id IS NULL;
    
    UPDATE attendance 
    SET project_id = default_project_id 
    WHERE project_id IS NULL;
    
    UPDATE expenses 
    SET project_id = default_project_id 
    WHERE project_id IS NULL;
    
    UPDATE budget 
    SET project_id = default_project_id 
    WHERE project_id IS NULL;
    
    UPDATE activity_log 
    SET project_id = default_project_id 
    WHERE project_id IS NULL;
    
    UPDATE payroll 
    SET project_id = default_project_id 
    WHERE project_id IS NULL;
    
    RAISE NOTICE 'Successfully migrated existing data to default project %', default_project_id;
  ELSE
    RAISE NOTICE 'No users found. Data migration will occur when first user is created.';
  END IF;
END $$;

