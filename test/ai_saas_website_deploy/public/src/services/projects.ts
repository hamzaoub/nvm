import axiosInstance from '@/lib/axios';

export interface Project {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  type: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  imageUrl?: string;
  tags?: string[];
  role?: string;
}

// Interface to match Laravel backend response
interface ApiProject {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  type: string;
  progress: number | null;
  image_url: string | null;
  tags: string[] | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

// Function to transform API response to our Project interface
const transformApiProject = (apiProject: ApiProject): Project => {
  return {
    id: apiProject.id,
    title: apiProject.title,
    description: apiProject.description,
    status: apiProject.status,
    type: apiProject.type,
    progress: apiProject.progress || undefined,
    imageUrl: apiProject.image_url || undefined,
    tags: apiProject.tags || undefined,
    role: apiProject.role || undefined,
    createdAt: apiProject.created_at,
    updatedAt: apiProject.updated_at
  };
}

const projectsService = {
  // Get all projects for the authenticated user
  getAllProjects: async (): Promise<Project[]> => {
    const response = await axiosInstance.get('/api/projects');
    return response.data.map((project: ApiProject) => transformApiProject(project));
  },

  // Get a single project by ID
  getProject: async (id: number): Promise<Project> => {
    const response = await axiosInstance.get(`/api/projects/${id}`);
    return transformApiProject(response.data);
  },

  // Create a new project
  createProject: async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    // Convert imageUrl to image_url for the API
    const apiData = {
      ...projectData,
      image_url: projectData.imageUrl,
      tags: projectData.tags || []
    };
    // Remove frontend-specific fields
    delete apiData.imageUrl;
    
    const response = await axiosInstance.post('/api/projects', apiData);
    return transformApiProject(response.data);
  },

  // Update an existing project
  updateProject: async (id: number, projectData: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Project> => {
    // Define API data interface that maps our frontend model to backend expectations
    interface ApiUpdateData extends Omit<typeof projectData, 'imageUrl'> {
      image_url?: string;
      [key: string]: unknown;
    }
    
    // Convert fields to match API expectations
    const apiData: ApiUpdateData = { ...projectData } as ApiUpdateData;
    
    if ('imageUrl' in projectData) {
      apiData.image_url = projectData.imageUrl;
      delete apiData.imageUrl;
    }
    
    const response = await axiosInstance.put(`/api/projects/${id}`, apiData);
    return transformApiProject(response.data);
  },

  // Delete a project
  deleteProject: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/projects/${id}`);
  }
};

export default projectsService;
