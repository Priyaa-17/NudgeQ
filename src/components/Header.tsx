import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Crown, Coins, Gem, Zap } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user?.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white font-semibold">{user?.username}</p>
                <div className="flex items-center space-x-1">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">Level {user?.level}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">{user?.xp}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">{user?.coins}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Gem className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">{user?.gems}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}