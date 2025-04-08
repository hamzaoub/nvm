import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaOctopusDeploy } from 'react-icons/fa';
import { ArrowLeft, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { OceanButton } from '@/components/OceanButton';
import projectsService, { Project } from '@/services/projects';
import { useUserRole } from '@/hooks/useUserRole';

const ProjectCreate: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    status: 'pending',
    type: '',
    progress: 0,
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  
  // Get user role information and redirect non-admins
  const { isAdmin, isLoading: isLoadingRoles } = useUserRole();
  
  useEffect(() => {
    // Only redirect after role check is complete
    if (!isLoadingRoles && !isAdmin) {
      toast.error('You do not have permission to create projects');
      navigate('/dashboard');
    }
  }, [isAdmin, isLoadingRoles, navigate]);
  
  // Create project mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Project>) => {
      // Ensure all required fields have values before sending to API
      const projectData = {
        title: data.title || '',
        description: data.description || '',
        status: data.status || 'pending',
        type: data.type || 'ai',
        // Optional fields can remain as is
        progress: data.progress,
        imageUrl: data.imageUrl,
        tags: data.tags,
        role: data.role
      };
      return projectsService.createProject(projectData);
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
      navigate(`/projects/${newProject.id}`);
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
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
    
    // Validate required fields
    if (!formData.title || !formData.description || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    createMutation.mutate(formData);
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
        
        {isAdmin ? (
          <div className="bg-[#0c2e44]/80 p-6 rounded-xl border border-[#0077b6]/30 backdrop-blur-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FaOctopusDeploy className="text-4xl text-[#00b4d8]" />
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00b4d8] via-[#0077b6] to-[#023e8a]">
                  Create New Project
                </h1>
              </div>
            </div>
            
            {/* Project form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-[#ade8f4] text-sm font-medium mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter project title"
                  className="w-full bg-[#051e2f] border border-[#0077b6]/30 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00b4d8]"
                  required
                />
              </div>
              
              {/* Status and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#ade8f4] text-sm font-medium mb-2">
                    Status
                  </label>
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
                </div>
                
                <div>
                  <label className="block text-[#ade8f4] text-sm font-medium mb-2">
                    Type <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder="E.g., ML Model, Web App, etc."
                    className="w-full bg-[#051e2f] border border-[#0077b6]/30 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00b4d8]"
                    required
                  />
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-[#ade8f4] text-sm font-medium mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of the project"
                  rows={4}
                  className="w-full bg-[#051e2f] border border-[#0077b6]/30 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00b4d8]"
                  required
                />
              </div>
              
              {/* Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[#ade8f4] text-sm font-medium">Progress</label>
                  <span className="text-[#ade8f4] text-sm">{formData.progress}%</span>
                </div>
                <input
                  type="range"
                  name="progress"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={handleInputChange}
                  className="w-full h-2 bg-[#0a3a5a] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00b4d8]"
                />
              </div>
              
              {/* Tags */}
              <div>
                <label className="block text-[#ade8f4] text-sm font-medium mb-2">Tags</label>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags?.map((tag, idx) => (
                    <div key={idx} className="bg-[#0a3a5a] text-[#90e0ef] text-xs px-3 py-1.5 rounded-full flex items-center">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-[#90e0ef] hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
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
              </div>
              
              {/* Submit buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 rounded bg-[#051e2f] text-[#ade8f4] hover:bg-[#0a3a5a] transition-colors"
                >
                  Cancel
                </button>
                <OceanButton type="submit" disabled={createMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {createMutation.isPending ? 'Creating...' : 'Create Project'}
                </OceanButton>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">You do not have permission to create projects.</p>
            <OceanButton onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </OceanButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCreate;
