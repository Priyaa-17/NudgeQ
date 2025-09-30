# NudgeQuest - FlutterFlow Implementation Guide

## Overview
This guide provides complete instructions for building NudgeQuest in FlutterFlow with RevenueCat integration, Firebase authentication, and Firestore database.

## Table of Contents
1. [Project Setup](#project-setup)
2. [Firebase Configuration](#firebase-configuration)
3. [Firestore Database Schema](#firestore-database-schema)
4. [RevenueCat Integration](#revenuecat-integration)
5. [Page Structure & Navigation](#page-structure--navigation)
6. [Component Designs](#component-designs)
7. [Actions & Logic](#actions--logic)
8. [Testing & Deployment](#testing--deployment)

## Project Setup

### 1. Create New FlutterFlow Project
1. Go to FlutterFlow.io and create a new project
2. Choose "Mobile App" template
3. Name: "NudgeQuest"
4. Package Name: `com.yourcompany.nudgequest`
5. Enable both iOS and Android platforms

### 2. Theme Configuration
```
Primary Color: #8B5CF6 (Purple)
Secondary Color: #3B82F6 (Blue)
Tertiary Color: #F59E0B (Amber)
Background: #0F172A (Dark Slate)
Surface: #1E293B (Slate)
Text Colors:
  - Primary: #FFFFFF (White)
  - Secondary: #CBD5E1 (Light Gray)
  - Accent: #A855F7 (Purple Light)
```

## Firebase Configuration

### 1. Firebase Project Setup
1. Create new Firebase project at console.firebase.google.com
2. Enable Authentication with Email/Password
3. Enable Firestore Database
4. Enable Cloud Storage (for avatars)
5. Download configuration files (google-services.json for Android, GoogleService-Info.plist for iOS)

### 2. FlutterFlow Firebase Integration
1. Go to Settings & Integrations → Firebase
2. Upload configuration files
3. Enable Authentication
4. Enable Firestore
5. Enable Cloud Storage

## Firestore Database Schema

### Collections Structure

#### 1. users
```json
{
  "uid": "string (document ID)",
  "email": "string",
  "username": "string",
  "avatar": "string (storage URL)",
  "xp": "number (default: 0)",
  "level": "number (default: 1)",
  "coins": "number (default: 100)",
  "gems": "number (default: 0)",
  "streak": "number (default: 0)",
  "lastActiveDate": "timestamp",
  "isPremium": "boolean (default: false)",
  "premiumExpiresAt": "timestamp",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### 2. userProfiles
```json
{
  "userId": "string (document ID)",
  "bio": "string",
  "interests": "array of strings",
  "location": {
    "latitude": "number",
    "longitude": "number",
    "city": "string",
    "country": "string"
  },
  "discoverySettings": {
    "enabled": "boolean (default: true)",
    "radius": "number (default: 50)",
    "ageRange": {
      "min": "number",
      "max": "number"
    }
  },
  "privacy": {
    "locationEnabled": "boolean (default: false)",
    "showOnlineStatus": "boolean (default: true)"
  }
}
```

#### 3. quests
```json
{
  "id": "string (document ID)",
  "title": "string",
  "description": "string",
  "category": "string",
  "difficulty": "string (easy|medium|hard|expert)",
  "xpReward": "number",
  "coinReward": "number",
  "estimatedDuration": "number (minutes)",
  "isActive": "boolean",
  "createdAt": "timestamp",
  "steps": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "order": "number"
    }
  ]
}
```

#### 4. userQuests
```json
{
  "id": "string (document ID)",
  "userId": "string",
  "questId": "string",
  "status": "string (active|completed|paused|failed)",
  "progress": "number (0-100)",
  "currentStep": "number",
  "startedAt": "timestamp",
  "completedAt": "timestamp",
  "completedSteps": "array of strings"
}
```

#### 5. missions
```json
{
  "id": "string (document ID)",
  "userId": "string",
  "title": "string",
  "description": "string",
  "type": "string (daily|weekly|custom)",
  "target": "number",
  "current": "number",
  "xpReward": "number",
  "coinReward": "number",
  "isCompleted": "boolean",
  "dueDate": "timestamp",
  "createdAt": "timestamp"
}
```

#### 6. badges
```json
{
  "id": "string (document ID)",
  "name": "string",
  "description": "string",
  "icon": "string",
  "rarity": "string (common|rare|epic|legendary)",
  "requirement": "string",
  "category": "string"
}
```

#### 7. userBadges
```json
{
  "id": "string (document ID)",
  "userId": "string",
  "badgeId": "string",
  "earnedAt": "timestamp",
  "progress": "number"
}
```

#### 8. friendRequests
```json
{
  "id": "string (document ID)",
  "senderId": "string",
  "receiverId": "string",
  "status": "string (pending|accepted|declined)",
  "createdAt": "timestamp",
  "respondedAt": "timestamp"
}
```

#### 9. matches
```json
{
  "id": "string (document ID)",
  "user1Id": "string",
  "user2Id": "string",
  "createdAt": "timestamp",
  "lastMessageAt": "timestamp"
}
```

#### 10. swipes
```json
{
  "id": "string (document ID)",
  "swiperId": "string",
  "swipedUserId": "string",
  "direction": "string (left|right)",
  "createdAt": "timestamp"
}
```

#### 11. races
```json
{
  "id": "string (document ID)",
  "questId": "string",
  "participants": [
    {
      "userId": "string",
      "progress": "number",
      "completedAt": "timestamp"
    }
  ],
  "status": "string (waiting|active|completed)",
  "winnerId": "string",
  "createdAt": "timestamp",
  "startedAt": "timestamp",
  "endedAt": "timestamp"
}
```

#### 12. powerUps
```json
{
  "id": "string (document ID)",
  "name": "string",
  "description": "string",
  "icon": "string",
  "type": "string (xp_boost|streak_freeze|instant_complete)",
  "coinCost": "number",
  "gemCost": "number",
  "duration": "number (minutes, null for instant)",
  "multiplier": "number"
}
```

#### 13. userPowerUps
```json
{
  "id": "string (document ID)",
  "userId": "string",
  "powerUpId": "string",
  "quantity": "number",
  "purchasedAt": "timestamp",
  "expiresAt": "timestamp"
}
```

## RevenueCat Integration

### 1. RevenueCat Dashboard Setup
1. Create account at revenuecat.com
2. Create new project: "NudgeQuest"
3. Add iOS and Android apps with bundle IDs
4. Create products:
   - `nudgequest_premium_monthly` - Premium Monthly ($9.99)
   - `nudgequest_premium_yearly` - Premium Yearly ($99.99)
   - `nudgequest_lifetime` - Lifetime Access ($199.99)
   - `nudgequest_xp_boost` - XP Boost (100 coins)
   - `nudgequest_streak_freeze` - Streak Freeze (50 coins)
   - `nudgequest_instant_complete` - Instant Complete (5 gems)

### 2. Entitlements Setup
Create entitlements in RevenueCat:
- `premium_access` - Attached to all subscription products
- `xp_boost` - Attached to XP boost consumable
- `streak_freeze` - Attached to streak freeze consumable
- `instant_complete` - Attached to instant complete consumable

### 3. FlutterFlow RevenueCat Configuration
1. Go to Settings & Integrations → In-App Purchases & Subscriptions
2. Toggle "Enable RevenueCat"
3. Enter RevenueCat Public API Key: `[[YOUR_REVENUECAT_PUBLIC_KEY]]`
4. Add Product IDs:
   ```
   Premium Monthly: nudgequest_premium_monthly
   Premium Yearly: nudgequest_premium_yearly
   Lifetime: nudgequest_lifetime
   XP Boost: nudgequest_xp_boost
   Streak Freeze: nudgequest_streak_freeze
   Instant Complete: nudgequest_instant_complete
   ```

## Page Structure & Navigation

### 1. App Structure
```
Main Navigation (Bottom Tab Bar):
├── Home (Dashboard)
├── Quests
├── Missions
├── Discovery
├── Friends
└── Profile
```

### 2. Page Hierarchy

#### Authentication Flow
1. **Splash Screen**
   - Logo animation
   - Check authentication status
   - Navigate to onboarding or main app

2. **Onboarding Pages** (PageView)
   - Welcome & Features
   - Gamification Explanation
   - Social Features
   - Privacy & Location

3. **Login Page**
   - Email/Password fields
   - Login button
   - "Create Account" link
   - Social login options

4. **Register Page**
   - Username, Email, Password fields
   - Terms acceptance
   - Register button
   - "Sign In" link

5. **Profile Setup**
   - Avatar upload
   - Interest selection
   - Location permission request

#### Main App Pages

6. **Dashboard (Home)**
   - User stats (XP, Level, Streak)
   - Active quests preview
   - Daily missions
   - Quick actions

7. **Quest Library**
   - Quest categories
   - Search & filter
   - Quest cards with difficulty
   - Start quest action

8. **Quest Detail**
   - Quest information
   - Steps breakdown
   - Progress tracking
   - Start/Continue button

9. **Daily Missions**
   - Today's missions
   - Progress bars
   - Complete mission actions
   - Mission history

10. **Discovery (Swipe)**
    - Profile cards stack
    - Swipe gestures
    - Match notifications
    - Settings access

11. **Friends**
    - Friends list
    - Friend requests
    - Matches
    - Race invitations

12. **Profile**
    - User information
    - Stats & achievements
    - Settings
    - Logout

13. **Shop**
    - Power-ups
    - Consumables
    - Premium features
    - Purchase actions

14. **Paywall**
    - Subscription options
    - Feature comparison
    - Purchase buttons
    - Restore purchases

15. **Settings**
    - Account settings
    - Privacy controls
    - Notifications
    - Discovery preferences

## Component Designs

### 1. Custom Components

#### QuestCard Component
```
Properties:
- quest (Document Reference)
- showProgress (Boolean)
- onTap (Action)

Design:
- Rounded rectangle (16px radius)
- Gradient background based on difficulty
- Quest title (18px, bold)
- Description (14px, gray)
- XP/Coin rewards
- Progress bar (if showProgress = true)
- Difficulty indicator
```

#### MissionCard Component
```
Properties:
- mission (Document Reference)
- onComplete (Action)

Design:
- White card with shadow
- Mission title and description
- Progress indicator
- Complete button
- Reward display
```

#### UserProfileCard Component (for Discovery)
```
Properties:
- userProfile (Document Reference)
- onSwipeLeft (Action)
- onSwipeRight (Action)

Design:
- Full-screen card
- Avatar (large, centered)
- Username and level
- Bio text
- Interest tags
- Distance indicator
- Swipe indicators
```

#### StatsWidget Component
```
Properties:
- label (String)
- value (String/Number)
- icon (Icon)
- color (Color)

Design:
- Circular or rectangular container
- Icon at top
- Value (large, bold)
- Label (small, gray)
```

### 2. Design System

#### Colors
```
Primary: #8B5CF6 (Purple)
Secondary: #3B82F6 (Blue)
Success: #10B981 (Green)
Warning: #F59E0B (Amber)
Error: #EF4444 (Red)
Background: #0F172A (Dark)
Surface: #1E293B (Slate)
```

#### Typography
```
Heading 1: 32px, Bold
Heading 2: 24px, Bold
Heading 3: 20px, SemiBold
Body: 16px, Regular
Caption: 14px, Regular
Small: 12px, Regular
```

#### Spacing
```
XS: 4px
S: 8px
M: 16px
L: 24px
XL: 32px
XXL: 48px
```

## Actions & Logic

### 1. Authentication Actions

#### Login Action
```
1. Validate email and password
2. Call Firebase Auth signInWithEmailAndPassword
3. On success: Navigate to Dashboard
4. On error: Show error message
```

#### Register Action
```
1. Validate form fields
2. Call Firebase Auth createUserWithEmailAndPassword
3. Create user document in Firestore
4. Navigate to Profile Setup
```

#### Logout Action
```
1. Call Firebase Auth signOut
2. Clear app state
3. Navigate to Login
```

### 2. Quest Actions

#### Start Quest Action
```
1. Check if user has premium or quest limit
2. If limit reached and not premium: Show paywall
3. Create userQuest document
4. Navigate to Quest Detail
5. Award starting XP
```

#### Complete Quest Step Action
```
1. Update userQuest progress
2. Mark step as completed
3. Check if quest is complete
4. If complete: Award XP and coins
5. Update user stats
6. Show completion animation
```

### 3. Discovery Actions

#### Load Potential Matches Action
```
1. Get user's location and interests
2. Query users within radius
3. Filter by interests overlap
4. Exclude already swiped users
5. Return shuffled list
```

#### Swipe Action
```
Parameters: direction (left/right), targetUserId

1. Create swipe document
2. If direction = right:
   - Check for mutual swipe
   - If mutual: Create match document
   - Send match notification
3. Load next profile
```

#### Request Location Permission Action
```
1. Check current permission status
2. If not granted: Show permission dialog
3. Get current location
4. Update user profile with coordinates
5. Enable discovery
```

### 4. Purchase Actions

#### Purchase Subscription Action
```
Parameters: productId

1. Call RevenueCat purchaseProduct
2. On success:
   - Update user isPremium status
   - Sync entitlements
   - Show success message
3. On error: Show error message
```

#### Purchase Consumable Action
```
Parameters: productId, powerUpId

1. Call RevenueCat purchaseProduct
2. On success:
   - Add powerUp to user inventory
   - Update Firestore
   - Show success message
3. On error: Show error message
```

#### Restore Purchases Action
```
1. Call RevenueCat restorePurchases
2. Sync entitlements with Firestore
3. Update UI based on active subscriptions
4. Show restoration status
```

### 5. Social Actions

#### Send Friend Request Action
```
Parameters: receiverId

1. Check if request already exists
2. Create friendRequest document
3. Send push notification to receiver
4. Show confirmation message
```

#### Accept Friend Request Action
```
Parameters: requestId

1. Update friendRequest status to accepted
2. Add both users to each other's friends
3. Send confirmation notification
4. Refresh friends list
```

#### Start Race Action
```
Parameters: questId, friendIds

1. Check if quest is available
2. Create race document
3. Send race invitations
4. Navigate to race lobby
```

## Testing & Deployment

### 1. Testing Strategy

#### RevenueCat Testing
1. Use RevenueCat sandbox environment
2. Create test accounts for iOS and Android
3. Test all purchase flows
4. Verify entitlement syncing
5. Test restore purchases

#### Location Testing
1. Test on physical devices
2. Verify location permissions
3. Test discovery radius
4. Test with mock locations

#### Social Features Testing
1. Create multiple test accounts
2. Test swipe mechanics
3. Verify match creation
4. Test friend requests

### 2. Pre-Deployment Checklist

#### App Store Preparation
- [ ] App icons (all sizes)
- [ ] Screenshots for all device sizes
- [ ] App description and keywords
- [ ] Privacy policy URL
- [ ] Terms of service URL
- [ ] Age rating questionnaire

#### RevenueCat Production Setup
- [ ] Switch to production API keys
- [ ] Verify product IDs match store listings
- [ ] Test purchases in production sandbox
- [ ] Set up webhooks for server notifications

#### Firebase Production
- [ ] Switch to production Firebase project
- [ ] Set up proper security rules
- [ ] Configure authentication domains
- [ ] Set up Cloud Functions if needed

### 3. Deployment Steps

#### iOS Deployment
1. In FlutterFlow: Go to Deploy → iOS
2. Upload to TestFlight for testing
3. Submit for App Store review
4. Monitor review status

#### Android Deployment
1. In FlutterFlow: Go to Deploy → Android
2. Upload to Google Play Console
3. Create internal testing track
4. Submit for review

## Additional Features & Enhancements

### 1. Push Notifications
- Quest reminders
- Mission deadlines
- Friend requests
- Match notifications
- Streak warnings

### 2. Analytics Integration
- User engagement tracking
- Purchase funnel analysis
- Feature usage metrics
- Retention analysis

### 3. Advanced Features
- Quest sharing
- Custom quest creation
- Leaderboards
- Achievement system
- Social feeds

## Troubleshooting

### Common Issues

#### RevenueCat Integration
- Verify API keys are correct
- Check product IDs match exactly
- Ensure entitlements are properly configured
- Test with sandbox accounts first

#### Location Services
- Request permissions properly
- Handle permission denied gracefully
- Test on physical devices
- Implement fallback for no location

#### Firebase Issues
- Check security rules
- Verify collection names
- Monitor Firestore usage
- Handle offline scenarios

## Conclusion

This guide provides a complete roadmap for building NudgeQuest in FlutterFlow. Follow each section carefully, test thoroughly, and iterate based on user feedback. The combination of gamification, social discovery, and premium features creates a compelling user experience that encourages engagement and monetization.

Remember to:
1. Start with core features first
2. Test extensively before deployment
3. Monitor user behavior and iterate
4. Keep the user experience smooth and intuitive
5. Maintain proper data privacy and security practices