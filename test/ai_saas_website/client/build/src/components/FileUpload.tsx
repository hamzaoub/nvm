// Optimized FileUpload component with improved drag-and-drop handling and error validation

import React, { useState, useRef, useCallback } from 'react';
import { FileIcon, UploadIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  className?: string;
  id?: string;
  error?: string;
  value?: File | null;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '*/*',
  maxSize = 10, // Default 10MB
  label = 'Upload a file',
  className = '',
  id = 'file-upload',
  error,
  value,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(value || null);
  const [fileError, setFileError] = useState<string | null>(error || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Convert maxSize to bytes for comparison
  const maxSizeBytes = maxSize * 1024 * 1024;
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Validate file
  const validateFile = useCallback((file: File): boolean => {
    // Check file size
    if (file.size > maxSizeBytes) {
      setFileError(`File size exceeds the maximum limit of ${maxSize}MB`);
      toast.error(`File size exceeds the maximum limit of ${maxSize}MB`);
      return false;
    }
    
    // Check file type if accept is specified and not wildcard
    if (accept !== '*/*') {
      const acceptTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type;
      
      // Handle file extensions (e.g., .pdf, .docx)
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      const isValidType = acceptTypes.some(type => {
        // Check MIME type
        if (type.includes('/')) {
          // Handle wildcards like image/*
          if (type.endsWith('/*')) {
            const category = type.split('/')[0];
            return fileType.startsWith(category + '/');
          }
          return fileType === type;
        }
        // Check file extension
        return type === fileExtension;
      });
      
      if (!isValidType) {
        setFileError(`Invalid file type. Accepted types: ${accept}`);
        toast.error(`Invalid file type. Accepted types: ${accept}`);
        return false;
      }
    }
    
    setFileError(null);
    return true;
  }, [accept, maxSize, maxSizeBytes]);
  
  // Handle file selection
  const handleFileChange = useCallback((selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  }, [onFileSelect, validateFile]);
  
  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };
  
  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };
  
  // Handle click on upload area
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle file removal
  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect(new File([], '')); // Send empty file to clear selection
  };
  
  return (
    <div className={`w-full ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-[#00b4d8] bg-[#00b4d8]/10' 
            : fileError 
              ? 'border-red-500/50 bg-red-500/5' 
              : 'border-[#0077b6]/30 hover:border-[#00b4d8]/50 hover:bg-[#00b4d8]/5'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        aria-disabled={disabled}
      >
        <input
          type="file"
          id={id}
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
        />
        
        {file ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#0077b6]/20 mb-3">
              <FileIcon className="h-6 w-6 text-[#00b4d8]" />
            </div>
            <p className="text-[#ade8f4] font-medium mb-1">{file.name}</p>
            <p className="text-[#90e0ef] text-sm">{formatFileSize(file.size)}</p>
            
            {!disabled && (
              <button
                type="button"
                className="mt-3 flex items-center text-[#00b4d8] hover:text-[#ade8f4] text-sm"
                onClick={handleRemoveFile}
              >
                <XIcon className="h-4 w-4 mr-1" />
                Remove file
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#0077b6]/20 mb-3">
              <UploadIcon className="h-6 w-6 text-[#00b4d8]" />
            </div>
            <p className="text-[#ade8f4] font-medium mb-1">{label}</p>
            <p className="text-[#90e0ef] text-sm text-center">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-[#90e0ef]/70 text-xs mt-2">
              Maximum file size: {maxSize}MB
              {accept !== '*/*' && ` • Accepted formats: ${accept}`}
            </p>
          </>
        )}
        
        {fileError && (
          <p className="absolute bottom-2 text-red-400 text-xs mt-2">
            {fileError}
          </p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
