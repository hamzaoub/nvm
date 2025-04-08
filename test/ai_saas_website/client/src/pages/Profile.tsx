import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock, FaCreditCard, FaCheck } from 'react-icons/fa';
import { RiWaterFlashFill } from 'react-icons/ri';
import { useAuth } from '@/hooks/useAuth';
import userService, { ProfileUpdateData, SubscriptionDetails } from '@/services/user';
import { toast } from 'sonner';
import LoadingIndicator from '@/components/LoadingIndicator';
import { OceanSidebar } from '@/components/OceanSidebar';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'security'>('profile');
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  
  const [profile, setProfile] = useState<ProfileUpdateData>({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
  });

  const [credentials, setCredentials] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch user profile and subscription data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const profileData = await userService.getProfile();
        setProfile({
          name: profileData.name || '',
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          email: profileData.email || '',
        });
        
        // Fetch subscription details
        const subscriptionData = await userService.getSubscription();
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setProfile((prev) => {
      const updatedProfile = { ...prev, [name]: value };
      
      // Automatically update full name when first or last name changes
      if (name === 'firstName' || name === 'lastName') {
        const firstName = name === 'firstName' ? value : prev.firstName;
        const lastName = name === 'lastName' ? value : prev.lastName;
        updatedProfile.name = `${firstName} ${lastName}`.trim();
      }
      
      return updatedProfile;
    });
  };

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updatedProfile = await userService.updateProfile(profile);
      
      // Update the user in auth context
      if (updatedProfile && setUser) {
        setUser({
          ...user!,
          name: updatedProfile.name,
          email: updatedProfile.email,
        });
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (credentials.newPassword !== credentials.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      setIsChangingPassword(true);
      await userService.changePassword(
        credentials.currentPassword,
        credentials.newPassword,
        credentials.confirmPassword
      );
      
      toast.success('Password changed successfully');
      setCredentials({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <OceanSidebar />
        <div className="flex-1 flex items-center justify-center p-6">
          <LoadingIndicator />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#051e2f]">
      <OceanSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-4 max-w-5xl">
          {/* Header with oceanic design */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">User Profile</h1>
            <p className="text-[#90e0ef]">Manage your account and subscription details</p>
          </motion.div>
          
          {/* Tabs for different sections */}
          <div className="flex mb-8 bg-[#0a3a5a]/30 rounded-lg p-1 backdrop-blur-sm border border-[#0077b6]/20">
            <button
              className={`flex items-center px-4 py-3 rounded-md transition-all duration-300 ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white shadow-lg'
                  : 'text-[#ade8f4] hover:bg-[#0c4c74]/50'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUser className="mr-2" /> Profile
            </button>
            <button
              className={`flex items-center px-4 py-3 rounded-md transition-all duration-300 ${
                activeTab === 'subscription'
                  ? 'bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white shadow-lg'
                  : 'text-[#ade8f4] hover:bg-[#0c4c74]/50'
              }`}
              onClick={() => setActiveTab('subscription')}
            >
              <FaCreditCard className="mr-2" /> Subscription
            </button>
            <button
              className={`flex items-center px-4 py-3 rounded-md transition-all duration-300 ${
                activeTab === 'security'
                  ? 'bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white shadow-lg'
                  : 'text-[#ade8f4] hover:bg-[#0c4c74]/50'
              }`}
              onClick={() => setActiveTab('security')}
            >
              <FaLock className="mr-2" /> Security
            </button>
          </div>
          
          {/* Content area with glass effect */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-[#051e2f]/60 backdrop-blur-xl rounded-xl border border-[#0077b6]/30 shadow-xl shadow-[#00b4d8]/5 overflow-hidden"
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-xl text-white font-semibold mb-6">Personal Information</h2>
                
                <form onSubmit={handleSaveProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[#90e0ef] text-sm font-medium">Full Name</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#00b4d8]">
                          <FaUser />
                        </span>
                        <input
                          type="text"
                          name="name"
                          value={profile.name}
                          readOnly
                          className="w-full pl-10 pr-4 py-3 bg-[#0a3a5a]/50 border border-[#0077b6]/30 rounded-lg text-white/90 cursor-not-allowed"
                          placeholder="Auto-generated from first and last name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-[#90e0ef] text-sm font-medium">Email Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#00b4d8]">
                          <FaEnvelope />
                        </span>
                        <input
                          type="email"
                          name="email"
                          value={profile.email}
                          disabled
                          className="w-full pl-10 pr-4 py-3 bg-[#0a3a5a]/50 border border-[#0077b6]/30 rounded-lg text-white/80 cursor-not-allowed opacity-80"
                          placeholder="Your email address"
                        />
                        <div className="mt-1 text-xs text-[#ade8f4]/80">Email address cannot be changed</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-[#90e0ef] text-sm font-medium">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={profile.firstName || ''}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 bg-[#0a3a5a]/30 border border-[#0077b6]/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition-all duration-300"
                        placeholder="Your first name"
                      />
                      <div className="mt-1 text-xs text-[#ade8f4]/80">Updates the Full Name field automatically</div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-[#90e0ef] text-sm font-medium">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={profile.lastName || ''}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 bg-[#0a3a5a]/30 border border-[#0077b6]/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition-all duration-300"
                        placeholder="Your last name"
                      />
                      <div className="mt-1 text-xs text-[#ade8f4]/80">Updates the Full Name field automatically</div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-3 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white rounded-lg font-medium shadow-lg shadow-[#00b4d8]/20 hover:shadow-xl hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="p-6">
                <h2 className="text-xl text-white font-semibold mb-6">Subscription Details</h2>
                
                {subscription ? (
                  <div className="space-y-8">
                    {/* Current Plan */}
                    <div className="bg-gradient-to-r from-[#0a3a5a] to-[#0c4c74] p-6 rounded-xl border border-[#0077b6]/40 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          <RiWaterFlashFill className="text-[#00b4d8] mr-2 text-xl" />
                          {subscription.planName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          subscription.isActive 
                            ? 'bg-[#00b4d8]/20 text-[#ade8f4]' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {subscription.status}
                        </span>
                      </div>
                      
                      <p className="text-[#90e0ef] mb-4">{subscription.planDescription}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                        <div>
                          <span className="block text-[#ade8f4] text-sm">Price:</span>
                          <span className="font-semibold">${subscription.pricePerMonth}/month</span>
                        </div>
                        <div>
                          <span className="block text-[#ade8f4] text-sm">Credits:</span>
                          <span className="font-semibold">{subscription.credits}</span>
                        </div>
                        <div>
                          <span className="block text-[#ade8f4] text-sm">Start Date:</span>
                          <span className="font-semibold">{formatDate(subscription.startDate)}</span>
                        </div>
                        <div>
                          <span className="block text-[#ade8f4] text-sm">
                            {subscription.endDate ? 'End Date:' : 'Renewal In:'}
                          </span>
                          <span className="font-semibold">
                            {subscription.endDate 
                              ? formatDate(subscription.endDate) 
                              : `${subscription.daysUntilRenewal} days`}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Features List */}
                    <div>
                      <h3 className="text-lg text-white font-semibold mb-4">Plan Features</h3>
                      
                      <ul className="space-y-3">
                        {subscription.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2 mt-1 text-[#00b4d8]">
                              <FaCheck />
                            </span>
                            <span className="text-[#ade8f4]">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Upgrade Button */}
                    <div className="flex justify-center mt-8">
                      <button className="px-6 py-3 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white rounded-lg font-medium shadow-lg shadow-[#00b4d8]/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
                        Upgrade Your Plan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-[#90e0ef]">You don't have an active subscription.</p>
                    <button className="mt-4 px-6 py-3 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white rounded-lg font-medium shadow hover:shadow-lg transition-all duration-300">
                      Get Ocean Premium
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-xl text-white font-semibold mb-6">Security Settings</h2>
                
                <form onSubmit={handleChangePassword}>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[#90e0ef] text-sm font-medium">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={credentials.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 bg-[#0a3a5a]/30 border border-[#0077b6]/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition-all duration-300"
                        placeholder="Enter your current password"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-[#90e0ef] text-sm font-medium">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={credentials.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 bg-[#0a3a5a]/30 border border-[#0077b6]/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition-all duration-300"
                        placeholder="Enter your new password"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-[#90e0ef] text-sm font-medium">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={credentials.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 bg-[#0a3a5a]/30 border border-[#0077b6]/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition-all duration-300"
                        placeholder="Confirm your new password"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-6 py-3 bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white rounded-lg font-medium shadow-lg shadow-[#00b4d8]/20 hover:shadow-xl hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {isChangingPassword ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
                
                {/* Additional security settings could go here */}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
