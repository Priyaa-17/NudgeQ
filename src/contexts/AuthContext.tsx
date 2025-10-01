import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
  coins: number;
  gems: number;
  isPremium: boolean;
  profile?: {
    interests: string[];
    bio?: string;
    locationEnabled: boolean;
    discoveryEnabled: boolean;
    discoveryRadius: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setToken(session.access_token);
      }
      fetchUser();
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setToken(session.access_token);
          await fetchUser();
        } else {
          setToken(null);
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        setToken(null);
        return;
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        setToken(null);
        return;
      }

      const userData = {
        id: user.id,
        email: user.email!,
        username: profile.username,
        avatar: profile.avatar,
        xp: profile.xp,
        level: profile.level,
        streak: profile.streak,
        coins: profile.coins,
        gems: profile.gems,
        isPremium: profile.isPremium,
        profile: profile.profile
      };

      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        // Fetch user profile from your users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
        }

        const userData = {
          id: data.user.id,
          email: data.user.email!,
          username: profile?.username || data.user.email!.split('@')[0],
          avatar: profile?.avatar,
          xp: profile?.xp || 0,
          level: profile?.level || 1,
          streak: profile?.streak || 0,
          coins: profile?.coins || 100,
          gems: profile?.gems || 0,
          isPremium: profile?.isPremium || false,
          profile: profile?.profile || {
            interests: [],
            locationEnabled: false,
            discoveryEnabled: true,
            discoveryRadius: 50
          }
        };

        setUser(userData);
        setToken(data.session?.access_token || null);
        toast.success('Welcome back!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login network error:', error);
      toast.error('Network error. Please try again.');
      return false;
    }
  };

  const register = async (email: string, password: string, username: string): Promise<boolean> => {
    try {
      // First, sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        // Create user profile in your users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            username,
            xp: 0,
            level: 1,
            streak: 0,
            coins: 100,
            gems: 0,
            isPremium: false,
            profile: {
              interests: [],
              locationEnabled: false,
              discoveryEnabled: true,
              discoveryRadius: 50
            }
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error('Failed to create user profile');
          return false;
        }

        const userData = {
          id: data.user.id,
          email: data.user.email!,
          username,
          xp: 0,
          level: 1,
          streak: 0,
          coins: 100,
          gems: 0,
          isPremium: false,
          profile: {
            interests: [],
            locationEnabled: false,
            discoveryEnabled: true,
            discoveryRadius: 50
          }
        };

        setUser(userData);
        setToken(data.session?.access_token || null);
        toast.success('Account created successfully!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration network error:', error);
      toast.error('Network error. Please try again.');
      return false;
    }
  };

  const logout = () => {
    supabase.auth.signOut();
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}