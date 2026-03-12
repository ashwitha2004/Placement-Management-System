import React, { useState } from 'react';
import ImageCropUpload from './ImageCropUpload';
import { X, Mail, Phone, Badge, Calendar, Briefcase } from 'lucide-react';

const ProfileModal = ({ user, isOpen, onClose, isDark = false, colors = null }) => {
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || '',
    designation: user?.designation || '',
  });

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        style={{
          backgroundColor: currentColors.card,
          borderColor: currentColors.border,
          color: currentColors.text,
        }}
        className="border w-full max-w-2xl rounded-[2.5rem] p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b" style={{ borderColor: currentColors.border }}>
          <h2 className="text-3xl font-bold">Profile Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="space-y-8">
          {/* Image Upload Section */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              📷 Profile Picture
            </h3>
            <ImageCropUpload
              currentImage={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'user'}`}
              userName={user?.name || 'User'}
              onImageUpdate={(newAvatar) => {
                if (user) {
                  user.avatar = newAvatar;
                }
                setProfileData({ ...profileData, avatar: newAvatar });
              }}
            />
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              👤 Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label
                  style={{ color: currentColors.textSecondary }}
                  className="block text-sm font-bold uppercase tracking-widest mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  style={{
                    backgroundColor: currentColors.bgSecondary,
                    borderColor: currentColors.border,
                    color: currentColors.text,
                  }}
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  style={{ color: currentColors.textSecondary }}
                  className="block text-sm font-bold uppercase tracking-widest mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  style={{
                    backgroundColor: currentColors.bgSecondary,
                    borderColor: currentColors.border,
                    color: currentColors.text,
                  }}
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  style={{ color: currentColors.textSecondary }}
                  className="block text-sm font-bold uppercase tracking-widest mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  style={{
                    backgroundColor: currentColors.bgSecondary,
                    borderColor: currentColors.border,
                    color: currentColors.text,
                  }}
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 ring-indigo-500 outline-none"
                />
              </div>

              {/* Role */}
              <div>
                <label
                  style={{ color: currentColors.textSecondary }}
                  className="block text-sm font-bold uppercase tracking-widest mb-2"
                >
                  Role
                </label>
                <div
                  style={{
                    backgroundColor: currentColors.bgSecondary,
                    borderColor: currentColors.border,
                    color: currentColors.text,
                  }}
                  className="w-full border rounded-xl px-4 py-3 flex items-center gap-2 capitalize"
                >
                  <Badge className="w-4 h-4" />
                  {profileData.role || 'Not specified'}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div
            style={{ backgroundColor: currentColors.hover, borderColor: currentColors.border }}
            className="border rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-lg font-bold flex items-center gap-2">
              📧 Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-indigo-500" />
                <div>
                  <p
                    style={{ color: currentColors.textSecondary }}
                    className="text-xs uppercase font-bold"
                  >
                    Email
                  </p>
                  <p style={{ color: currentColors.text }} className="font-semibold">
                    {user?.email || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-500" />
                <div>
                  <p
                    style={{ color: currentColors.textSecondary }}
                    className="text-xs uppercase font-bold"
                  >
                    Phone
                  </p>
                  <p style={{ color: currentColors.text }} className="font-semibold">
                    {user?.phone || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t" style={{ borderColor: currentColors.border }}>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl font-bold transition-all"
              style={{
                backgroundColor: currentColors.hover,
                color: currentColors.text,
              }}
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-lg transition-all"
            >
              ✓ Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
