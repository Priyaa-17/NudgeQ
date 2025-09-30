import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Target, 
  CheckSquare, 
  Users, 
  Heart,
  User,
  ShoppingBag
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/quests', icon: Target, label: 'Quests' },
  { to: '/missions', icon: CheckSquare, label: 'Missions' },
  { to: '/discovery', icon: Heart, label: 'Discover' },
  { to: '/friends', icon: Users, label: 'Friends' },
  { to: '/shop', icon: ShoppingBag, label: 'Shop' },
  { to: '/profile', icon: User, label: 'Profile' }
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-white bg-white/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}