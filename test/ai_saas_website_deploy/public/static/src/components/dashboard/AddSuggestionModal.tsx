import React from 'react';
import { toast } from 'sonner';

interface AddSuggestionModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const AddSuggestionModal: React.FC<AddSuggestionModalProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;
  
  const handlePublish = () => {
    toast.success('Update added successfully!');
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0c2e44] border border-[#0077b6]/30 rounded-xl p-4 sm:p-6 max-w-md w-full">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Add New Update</h3>
        <p className="text-[#ade8f4] text-sm sm:text-base mb-4">
          Share a new platform update, announcement, or feature release with users.  
        </p>
        <div className="space-y-3 mb-4">
          {/* Add form fields here - this is just a mockup */}
          <div>
            <label className="block text-[#90e0ef] text-sm mb-1">Title</label>
            <input className="w-full bg-[#051e2f] border border-[#0077b6]/30 rounded-lg px-3 py-2 text-[#ade8f4] focus:outline-none focus:border-[#00b4d8]" placeholder="Update title" />
          </div>
          <div>
            <label className="block text-[#90e0ef] text-sm mb-1">Type</label>
            <select className="w-full bg-[#051e2f] border border-[#0077b6]/30 rounded-lg px-3 py-2 text-[#ade8f4] focus:outline-none focus:border-[#00b4d8]">
              <option>Update</option>
              <option>Announcement</option>
              <option>Release</option>
            </select>
          </div>
          <div>
            <label className="block text-[#90e0ef] text-sm mb-1">Description</label>
            <textarea className="w-full bg-[#051e2f] border border-[#0077b6]/30 rounded-lg px-3 py-2 text-[#ade8f4] focus:outline-none focus:border-[#00b4d8]" rows={3} placeholder="Describe the update"></textarea>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 rounded text-sm sm:text-base bg-[#051e2f] text-[#ade8f4] hover:bg-[#0a3a5a] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            className="px-3 sm:px-4 py-2 rounded text-sm sm:text-base bg-[#0077b6] text-white hover:bg-[#00b4d8] transition-colors"
          >
            Publish Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSuggestionModal;
