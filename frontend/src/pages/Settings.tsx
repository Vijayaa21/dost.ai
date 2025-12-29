import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Trash2, LogOut, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const toneOptions = [
  { value: 'calm', label: 'Calm', description: 'Gentle and soothing' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and conversational' },
  { value: 'minimal', label: 'Minimal', description: 'Brief and to-the-point' },
];

export default function Settings() {
  const { user, updateProfile, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    preferred_tone: user?.preferred_tone || 'friendly',
    reminder_enabled: user?.reminder_enabled || false,
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      await updateProfile(profileData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: "Passwords don't match." });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      await authService.changePassword(passwordData.old_password, passwordData.new_password);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to change password. Check your current password.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      await authService.deleteAccount();
      logout();
      navigate('/');
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete account.' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              'px-4 py-3 rounded-xl mb-6',
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            )}
          >
            {message.text}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'privacy', label: 'Privacy', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Conversation Tone</h2>
              <p className="text-gray-600 text-sm mb-4">
                Choose how you'd like Dost to communicate with you.
              </p>
              <div className="space-y-2">
                {toneOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setProfileData({ ...profileData, preferred_tone: option.value as typeof profileData.preferred_tone })}
                    className={clsx(
                      'w-full p-4 rounded-xl border-2 text-left transition-all',
                      profileData.preferred_tone === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <p className="font-medium text-gray-800">{option.label}</p>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleProfileUpdate}
              disabled={isLoading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
            </button>

            {/* Password Change */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    className="input-field"
                  />
                </div>
                <button
                  onClick={handlePasswordChange}
                  disabled={isLoading || !passwordData.old_password || !passwordData.new_password}
                  className="btn-outline w-full py-2"
                >
                  Change Password
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h2>
            
            <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 cursor-pointer">
              <div>
                <p className="font-medium text-gray-800">Daily Mood Reminders</p>
                <p className="text-sm text-gray-500">Get reminded to log your mood</p>
              </div>
              <input
                type="checkbox"
                checked={profileData.reminder_enabled}
                onChange={(e) => setProfileData({ ...profileData, reminder_enabled: e.target.checked })}
                className="w-5 h-5 rounded text-primary-500"
              />
            </label>

            <button
              onClick={handleProfileUpdate}
              disabled={isLoading}
              className="btn-primary w-full py-3 mt-4"
            >
              Save Preferences
            </button>
          </motion.div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Data & Privacy</h2>
              <p className="text-gray-600 mb-4">
                Your privacy matters to us. All your conversations and data are stored securely 
                and are never shared with third parties.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  End-to-end secure storage
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  No data selling to third parties
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  Delete your data anytime
                </li>
              </ul>
            </div>

            <div className="card border-red-100">
              <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
              
              <div className="space-y-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
                
                <button
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 rounded-xl text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Account
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
