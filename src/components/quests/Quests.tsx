import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Trophy, 
  Clock, 
  Star,
  Play,
  CheckCircle,
  Zap,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  xpReward: number;
  coinReward: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  isActive: boolean;
  missions?: Array<{
    id: string;
    status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  }>;
}

interface UserQuest {
  id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  progress: number;
  startedAt: string;
  completedAt?: string;
  quest: Quest;
}

const difficultyColors = {
  EASY: 'from-green-500 to-teal-500',
  MEDIUM: 'from-yellow-500 to-orange-500',
  HARD: 'from-red-500 to-pink-500',
  EXPERT: 'from-purple-500 to-indigo-500'
};

const difficultyIcons = {
  EASY: '⭐',
  MEDIUM: '⭐⭐',
  HARD: '⭐⭐⭐',
  EXPERT: '⭐⭐⭐⭐'
};

export default function Quests() {
  const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);
  const [activeQuests, setActiveQuests] = useState<UserQuest[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuests();
    fetchActiveQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/quests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const { quests } = await response.json();
        setAvailableQuests(quests);
      }
    } catch (error) {
      console.error('Failed to fetch quests:', error);
      toast.error('Failed to load quests');
    }
  };

  const fetchActiveQuests = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/quests/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const { quests } = await response.json();
        setActiveQuests(quests);
      }
    } catch (error) {
      console.error('Failed to fetch active quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuest = async (questId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/quests/${questId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Quest started successfully!');
        fetchQuests();
        fetchActiveQuests();
      } else {
        const { error } = await response.json();
        toast.error(error || 'Failed to start quest');
      }
    } catch (error) {
      console.error('Failed to start quest:', error);
      toast.error('Failed to start quest');
    }
  };

  const completeQuest = async (questId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/quests/${questId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Quest completed! 🎉');
        fetchActiveQuests();
      } else {
        const { error } = await response.json();
        toast.error(error || 'Failed to complete quest');
      }
    } catch (error) {
      console.error('Failed to complete quest:', error);
      toast.error('Failed to complete quest');
    }
  };

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
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Quests</h1>
        <p className="text-gray-300">Embark on adventures and earn rewards</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/20"
      >
        {[
          { key: 'available', label: 'Available', icon: Target },
          { key: 'active', label: 'Active', icon: Clock },
          { key: 'completed', label: 'Completed', icon: Trophy }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === key
                ? 'bg-white/20 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </motion.div>

      {/* Available Quests */}
      {activeTab === 'available' && (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableQuests
              .filter(quest => !quest.missions?.some(m => m.status === 'ACTIVE'))
              .map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 bg-gradient-to-r ${difficultyColors[quest.difficulty]} rounded-lg`}>
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">
                        {quest.category}
                      </span>
                      <p className="text-sm text-gray-300">
                        {difficultyIcons[quest.difficulty]} {quest.difficulty}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{quest.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">{quest.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-semibold">+{quest.xpReward}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400 font-semibold">+{quest.coinReward}</span>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startQuest(quest.id)}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Quest</span>
                  </motion.button>
                </motion.div>
              ))}
          </div>
        </AnimatePresence>
      )}

      {/* Active Quests */}
      {activeTab === 'active' && (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeQuests.map((userQuest, index) => (
              <motion.div
                key={userQuest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 bg-gradient-to-r ${difficultyColors[userQuest.quest.difficulty]} rounded-lg`}>
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-green-400 uppercase tracking-wide font-semibold">
                      In Progress
                    </span>
                    <p className="text-sm text-gray-300">
                      {Math.round(userQuest.progress)}% Complete
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{userQuest.quest.title}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {userQuest.quest.description}
                </p>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-sm text-white font-semibold">
                      {Math.round(userQuest.progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${userQuest.progress}%` }}
                    />
                  </div>
                </div>

                {userQuest.progress >= 100 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => completeQuest(userQuest.quest.id)}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete Quest</span>
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Empty States */}
      {activeTab === 'available' && availableQuests.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Available Quests</h3>
          <p className="text-gray-400">Check back later for new adventures!</p>
        </motion.div>
      )}

      {activeTab === 'active' && activeQuests.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Active Quests</h3>
          <p className="text-gray-400">Start a quest to begin your adventure!</p>
        </motion.div>
      )}
    </div>
  );
}