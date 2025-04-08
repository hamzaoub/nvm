import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaOctopusDeploy } from 'react-icons/fa';
import { ArrowLeft, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import LoadingIndicator from '@/components/LoadingIndicator';
import { OceanButton } from '@/components/OceanButton';
import projectsService, { Project } from '@/services/projects';
import { useUserRole } from '@/hooks/useUserRole';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const projectId = parseInt(id || '0');
  
  // Check if we should be in edit mode based on URL parameter
  const location = window.location.search;
  const params = new URLSearchParams(location);
  const editMode = params.get('mode') === 'edit';
  
  const [isEditing, setIsEditing] = useState(editMode);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Initialize with empty/default values which will be replaced by database data when loaded
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [tagInput, setTagInput] = useState('');
  
  // Get user role information
  const { isAdmin } = useUserRole();
  
  // Fetch project data
  const { data: project = {} as Project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsService.getProject(projectId),
    enabled: projectId > 0
  });
  
  // Update form data whenever project data changes
  useEffect(() => {
    if (project && project.id) {
      // Update form data with all fields from the project
      setFormData({
        title: project.title || '',
        description: project.description || '',
        status: project.status || 'pending',
        type: project.type || '',
        progress: project.progress !== undefined ? project.progress : 0,
        tags: project.tags || [],
        imageUrl: project.imageUrl,
        role: project.role
      });
    }
  }, [project]);
  
  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Project>) => projectsService.updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsEditing(false);
      toast.success('Project updated successfully');
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  });
  
  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: () => projectsService.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  });
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'progress' ? parseInt(value) : value
    });
  };
  
  // Handle tag add/remove
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag)
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };
  
  // Handle delete
  const handleDelete = () => {
    deleteMutation.mutate();
  };
  
  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="min-h-screen bg-[#051e2f] relative overflow-hidden">
      {/* Ocean-themed background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#051e2f] via-[#0a3a5a] to-[#0c4c74] opacity-80"></div>
      
      {/* Animated bubbles in background */}
      
      {/* Navbar */}
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Back button */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-[#ade8f4] mb-6 hover:text-[#00b4d8] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        
        {isLoading ? (
          <LoadingIndicator text="Loading project details..." className="py-20" />
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">Failed to load project details. Please try again.</p>
            <OceanButton onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </OceanButton>
          </div>
        ) : project ? (
          <>
            <div className="bg-[#0c2e44]/80 p-6 rounded-xl border border-[#0077b6]/30 backdrop-blur-sm mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FaOctopusDeploy className="text-4xl text-[#00b4d8]" />
                  
                  {isEditing ? (
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="text-2xl font-bold bg-[#051e2f] text-white border border-[#0077b6]/30 rounded px-3 py-2 w-full max-w-md focus:outline-none focus:border-[#00b4d8]"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00b4d8] via-[#0077b6] to-[#023e8a]">
                      {project.title}
                    </h1>
                  )}
                </div>
                
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <OceanButton onClick={handleSubmit} disabled={updateMutation.isPending}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </OceanButton>
                        <button 
                          onClick={() => setIsEditing(false)}
                          className="p-2 rounded-lg bg-[#051e2f] text-[#90e0ef] border border-[#0077b6]/30 hover:text-white transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="p-2 rounded-lg bg-[#051e2f] text-yellow-400 border border-[#0077b6]/30 hover:bg-[#0a3a5a] transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(true)}
                          className="p-2 rounded-lg bg-[#051e2f] text-red-400 border border-[#0077b6]/30 hover:bg-[#0a3a5a] transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Project details */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Status and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[#ade8f4] text-sm font-medium mb-2">Status</label>
                    {isEditing ? (
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full bg-[#051e2f] border border-[#0077b6]/30 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00b4d8]"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                    ) : (
                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium
                          ${project.status === 'active' ? 'bg-green-400/20 text-green-400' : ''}
                          ${project.status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' : ''}
                          ${project.status === 'completed' ? 'bg-blue-400/20 text-blue-400' : ''}
                        `}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-[#ade8f4] text-sm font-medium mb-2">Type</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full bg-[#051e2f] border border-[#0077b6]/30 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00b4d8]"
                      />
                    ) : (
                      <div className="bg-[#051e2f]/50 px-3 py-2 rounded text-[#ade8f4]">
                        {project.type}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-[#ade8f4] text-sm font-medium mb-2">Description</label>
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full bg-[#051e2f] border border-[#0077b6]/30 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00b4d8]"
                    />
                  ) : (
                    <div className="bg-[#051e2f]/50 px-4 py-3 rounded text-[#ade8f4]">
                      {project.description}
                    </div>
                  )}
                </div>
                
                {/* Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[#ade8f4] text-sm font-medium">Progress</label>
                    <span className="text-[#ade8f4] text-sm">{isEditing ? formData.progress : project.progress}%</span>
                  </div>
                  
                  {isEditing ? (
                    <input
                      type="range"
                      name="progress"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={handleInputChange}
                      className="w-full h-2 bg-[#0a3a5a] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00b4d8]"
                    />
                  ) : (
                    <div className="w-full h-2 bg-[#0a3a5a] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#0077b6] to-[#00b4d8]" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                
                {/* Tags */}
                <div>
                  <label className="block text-[#ade8f4] text-sm font-medium mb-2">Tags</label>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(isEditing ? formData.tags : project.tags)?.map((tag, idx) => (
                      <div key={idx} className="bg-[#0a3a5a] text-[#90e0ef] text-xs px-3 py-1.5 rounded-full flex items-center">
                        {tag}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-[#90e0ef] hover:text-white"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {isEditing && (
                    <div className="flex items-center mt-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag"
                        className="flex-1 bg-[#051e2f] border border-[#0077b6]/30 rounded-l px-3 py-2 text-white focus:outline-none focus:border-[#00b4d8]"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="bg-[#0077b6] text-white px-3 py-2 rounded-r hover:bg-[#00b4d8] transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Creation and update dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#90e0ef]">
                  <div>
                    <span className="block opacity-70">Created</span>
                    <span>{formatDate(project.createdAt)}</span>
                  </div>
                  
                  <div>
                    <span className="block opacity-70">Last Updated</span>
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Related content or additional information could go here */}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-[#ade8f4] mb-4">Project not found</p>
            <OceanButton onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </OceanButton>
          </div>
        )}
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0c2e44] border border-[#0077b6]/30 rounded-xl p-6 max-w-md w-full m-4">
            <h3 className="text-xl font-semibold text-white mb-4">Confirm Delete</h3>
            <p className="text-[#ade8f4] mb-6">
              Are you sure you want to delete "{project?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded bg-[#051e2f] text-[#ade8f4] hover:bg-[#0a3a5a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
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

export default ProjectDetail;
