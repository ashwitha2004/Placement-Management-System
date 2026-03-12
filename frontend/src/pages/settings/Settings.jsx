import React, { useState } from 'react';
import ImageCropUpload from '../../components/common/ImageCropUpload';
import { useAuth } from '../../contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user);

  return (
    <div className="max-w-2xl">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>
      <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-2xl">
        <ImageCropUpload 
          currentImage={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
          onImageUpdate={(newAvatar) => setProfile({ ...profile, avatar: newAvatar })}
          userName={user?.name || 'User'}
        />
        {/* Form fields for name, email, password change */}
        <div className="mt-12 space-y-6">
          <button className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
