import React from 'react';
import { Project } from '@/services/projects';
import { FaOctopusDeploy } from 'react-icons/fa';
import { Clock, Tag, ArrowRight, Edit, Trash2 } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  isAdmin?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onEdit, onDelete, isAdmin = false }) => {
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div 
      className="bg-[#051e2f]/70 rounded-xl border border-[#0077b6]/30 hover:border-[#00b4d8]/50 transition-all duration-300 
                 overflow-hidden shadow-lg hover:shadow-[0_0_15px_rgba(0,180,216,0.3)] cursor-pointer group h-full flex flex-col"
      onClick={onClick}
    >
      <div className="relative">
        {project.imageUrl ? (
          <img 
            src={project.imageUrl} 
            alt={project.title} 
            className="w-full h-32 sm:h-36 md:h-40 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-32 sm:h-36 md:h-40 bg-gradient-to-br from-[#0077b6] to-[#00b4d8] flex items-center justify-center"> 
            <FaOctopusDeploy className="text-4xl sm:text-4xl md:text-5xl text-white/80" />
          </div>
        )}
        <div className="absolute top-2 sm:top-2.5 md:top-3 right-2 sm:right-2.5 md:right-3 bg-[#051e2f]/80 px-2 py-0.5 sm:px-2.5 md:px-3 sm:py-0.5 md:py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-[#0077b6]/30">
          <span className={`
            ${project.status === 'active' ? 'text-green-400' : ''}
            ${project.status === 'pending' ? 'text-yellow-400' : ''}
            ${project.status === 'completed' ? 'text-blue-400' : ''}
          `}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col"> 
        <h3 className="text-lg sm:text-lg md:text-xl font-semibold text-white mb-1.5 sm:mb-1.5 md:mb-2 group-hover:text-[#00b4d8] transition-colors line-clamp-1">
          {project.title}
        </h3>
        
        <p className="text-[#ade8f4] text-xs sm:text-xs md:text-sm line-clamp-2 mb-3 sm:mb-3 md:mb-4"> 
          {project.description}
        </p>
        
        <div className="flex items-center text-[#90e0ef] text-xs mb-2 sm:mb-3">
          <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">{formatDate(project.createdAt)}</span>
        </div>
        
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3 sm:mb-3 md:mb-4 max-w-full"> 
            {project.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="bg-[#0a3a5a] text-[#90e0ef] text-xs px-2 py-0.5 rounded-full flex items-center"
              >
                <Tag className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                <span className="truncate max-w-[80px]">{tag}</span>
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="bg-[#0a3a5a] text-[#90e0ef] text-xs px-2 py-0.5 rounded-full">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {project.progress !== undefined && (
          <div className="mb-3 sm:mb-3 md:mb-4 mt-auto"> 
            <div className="flex justify-between text-xs text-[#ade8f4] mb-1">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#0a3a5a] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#0077b6] to-[#00b4d8]" 
                style={{ width: `${project.progress}%` }}
                aria-label={`${project.progress}% complete`}
                role="progressbar"
                aria-valuenow={project.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-auto pt-2">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button 
                className="text-yellow-400 p-1.5 rounded-full hover:bg-[#0a3a5a] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdit) {
                    onEdit(project);
                  }
                }}
                aria-label="Edit project"
              >
                <Edit className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" /> 
              </button>
              <button 
                className="text-red-400 p-1.5 rounded-full hover:bg-[#0a3a5a] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDelete) {
                    onDelete(project);
                  }
                }}
                aria-label="Delete project"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" /> 
              </button>
            </div>
          )}
          <span className="text-[#00b4d8] text-xs sm:text-xs md:text-sm flex items-center group-hover:translate-x-1 transition-transform ml-auto"> 
            View Details <ArrowRight className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ml-1" /> 
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
