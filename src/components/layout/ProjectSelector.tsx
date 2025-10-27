import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, FolderOpen, Plus } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';

export function ProjectSelector() {
  const { currentProject, projects, selectProject } = useProject();
  const navigate = useNavigate();

  if (!currentProject && projects.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/projects')}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Create Project
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FolderOpen className="h-4 w-4" />
          <span className="max-w-[150px] truncate">
            {currentProject?.name || 'Select Project'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Your Projects</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => selectProject(project.id)}
            className={currentProject?.id === project.id ? 'bg-accent' : ''}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            <span className="truncate">{project.name}</span>
          </DropdownMenuItem>
        ))}
        {projects.length < 3 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/projects')}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

