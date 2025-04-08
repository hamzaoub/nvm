import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaOctopusDeploy } from 'react-icons/fa';
import { Plus, Filter, Search, ChevronDown, Grid, List, Trash2 } from 'lucide-react';
import { OceanBubbles } from '@/components/OceanBubbles';
import { toast } from 'sonner';
import ProjectCard from '@/components/ProjectCard';
import LoadingIndicator from '@/components/LoadingIndicator';
import EmptyState from '@/components/EmptyState';
import { OceanButton } from '@/components/OceanButton';
import { OceanSidebar } from '@/components/OceanSidebar';
import projectsService, { Project } from '@/services/projects';
import { useUserRole } from '@/hooks/useUserRole';

const Dashboard: React.FC = () => {
  // State for filters and view mode
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isGridView, setIsGridView] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  
  // Get user role information
  const { isAdmin, isLoading: isLoadingRoles } = useUserRole();
  
  // Fetch projects data
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsService.getAllProjects,
  });
  
  // Filter projects based on search query and status
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === null || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: (projectId: number) => projectsService.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  });

  // Handler for project card click - navigate to project detail
  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };
  
  // Edit project handler - navigate to project detail page with edit mode
  const handleEditProject = (project: Project) => {
    navigate(`/projects/${project.id}?mode=edit`);
  };
  
  // Delete project handler
  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  };
  
  // Confirm delete handler
  const confirmDelete = () => {
    if (projectToDelete) {
      deleteMutation.mutate(projectToDelete.id);
    }
  };
  
  // Create new project handler
  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  return (
    <div className="min-h-screen bg-[#051e2f] relative overflow-hidden flex justify-center">
      {/* Ocean-themed background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#010f19] to-[#0c1630] opacity-90"></div>
      
      {/* Animated bubbles with fully random placement across the dashboard */}
      {/* <OceanBubbles 
        count={200} 
        maxSize={45} 
        minSize={5} 
        randomPlacement={true} 
        maxInitialY={100} 
        maxDuration={25}
        minDuration={10}
        className="absolute inset-0 " 
      /> */}
      
      {/* Sidebar */}
      <OceanSidebar />
      
      {/* Navbar */}
      {/* <Navbar /> */}
      
      <div className="container mx-auto px-4 pt-20 pb-16 md:py-16 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <FaOctopusDeploy className="text-3xl sm:text-4xl text-[#00b4d8]" />
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00b4d8] via-[#0077b6] to-[#023e8a]">
              AI Projects Dashboard
            </h1>
          </div>
          
          {isAdmin && (
            <OceanButton onClick={handleCreateProject}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </OceanButton>
          )}
        </div>
        
        {/* Search and filters */}
        <div className="bg-[#0c2e44]/80 p-3 sm:p-4 rounded-xl border border-[#0077b6]/30 backdrop-blur-sm mb-6 sm:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search input - full width on all devices */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#90e0ef] w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#051e2f] border border-[#0077b6]/30 rounded-lg pl-10 pr-4 py-2 text-[#ade8f4] placeholder-[#90e0ef]/50 focus:outline-none focus:border-[#00b4d8]"
              />
            </div>
            
            {/* Filters and view toggles - side by side on larger screens */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 sm:gap-4">
              <div className="relative w-full sm:w-auto sm:min-w-[140px] sm:flex-1">
                <div className="flex items-center justify-between bg-[#051e2f] border border-[#0077b6]/30 rounded-lg px-4 py-2 text-[#ade8f4] cursor-pointer">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2 text-[#90e0ef]" />
                    <span className="text-sm sm:text-base">{statusFilter || 'All Status'}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#90e0ef]" />
                </div>
                
                {/* Dropdown for status filter - implement full functionality later */}
                {/* Status filter dropdown would go here */}
              </div>
              
              <div className="flex items-center gap-2 ml-auto">
                <button
                  className={`p-2 rounded-lg ${isGridView ? 'bg-[#0077b6] text-white' : 'bg-[#051e2f] text-[#90e0ef]'} border border-[#0077b6]/30`}
                  onClick={() => setIsGridView(true)}
                  aria-label="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  className={`p-2 rounded-lg ${!isGridView ? 'bg-[#0077b6] text-white' : 'bg-[#051e2f] text-[#90e0ef]'} border border-[#0077b6]/30`}
                  onClick={() => setIsGridView(false)}
                  aria-label="List view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Projects grid/list */}
        {isLoading ? (
          <LoadingIndicator text="Loading your AI projects..." className="py-20" />
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">Failed to load projects. Please try again.</p>
            <OceanButton onClick={() => window.location.reload()}>
              Retry
            </OceanButton>
          </div>
        ) : filteredProjects && filteredProjects.length > 0 ? (
          <div className={`grid ${isGridView ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4 sm:gap-6 mb-8`}>
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project)}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        ) : (
          <EmptyState onAction={isAdmin ? handleCreateProject : undefined} />
        )}
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && projectToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c2e44] border border-[#0077b6]/30 rounded-xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Confirm Delete</h3>
            <p className="text-[#ade8f4] text-sm sm:text-base mb-4 sm:mb-6">
              Are you sure you want to delete "{projectToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 sm:px-4 py-2 rounded text-sm sm:text-base bg-[#051e2f] text-[#ade8f4] hover:bg-[#0a3a5a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 sm:px-4 py-2 rounded text-sm sm:text-base bg-red-500 text-white hover:bg-red-600 transition-colors"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
