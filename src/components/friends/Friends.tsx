import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Mail,
  Check,
  X,
  Crown,
  Zap,
  MessageCircle,
  Trophy
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Friend {
  id: string;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
}

interface FriendRequest {
  id: string;
  createdAt: string;
  requester: {
    id: string;
    username: string;
    avatar?: string;
    level: number;
  };
}

interface Match {
  id: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
    level: number;
  };
  createdAt: string;
}

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'matches'>('friends');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
    fetchMatches();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/friends', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const { friends } = await response.json();
        setFriends(friends);
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/friends/requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const { requests } = await response.json();
        setFriendRequests(requests);
      }
    } catch (error) {
      console.error('Failed to fetch friend requests:', error);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/discovery/matches', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const { matches } = await response.json();
        setMatches(matches);
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/friends/request/${requestId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Friend request accepted!');
        fetchFriends();
        fetchFriendRequests();
      } else {
        toast.error('Failed to accept friend request');
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      toast.error('Failed to accept friend request');
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    try {
      // Note: This would need to be implemented in the backend
      toast.success('Friend request declined');
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Failed to decline friend request:', error);
      toast.error('Failed to decline friend request');
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
        <h1 className="text-3xl font-bold text-white mb-2">Friends</h1>
        <p className="text-gray-300">Connect with your quest companions</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/20"
      >
        {[
          { key: 'friends', label: 'Friends', count: friends.length, icon: Users },
          { key: 'requests', label: 'Requests', count: friendRequests.length, icon: Mail },
          { key: 'matches', label: 'Matches', count: matches.length, icon: Trophy }
        ].map(({ key, label, count, icon: Icon }) => (
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
            {count > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px]">
                {count}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Friends List */}
      {activeTab === 'friends' && (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map((friend, index) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    {friend.avatar ? (
                      <img 
                        src={friend.avatar} 
                        alt={friend.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-xl">
                        {friend.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{friend.username}</h3>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400">Level {friend.level}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400">{friend.xp} XP</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-orange-400 text-sm">{friend.streak} day streak</span>
                    </div>
                  </div>

                  <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Friend Requests */}
      {activeTab === 'requests' && (
        <AnimatePresence>
          <div className="space-y-4">
            {friendRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      {request.requester.avatar ? (
                        <img 
                          src={request.requester.avatar} 
                          alt={request.requester.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {request.requester.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white">{request.requester.username}</h3>
                      <p className="text-gray-400 text-sm">Level {request.requester.level}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => acceptFriendRequest(request.id)}
                      className="bg-green-500/20 hover:bg-green-500/30 p-2 rounded-lg transition-colors"
                    >
                      <Check className="w-5 h-5 text-green-400" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => declineFriendRequest(request.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 p-2 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-red-400" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Matches */}
      {activeTab === 'matches' && (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-md rounded-xl p-6 border border-pink-500/30"
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🎉</div>
                  <h3 className="text-lg font-bold text-white">It's a Match!</h3>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    {match.user.avatar ? (
                      <img 
                        src={match.user.avatar} 
                        alt={match.user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-xl">
                        {match.user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white">{match.user.username}</h4>
                    <p className="text-gray-300 text-sm">Level {match.user.level}</p>
                    <p className="text-gray-500 text-xs">
                      Matched {new Date(match.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <button className="flex-1 bg-white/10 hover:bg-white/20 py-2 px-4 rounded-lg text-white font-medium transition-colors">
                    Start Race
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 py-2 px-4 rounded-lg text-white font-medium transition-all">
                    Send Message
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Empty States */}
      {activeTab === 'friends' && friends.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Friends Yet</h3>
          <p className="text-gray-400 mb-6">Discover new friends through the swipe feature!</p>
          <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600">
            Find Friends
          </button>
        </motion.div>
      )}

      {activeTab === 'requests' && friendRequests.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Friend Requests</h3>
          <p className="text-gray-400">You'll see new friend requests here</p>
        </motion.div>
      )}

      {activeTab === 'matches' && matches.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Matches Yet</h3>
          <p className="text-gray-400">Start swiping to find your perfect quest partners!</p>
        </motion.div>
      )}
    </div>
  );
}