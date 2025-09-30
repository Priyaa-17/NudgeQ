import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  Target, 
  CheckSquare, 
  Users, 
  TrendingUp, 
  Award,
  Flame,
  Clock
} from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  current: number;
  target: number;
  xpReward: number;
  isCompleted: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [activeMissions, setActiveMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Generate daily missions if needed
      await fetch('http://localhost:3001/api/missions/daily/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Fetch active missions
      const missionsResponse = await fetch('http://localhost:3001/api/missions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (missionsResponse.ok) {
        const { missions } = await missionsResponse.json();
        setActiveMissions(missions.filter((m: Mission) => !m.isCompleted).slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-300">
          Ready to conquer your goals today?
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <p className="text-purple-300 text-sm font-medium">XP</p>
              <p className="text-white text-xl font-bold">{user?.xp}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Award className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <p className="text-yellow-300 text-sm font-medium">Level</p>
              <p className="text-white text-xl font-bold">{user?.level}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Flame className="w-6 h-6 text-orange-300" />
            </div>
            <div>
              <p className="text-orange-300 text-sm font-medium">Streak</p>
              <p className="text-white text-xl font-bold">{user?.streak}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckSquare className="w-6 h-6 text-green-300" />
            </div>
            <div>
              <p className="text-green-300 text-sm font-medium">Completed</p>
              <p className="text-white text-xl font-bold">12</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Daily Missions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Today's Missions
          </h2>
        </div>

        <div className="space-y-3">
          {activeMissions.map((mission) => (
            <motion.div
              key={mission.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">{mission.title}</h3>
                <span className="text-purple-300 text-sm font-medium">
                  +{mission.xpReward} XP
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(mission.current / mission.target) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-gray-300 text-sm">
                  {mission.current}/{mission.target}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-md rounded-xl p-6 border border-white/20 cursor-pointer"
        >
          <Target className="w-8 h-8 text-purple-300 mb-3" />
          <h3 className="text-white font-semibold mb-1">Start Quest</h3>
          <p className="text-gray-300 text-sm">Begin a new adventure</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-br from-pink-500/20 to-red-500/20 backdrop-blur-md rounded-xl p-6 border border-white/20 cursor-pointer"
        >
          <Users className="w-8 h-8 text-pink-300 mb-3" />
          <h3 className="text-white font-semibold mb-1">Find Friends</h3>
          <p className="text-gray-300 text-sm">Connect with others</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-br from-green-500/20 to-teal-500/20 backdrop-blur-md rounded-xl p-6 border border-white/20 cursor-pointer"
        >
          <CheckSquare className="w-8 h-8 text-green-300 mb-3" />
          <h3 className="text-white font-semibold mb-1">Daily Goals</h3>
          <p className="text-gray-300 text-sm">Track your progress</p>
        </motion.div>
      </motion.div>
    </div>
  );
}