import React, { useState } from 'react';
import ImageCropUpload from './ImageCropUpload';
import { Mail, Phone, Calendar, Badge, LogOut } from 'lucide-react';

const ProfileSection = ({ user, onLogout, isDark = false, colors = null }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const defaultColors = {
    bg: isDark ? '#020617' : '#ffffff',
    bgSecondary: isDark ? '#0f172a' : '#f8f9fa',
    text: isDark ? '#ffffff' : '#1a1a1a',
    textSecondary: isDark ? '#cbd5e1' : '#666666',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
    card: isDark ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
    hover: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f0f0f0',
  };

  const currentColors = colors || defaultColors;

  const getRoleColor = (role) => {
    const roles = {
      student: 'from-blue-500 to-cyan-500',
      staff: 'from-purple-500 to-pink-500',
      hr: 'from-orange-500 to-red-500',
      admin: 'from-green-500 to-emerald-500'
    };
    return roles[role?.toLowerCase()] || 'from-indigo-500 to-blue-600';
  };

  return (
    <div style={{ backgroundColor: currentColors.card, borderColor: currentColors.border }} className="border rounded-3xl p-8 sticky top-6">
      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <ImageCropUpload
            currentImage={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'user'}`}
            userName={user?.name || 'User'}
            onImageUpdate={(newAvatar) => {
              if (user) {
                user.avatar = newAvatar;
              }
            }}
          />
        </div>

        {/* Profile Info */}
        <div style={{ color: currentColors.text }} className="text-center">
          <h3 className="text-2xl font-bold mb-1">{user?.name || 'User'}</h3>
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRoleColor(user?.role)} mb-3`}>
            {user?.role?.toUpperCase() || 'GUEST'}
          </div>
          <p style={{ color: currentColors.textSecondary }} className="text-sm">{user?.email}</p>
        </div>

        {/* Quick Info */}
        <div className="space-y-3 pt-4 border-t" style={{ borderColor: currentColors.border }}>
          {user?.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4" style={{ color: currentColors.textSecondary }} />
              <span style={{ color: currentColors.textSecondary }} className="text-sm">{user.phone}</span>
            </div>
          )}
          {user?.email && (
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4" style={{ color: currentColors.textSecondary }} />
              <span style={{ color: currentColors.textSecondary }} className="text-sm">{user.email}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Badge className="w-4 h-4" style={{ color: currentColors.textSecondary }} />
            <span style={{ color: currentColors.textSecondary }} className="text-sm capitalize">{user?.role || 'User'}</span>
          </div>
        </div>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full py-3 px-4 mt-6 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
