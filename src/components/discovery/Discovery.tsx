import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { 
  Heart, 
  X, 
  MapPin, 
  Star,
  Settings,
  Users,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PotentialMatch {
  id: string;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  bio?: string;
  interests: string[];
  badgeCount: number;
  distance: number;
}

export default function Discovery() {
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Update user location
            await fetch('http://localhost:3001/api/discovery/location', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                latitude,
                longitude
              })
            });

            setLocationEnabled(true);
            fetchPotentialMatches();
          },
          () => {
            setLoading(false);
            toast.error('Location access required for discovery');
          }
        );
      }
    } catch (error) {
      console.error('Location error:', error);
      setLoading(false);
    }
  };

  const fetchPotentialMatches = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/discovery/potential-matches', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const { users } = await response.json();
        setPotentialMatches(users);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      toast.error('Failed to load potential matches');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'LEFT' | 'RIGHT') => {
    if (currentIndex >= potentialMatches.length) return;

    const currentUser = potentialMatches[currentIndex];
    
    try {
      const response = await fetch('http://localhost:3001/api/discovery/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          targetUserId: currentUser.id,
          direction
        })
      });

      if (response.ok) {
        const { isMatch } = await response.json();
        
        if (isMatch && direction === 'RIGHT') {
          toast.success(`It's a match with ${currentUser.username}! 🎉`);
        }

        setCurrentIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Swipe error:', error);
      toast.error('Failed to process swipe');
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('LEFT'),
    onSwipedRight: () => handleSwipe('RIGHT'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4 pt-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (!locationEnabled) {
    return (
      <div className="max-w-md mx-auto p-4 pt-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <MapPin className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Location Required</h2>
          <p className="text-gray-300 mb-6">
            Enable location access to discover friends nearby
          </p>
          <button
            onClick={requestLocationPermission}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600"
          >
            Enable Location
          </button>
        </div>
      </div>
    );
  }

  const currentUser = potentialMatches[currentIndex];

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto p-4 pt-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No More Users</h2>
          <p className="text-gray-300 mb-6">
            Check back later for new potential friends!
          </p>
          <button
            onClick={fetchPotentialMatches}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Discover Friends</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
        >
          <Settings className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Card Stack */}
      <div className="relative h-[600px] mb-8">
        <AnimatePresence>
          <motion.div
            key={currentUser.id}
            {...swipeHandlers}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden cursor-grab active:cursor-grabbing"
          >
            {/* Profile Image */}
            <div className="h-64 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.username}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
                />
              ) : (
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{currentUser.username}</h2>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">{currentUser.distance}km away</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">Level {currentUser.level}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-medium">{currentUser.badgeCount} badges</span>
                </div>
              </div>

              {currentUser.bio && (
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                  {currentUser.bio}
                </p>
              )}

              {/* Interests */}
              {currentUser.interests.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('LEFT')}
          className="w-16 h-16 bg-red-500/20 border-2 border-red-500/30 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-colors"
        >
          <X className="w-8 h-8 text-red-400" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('RIGHT')}
          className="w-16 h-16 bg-green-500/20 border-2 border-green-500/30 rounded-full flex items-center justify-center hover:bg-green-500/30 transition-colors"
        >
          <Heart className="w-8 h-8 text-green-400" />
        </motion.button>
      </div>
    </div>
  );
}