import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { User, Settings, LogOut, Crown, Zap, Award, Flame, MapPin, CreditCard as Edit3, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const INTEREST_OPTIONS = [
  'Productivity', 'Fitness', 'Health', 'Learning', 'Career', 'Finance',
  'Creativity', 'Travel', 'Cooking', 'Reading', 'Music', 'Art',
  'Technology', 'Sports', 'Gaming', 'Social', 'Wellness', 'Nature'
];

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    interests: user?.profile?.interests || [],
    bio: user?.profile?.bio || '',
    discoveryEnabled: user?.profile?.discoveryEnabled || true,
    discoveryRadius: user?.profile?.discoveryRadius || 50
  });

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        updateUser({
          profile: {
            ...user?.profile,
            ...editData
          }
        });
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const toggleInterest = (interest: string) => {
    setEditData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 pt-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="relative inline-block mb-4">
          <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-4xl">
                {user.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {user.isPremium && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-yellow-900" />
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">{user.username}</h1>
        <p className="text-gray-300 mb-4">{user.email}</p>

        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <Edit3 className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
          <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-yellow-400 font-semibold text-sm">Level</p>
          <p className="text-white text-2xl font-bold">{user.level}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
          <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-purple-400 font-semibold text-sm">XP</p>
          <p className="text-white text-2xl font-bold">{user.xp}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
          <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
          <p className="text-orange-400 font-semibold text-sm">Streak</p>
          <p className="text-white text-2xl font-bold">{user.streak}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
          <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-green-400 font-semibold text-sm">Coins</p>
          <p className="text-white text-2xl font-bold">{user.coins}</p>
        </div>
      </motion.div>

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Profile Information
        </h2>

        {/* Bio */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
          {isEditing ? (
            <textarea
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              placeholder="Tell others about yourself..."
            />
          ) : (
            <p className="text-gray-300">
              {user.profile?.bio || 'No bio added yet'}
            </p>
          )}
        </div>

        {/* Interests */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Interests</label>
          {isEditing ? (
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    editData.interests.includes(interest)
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(user.profile?.interests || []).map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
              {(!user.profile?.interests || user.profile.interests.length === 0) && (
                <p className="text-gray-400 text-sm">No interests added yet</p>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Discovery Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Discovery Settings
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Enable Discovery</h3>
              <p className="text-gray-400 text-sm">Allow others to find you nearby</p>
            </div>
            {isEditing ? (
              <button
                onClick={() => setEditData({ ...editData, discoveryEnabled: !editData.discoveryEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editData.discoveryEnabled ? 'bg-purple-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    editData.discoveryEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            ) : (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.profile?.discoveryEnabled
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {user.profile?.discoveryEnabled ? 'Enabled' : 'Disabled'}
              </span>
            )}
          </div>

          {(isEditing ? editData.discoveryEnabled : user.profile?.discoveryEnabled) && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Discovery Radius: {isEditing ? editData.discoveryRadius : user.profile?.discoveryRadius}km
              </label>
              {isEditing ? (
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={editData.discoveryRadius}
                  onChange={(e) => setEditData({ ...editData, discoveryRadius: parseInt(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              ) : (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${(user.profile?.discoveryRadius || 50)}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      {isEditing ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex space-x-4"
        >
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 bg-white/10 hover:bg-white/20 py-3 px-6 rounded-xl text-white font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <X className="w-5 h-5" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleSaveProfile}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 py-3 px-6 rounded-xl text-white font-semibold transition-all flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex space-x-4"
        >
          <button className="flex-1 bg-white/10 hover:bg-white/20 py-3 px-6 rounded-xl text-white font-semibold transition-colors flex items-center justify-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button
            onClick={logout}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 py-3 px-6 rounded-xl text-red-400 font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}