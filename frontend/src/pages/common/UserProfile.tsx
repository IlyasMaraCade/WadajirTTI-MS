import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/services/api';
import { User, Lock, Mail, Phone, Image, CheckCircle, AlertCircle, Shield, KeyRound } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, setAuth, accessToken } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState((user as any)?.email || '');
  const [phone, setPhone] = useState((user as any)?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState((user as any)?.avatarUrl || '');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);


  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limit to 2MB to be safe
        setProfileError('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setIsSavingProfile(true);

    try {
      const res = await apiClient.put('/auth/profile', {
        firstName,
        lastName,
        email,
        phone,
        avatarUrl,
      });

      if (res.data?.data) {
        const updatedUser = res.data.data;
        if (accessToken) {
          setAuth(updatedUser, accessToken);
        }
        setProfileSuccess('Profile details updated successfully!');
      }
    } catch (err: any) {
      setProfileError(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsSavingPassword(true);
    try {
      await apiClient.patch('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Account Profile & Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Manage your personal details, profile picture, and login credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Overview */}
        <div className="modern-card p-6 flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-3xl shadow-md ring-4 ring-indigo-500/20">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            
            {/* Hidden File Input */}
            <input 
              type="file" 
              accept="image/*"
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
            
            {/* Upload Button overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-slate-900/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              title="Upload new photo"
            >
              <Image className="w-6 h-6 text-white" />
            </button>
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider hover:underline"
          >
            Change Photo
          </button>

          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">@{user?.username}</p>
            <span className="inline-flex items-center gap-1 mt-2.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              <Shield className="w-3 h-3" /> {user?.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Right Column: Edit Profile & Password */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info Form */}
          <div className="modern-card p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Personal Information
            </h3>

            {profileSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@wadajir.edu.so"
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+252 61..."
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm text-xs disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="modern-card p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              Change Login Password
            </h3>

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password (Optional if newly assigned)
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm text-xs disabled:opacity-50"
                >
                  {isSavingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
