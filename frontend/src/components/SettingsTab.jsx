import React, { useState, useEffect } from 'react';
import { User, Shield, ArrowRight, Save, X, AlertTriangle, Key } from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';

const SettingsTab = () => {
  const { user, loading, updateProfile, updatePassword, deleteAccount } = useUserStore();
  const [isVisible, setIsVisible] = useState(false);
  
  // Profile Forms
  const [displayName, setDisplayName] = useState(user?.username || "");
  const [emailAddress, setEmailAddress] = useState(user?.email || "");
  
  // Auth states for different actions
  const [showProfileAuth, setShowProfileAuth] = useState(false);
  const [profilePassword, setProfilePassword] = useState('');
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmNewPassword: ''
  });
  
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deleteAuthPassword, setDeleteAuthPassword] = useState('');

  useEffect(() => {
    setIsVisible(true);
    if (user) {
      setDisplayName(user.username);
      setEmailAddress(user.email);
    }
  }, [user]);

  // Handlers
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const success = await updateProfile(displayName, emailAddress, profilePassword);
    if (success) {
      setShowProfileAuth(false);
      setProfilePassword('');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const success = await updatePassword(passwords);
    if (success) {
      setShowPasswordForm(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    }
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    deleteAccount(deleteAuthPassword);
  };

  if (!user) return null;

  const isProfileChanged = displayName !== user.username || emailAddress !== user.email;

  return (
    <div className={`max-w-4xl mx-auto pb-12 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-300">Manage your account preferences</p>
      </header>

      {/* Profile Section */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <User className="text-blue-400" /> Profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setShowProfileAuth(false); // Reset auth view if they keep typing
              }}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Email Address</label>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => {
                setEmailAddress(e.target.value);
                setShowProfileAuth(false); 
              }}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Dynamic Save/Auth Area for Profile */}
        <div className="mt-8 flex flex-col items-end border-t border-white/10 pt-6">
          {!showProfileAuth ? (
            <button 
              onClick={() => setShowProfileAuth(true)}
              disabled={!isProfileChanged}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} /> Save Profile Changes
            </button>
          ) : (
            <form onSubmit={handleSaveProfile} className="w-full md:w-96 bg-black/30 p-4 rounded-xl border border-blue-500/30 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm text-blue-300 flex items-center gap-2">
                  <Key size={14} /> Enter password to confirm
                </label>
                <button type="button" onClick={() => setShowProfileAuth(false)} className="text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Your password"
                  required
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-white focus:border-blue-500 focus:outline-none"
                />
                <button disabled={loading} type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50">
                  {loading ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Shield className="text-green-400" /> Security
        </h2>
        <div className="space-y-4">
          
          {/* Change Password Block */}
          {!showPasswordForm ? (
            <button 
              onClick={() => setShowPasswordForm(true)}
              className="flex items-center justify-between w-full p-4 bg-black/20 rounded-xl hover:bg-black/30 transition-all text-left"
            >
              <span className="text-white">Change Password</span>
            </button>
          ) : (
            <form onSubmit={handlePasswordChange} className="p-4 bg-black/30 rounded-xl border border-white/10 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-medium">Update Password</h3>
                <button type="button" onClick={() => setShowPasswordForm(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <input
                type="password"
                placeholder="Current Password"
                required
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="New Password"
                required
                value={passwords.newPassword}
                onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                required
                value={passwords.confirmNewPassword}
                onChange={(e) => setPasswords({...passwords, confirmNewPassword: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
              />
              <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-medium transition-all disabled:opacity-50">
                {loading ? 'Updating...' : 'Confirm Password Change'}
              </button>
            </form>
          )}

          {/* Delete Account Block */}
          {!showDeleteForm ? (
            <button 
              onClick={() => setShowDeleteForm(true)}
              className="flex items-center justify-between w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-left group"
            >
              <span className="text-red-300 group-hover:text-red-200">Delete Account</span>
              <ArrowRight size={16} className="text-red-300 group-hover:text-red-200" />
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-4">
               <div className="flex justify-between items-center mb-2">
                <h3 className="text-red-400 font-medium flex items-center gap-2"><AlertTriangle size={18}/> Danger Zone</h3>
                <button type="button" onClick={() => setShowDeleteForm(false)} className="text-red-400 hover:text-red-200">
                  <X size={20} />
                </button>
              </div>
              <p className="text-red-300/80 text-sm">This action cannot be undone. Please enter your password to confirm deletion.</p>
              <input
                type="password"
                placeholder="Account Password"
                required
                value={deleteAuthPassword}
                onChange={(e) => setDeleteAuthPassword(e.target.value)}
                className="w-full bg-black/40 border border-red-500/30 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none"
              />
               <button disabled={loading} type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white p-3 rounded-lg font-medium transition-all disabled:opacity-50">
                 {loading ? 'Deleting...' : 'Permanently Delete Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;