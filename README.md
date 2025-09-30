# NudgeQuest - Gamified Social Discovery Platform

NudgeQuest is a gamified micro-quest web application that combines productivity tracking with social discovery through location-based friend matching. Users can create and complete quests, missions, and goals while discovering like-minded individuals nearby through a swipe-based interface.

## ✨ Features

### 🎯 Quest & Mission System
- **Quests**: Long-term challenges with XP and coin rewards
- **Daily Missions**: Auto-generated tasks that refresh daily
- **Custom Missions**: User-created personal goals
- **Progress Tracking**: Real-time completion tracking with visual progress bars

### 👥 Social Discovery
- **Swipe-Based Matching**: Tinder-style interface for finding friends
- **Location-Based Search**: Find users within configurable radius
- **Interest Matching**: Connect with people who share your hobbies
- **Friend Requests**: Send and receive connection requests
- **Match System**: Mutual right swipes create instant connections

### 🏆 Gamification
- **XP System**: Earn experience points for completing tasks
- **Levels**: Progress through levels as you gain XP
- **Streaks**: Maintain daily activity streaks
- **Badges**: Unlock achievements for various accomplishments
- **Leaderboards**: Compete with friends and global users

### 💰 Economy & Shop
- **Coins & Gems**: Dual currency system
- **Power-ups**: Temporary boosts like XP multipliers and streak shields
- **Premium Subscription**: Enhanced features and exclusive benefits
- **In-app Purchases**: Buy currency and premium features

### 🔒 Privacy & Safety
- **Opt-in Location**: Users must explicitly enable location sharing
- **Discovery Controls**: Adjust search radius and pause discovery
- **Privacy Settings**: Control what information is shared

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **React Hot Toast** for notifications
- **React Swipeable** for touch gestures

### Backend
- **Node.js** with Express
- **Prisma ORM** with PostgreSQL
- **JWT Authentication**
- **bcryptjs** for password hashing
- **Stripe** for payments
- **Zod** for validation

### Database Schema
- Users with profiles, location, and interests
- Quests, missions, and progress tracking
- Social features: friends, matches, swipes
- Economy: power-ups, badges, currencies

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Stripe account (for payments)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd nudgequest
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

3. **Set up environment variables**

Create `server/.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/nudgequest"
JWT_SECRET="your-super-secret-jwt-key"
STRIPE_SECRET_KEY="sk_test_your_stripe_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
ONESIGNAL_APP_ID="your-onesignal-app-id"
ONESIGNAL_API_KEY="your-onesignal-api-key"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

4. **Set up the database**
```bash
npm run setup
```

5. **Start the development servers**
```bash
# Start backend (from root directory)
npm run server

# Start frontend (in new terminal)
npm run dev
```

The app will be available at `http://localhost:5173`

## 📱 Usage

### Getting Started
1. **Register** a new account or **login** with existing credentials
2. **Complete onboarding** by setting interests and enabling location (optional)
3. **Start your first quest** from the available quests list
4. **Complete daily missions** to earn XP and maintain streaks

### Discovery Mode
1. **Enable location sharing** when prompted
2. **Set your discovery preferences** (radius, interests)
3. **Start swiping** on potential friends
4. **Swipe right** to send friend requests
5. **Check matches** when both users swipe right

### Social Features
- **View friends list** and their progress
- **Accept/decline** friend requests
- **Start quest races** with friends
- **Send messages** to matches and friends

## 🏗 Project Structure

```
nudgequest/
├── src/                          # Frontend React app
│   ├── components/              
│   │   ├── auth/               # Login/Register components
│   │   ├── discovery/          # Swipe-based friend finding
│   │   ├── quests/            # Quest management
│   │   ├── missions/          # Daily/custom missions
│   │   ├── friends/           # Social features
│   │   ├── profile/           # User profile management
│   │   └── shop/              # Premium & purchases
│   ├── contexts/              # React contexts (Auth)
│   ├── hooks/                 # Custom React hooks
│   └── main.tsx              # App entry point
├── server/                    # Backend Node.js API
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # Auth & validation
│   │   └── server.ts        # Express server setup
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/leaderboard` - Get top users by XP

### Quests & Missions
- `GET /api/quests` - Get available quests
- `POST /api/quests/:id/start` - Start a quest
- `GET /api/missions` - Get user's missions
- `POST /api/missions` - Create custom mission

### Discovery & Social
- `PUT /api/discovery/location` - Update user location
- `GET /api/discovery/potential-matches` - Get nearby users
- `POST /api/discovery/swipe` - Record swipe action
- `GET /api/friends` - Get friends list
- `POST /api/friends/request` - Send friend request

### Payments
- `GET /api/payments/plans` - Get premium plans
- `POST /api/payments/create-payment-intent` - Start payment flow

## 🔐 Security Features

- **JWT Authentication** with secure token storage
- **Password Hashing** using bcrypt with salt rounds
- **Input Validation** using Zod schemas
- **Row Level Security** in database with Prisma
- **CORS Protection** for API endpoints
- **Helmet.js** security headers

## 📊 Database Design

The application uses PostgreSQL with Prisma ORM. Key models include:

- **Users**: Authentication, profile, stats (XP, level, coins)
- **UserProfile**: Location, interests, discovery settings
- **Quests**: Template quests with rewards and difficulty
- **UserQuests**: Individual quest progress tracking
- **Missions**: Daily/custom tasks with completion tracking
- **FriendRequests**: Social connection requests
- **Swipes/Matches**: Discovery interaction tracking
- **Badges/PowerUps**: Gamification elements

## 🌟 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, email support@nudgequest.com or join our Discord community.

---

Built with ❤️ for productivity enthusiasts and social adventurers!