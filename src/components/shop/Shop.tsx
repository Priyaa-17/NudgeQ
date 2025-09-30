import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { 
  ShoppingBag, 
  Crown,
  Zap,
  Shield,
  Star,
  Gift,
  Coins,
  Gem,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

interface PowerUp {
  name: string;
  description: string;
  icon: string;
  coinCost: number;
  gemCost: number;
  effect: string;
}

const POWER_UPS: PowerUp[] = [
  {
    name: 'XP Booster',
    description: 'Double XP gain for 1 hour',
    icon: '⚡',
    coinCost: 50,
    gemCost: 0,
    effect: '2x XP for 60 minutes'
  },
  {
    name: 'Streak Shield',
    description: 'Protect your streak for 3 days',
    icon: '🛡️',
    coinCost: 100,
    gemCost: 0,
    effect: 'Prevents streak loss'
  },
  {
    name: 'Mission Rush',
    description: 'Complete any mission instantly',
    icon: '🚀',
    coinCost: 0,
    gemCost: 5,
    effect: 'Instant mission completion'
  },
  {
    name: 'Lucky Coin',
    description: 'Double coin rewards for 24 hours',
    icon: '🍀',
    coinCost: 75,
    gemCost: 0,
    effect: '2x coins for 24 hours'
  }
];

const COIN_PACKAGES = [
  { amount: 100, price: 0.99, bonus: 0 },
  { amount: 500, price: 4.99, bonus: 50 },
  { amount: 1000, price: 9.99, bonus: 150 },
  { amount: 2500, price: 19.99, bonus: 500 }
];

const GEM_PACKAGES = [
  { amount: 10, price: 1.99, bonus: 0 },
  { amount: 50, price: 9.99, bonus: 10 },
  { amount: 100, price: 19.99, bonus: 25 },
  { amount: 250, price: 39.99, bonus: 75 }
];

export default function Shop() {
  const { user, updateUser } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeTab, setActiveTab] = useState<'premium' | 'powerups' | 'currency'>('premium');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/payments/plans');
      if (response.ok) {
        const { plans } = await response.json();
        setPlans(plans);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchasePowerUp = async (powerUp: PowerUp) => {
    if (powerUp.coinCost > 0 && user!.coins < powerUp.coinCost) {
      toast.error('Not enough coins!');
      return;
    }
    if (powerUp.gemCost > 0 && user!.gems < powerUp.gemCost) {
      toast.error('Not enough gems!');
      return;
    }

    // Simulate purchase
    updateUser({
      coins: user!.coins - powerUp.coinCost,
      gems: user!.gems - powerUp.gemCost
    });
    
    toast.success(`${powerUp.name} purchased successfully!`);
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
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Shop</h1>
        <p className="text-gray-300">Enhance your quest experience</p>

        {/* Currency Display */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-semibold">{user?.coins}</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
            <Gem className="w-5 h-5 text-purple-400" />
            <span className="text-white font-semibold">{user?.gems}</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/20"
      >
        {[
          { key: 'premium', label: 'Premium', icon: Crown },
          { key: 'powerups', label: 'Power-ups', icon: Zap },
          { key: 'currency', label: 'Currency', icon: Coins }
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

      {/* Premium Plans */}
      {activeTab === 'premium' && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white/10 backdrop-blur-md rounded-xl p-6 border ${
                  plan.interval === 'year'
                    ? 'border-yellow-400/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10'
                    : 'border-white/20'
                }`}
              >
                {plan.interval === 'year' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-1 rounded-full text-sm font-bold">
                      BEST VALUE
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-white mb-1">
                    ${plan.price}
                    <span className="text-lg text-gray-400">/{plan.interval}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    user?.isPremium
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : plan.interval === 'year'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black hover:from-yellow-500 hover:to-orange-500'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                  }`}
                  disabled={user?.isPremium}
                >
                  {user?.isPremium ? 'Already Premium' : `Subscribe ${plan.name}`}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Power-ups */}
      {activeTab === 'powerups' && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {POWER_UPS.map((powerUp, index) => (
              <motion.div
                key={powerUp.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{powerUp.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-1">{powerUp.name}</h3>
                  <p className="text-gray-300 text-sm">{powerUp.description}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-3 mb-4">
                  <p className="text-purple-300 text-sm font-medium text-center">
                    Effect: {powerUp.effect}
                  </p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-4">
                    {powerUp.coinCost > 0 && (
                      <div className="flex items-center space-x-1">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-semibold">{powerUp.coinCost}</span>
                      </div>
                    )}
                    {powerUp.gemCost > 0 && (
                      <div className="flex items-center space-x-1">
                        <Gem className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 font-semibold">{powerUp.gemCost}</span>
                      </div>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => purchasePowerUp(powerUp)}
                  disabled={
                    (powerUp.coinCost > 0 && user!.coins < powerUp.coinCost) ||
                    (powerUp.gemCost > 0 && user!.gems < powerUp.gemCost)
                  }
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Purchase
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Currency */}
      {activeTab === 'currency' && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Coins */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Coins className="w-6 h-6 text-yellow-400 mr-2" />
                Coins
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {COIN_PACKAGES.map((pkg, index) => (
                  <motion.div
                    key={pkg.amount}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center"
                  >
                    <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-white">
                      {pkg.amount}
                      {pkg.bonus > 0 && (
                        <span className="text-green-400 text-sm"> +{pkg.bonus}</span>
                      )}
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">${pkg.price}</p>
                    <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all">
                      Buy
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Gems */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Gem className="w-6 h-6 text-purple-400 mr-2" />
                Gems
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {GEM_PACKAGES.map((pkg, index) => (
                  <motion.div
                    key={pkg.amount}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center"
                  >
                    <Gem className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-white">
                      {pkg.amount}
                      {pkg.bonus > 0 && (
                        <span className="text-green-400 text-sm"> +{pkg.bonus}</span>
                      )}
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">${pkg.price}</p>
                    <button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all">
                      Buy
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}