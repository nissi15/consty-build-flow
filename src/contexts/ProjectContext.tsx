import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  id: string;
  name: string;
  description: string | null;
  manager_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  loading: boolean;
  selectProject: (projectId: string) => void;
  createProject: (name: string, description?: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    if (!user) {
      setProjects([]);
      setCurrentProject(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('manager_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);

      // Auto-select first project or restore from localStorage
      const savedProjectId = localStorage.getItem('selectedProjectId');
      if (savedProjectId && data?.find(p => p.id === savedProjectId)) {
        setCurrentProject(data.find(p => p.id === savedProjectId) || null);
      } else if (data && data.length > 0) {
        setCurrentProject(data[0]);
        localStorage.setItem('selectedProjectId', data[0].id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Subscribe to project changes
    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'projects',
        filter: `manager_id=eq.${user?.id}`
      }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const selectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      localStorage.setItem('selectedProjectId', projectId);
    }
  };

  const createProject = async (name: string, description?: string) => {
    if (!user) throw new Error('User not authenticated');

    // Check project limit client-side
    if (projects.length >= 3) {
      throw new Error('Maximum of 3 projects allowed');
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name,
        description: description || null,
        manager_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-select the newly created project
    await fetchProjects();
    if (data) {
      selectProject(data.id);
    }
  };

  const refreshProjects = async () => {
    await fetchProjects();
  };

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projects,
        loading,
        selectProject,
        createProject,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

