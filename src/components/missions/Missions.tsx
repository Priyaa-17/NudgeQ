import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  CheckSquare,
  Clock,
  Target,
  Calendar,
  Zap,
  Award,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Mission {
  id: string;
  title: string;
  description?: string;
  type: 'DAILY' | 'WEEKLY' | 'CUSTOM' | 'SOCIAL';
  target: number;
  current: number;
  xpReward: number;
  coinReward: number;
  isCompleted: boolean;
  dueDate?: string;
  createdAt: string;
}

const missionTypes = {
  DAILY: { color: 'from-blue-500 to-cyan-500', icon: '☀️' },
  WEEKLY: { color: 'from-green-500 to-teal-500', icon: '📅' },
  CUSTOM: { color: 'from-purple-500 to-pink-500', icon: '🎯' },
  SOCIAL: { color: 'from-orange-500 to-red-500', icon: '👥' }
};

export default function Missions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    type: 'CUSTOM' as const,
    target: 1,
    xpReward: 10,
    coinReward: 5
  });

  useEffect(() => {
    fetchMissions();
    generateDailyMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/missions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const { missions } = await response.json();
        setMissions(missions);
      }
    } catch (error) {
      console.error('Failed to fetch missions:', error);
      toast.error('Failed to load missions');
    } finally {
      setLoading(false);
    }
  };

  const generateDailyMissions = async () => {
    try {
      await fetch('http://localhost:3001/api/missions/daily/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Failed to generate daily missions:', error);
    }
  };

  const createMission = async () => {
    if (!newMission.title.trim()) {
      toast.error('Mission title is required');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newMission)
      });

      if (response.ok) {
        toast.success('Mission created successfully!');
        setShowCreateForm(false);
        setNewMission({
          title: '',
          description: '',
          type: 'CUSTOM',
          target: 1,
          xpReward: 10,
          coinReward: 5
        });
        fetchMissions();
      } else {
        toast.error('Failed to create mission');
      }
    } catch (error) {
      console.error('Failed to create mission:', error);
      toast.error('Failed to create mission');
    }
  };

  const updateProgress = async (missionId: string, increment: number = 1) => {
    try {
      const response = await fetch(`http://localhost:3001/api/missions/${missionId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ increment })
      });

      if (response.ok) {
        const { isCompleted } = await response.json();
        if (isCompleted) {
          toast.success('Mission completed! 🎉');
        }
        fetchMissions();
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const activeMissions = missions.filter(m => !m.isCompleted);
  const completedMissions = missions.filter(m => m.isCompleted);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pt-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Missions</h1>
          <p className="text-gray-300">Complete daily tasks and custom goals</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-3 rounded-xl hover:from-purple-600 hover:to-blue-600"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/20"
      >
        {[
          { key: 'active', label: 'Active', count: activeMissions.length },
          { key: 'completed', label: 'Completed', count: completedMissions.length }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === key
                ? 'bg-white/20 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{label}</span>
            <span className="bg-white/20 text-xs px-2 py-1 rounded-full">{count}</span>
          </button>
        ))}
      </motion.div>

      {/* Mission List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-4"
        >
          {(activeTab === 'active' ? activeMissions : completedMissions).map((mission, index) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 ${
                mission.isCompleted ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 bg-gradient-to-r ${missionTypes[mission.type].color} rounded-lg flex-shrink-0`}>
                  <span className="text-2xl">{missionTypes[mission.type].icon}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{mission.title}</h3>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-semibold">+{mission.xpReward}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 font-semibold">+{mission.coinReward}</span>
                      </div>
                    </div>
                  </div>

                  {mission.description && (
                    <p className="text-gray-300 text-sm mb-3">{mission.description}</p>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400 uppercase tracking-wide">
                      {mission.type} MISSION
                    </span>
                    {mission.dueDate && (
                      <div className="flex items-center space-x-1 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Due {new Date(mission.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Progress</span>
                        <span className="text-sm text-white font-semibold">
                          {mission.current}/{mission.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${missionTypes[mission.type].color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min((mission.current / mission.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {!mission.isCompleted && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateProgress(mission.id)}
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                      >
                        <Plus className="w-5 h-5 text-white" />
                      </motion.button>
                    )}

                    {mission.isCompleted && (
                      <div className="bg-green-500/20 p-2 rounded-lg">
                        <CheckSquare className="w-5 h-5 text-green-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Create Mission Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Create Mission</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newMission.title}
                    onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Mission title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newMission.description}
                    onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={3}
                    placeholder="Mission description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newMission.target}
                      onChange={(e) => setNewMission({ ...newMission, target: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={newMission.type}
                      onChange={(e) => setNewMission({ ...newMission, type: e.target.value as any })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="CUSTOM">Custom</option>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="SOCIAL">Social</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createMission}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty States */}
      {activeTab === 'active' && activeMissions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Active Missions</h3>
          <p className="text-gray-400">Create your first mission to get started!</p>
        </motion.div>
      )}

      {activeTab === 'completed' && completedMissions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Completed Missions</h3>
          <p className="text-gray-400">Complete some missions to see them here!</p>
        </motion.div>
      )}
    </div>
  );
}