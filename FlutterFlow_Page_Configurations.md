# FlutterFlow Page Configurations

## Detailed Page Setup Instructions

### 1. Splash Screen
**Page Type:** Basic Page
**Route:** `/splash`

**Widgets:**
- Column (Main Axis: Center, Cross Axis: Center)
  - Container (200x200, Gradient Background)
    - Icon (Game Controller, 80px, White)
  - Text ("NudgeQuest", Style: Heading 1, Color: White)
  - Text ("Gamify Your Goals", Style: Body, Color: Gray)

**Actions:**
- Page Load Action:
  ```
  1. Wait 2 seconds
  2. Check if user is authenticated
  3. If authenticated: Navigate to Dashboard
  4. Else: Navigate to Onboarding
  ```

### 2. Onboarding Flow
**Page Type:** PageView
**Route:** `/onboarding`

**Page 1 - Welcome:**
- Column
  - Lottie Animation (Welcome animation)
  - Text ("Welcome to NudgeQuest")
  - Text ("Turn your goals into epic quests")
  - Button ("Get Started")

**Page 2 - Gamification:**
- Column
  - Icon (Trophy)
  - Text ("Earn XP & Level Up")
  - Text ("Complete quests to gain experience")
  - Row (XP examples with icons)

**Page 3 - Social:**
- Column
  - Icon (Users)
  - Text ("Find Quest Partners")
  - Text ("Discover friends nearby and race together")
  - Swipe gesture illustration

**Page 4 - Privacy:**
- Column
  - Icon (Shield)
  - Text ("Your Privacy Matters")
  - Text ("Control who can find you")
  - Button ("Continue to Sign Up")

### 3. Authentication Pages

#### Login Page
**Route:** `/login`

**Widgets:**
- SingleChildScrollView
  - Column (Padding: 24px)
    - Container (Logo + Title)
    - Form
      - TextFormField (Email)
        - Validation: Email format
        - Icon: Mail
      - TextFormField (Password)
        - Validation: Min 6 characters
        - Icon: Lock
        - Obscure Text: True
      - Button ("Sign In")
        - Action: Login Action
      - TextButton ("Create Account")
        - Action: Navigate to Register

#### Register Page
**Route:** `/register`

**Similar structure to Login with additional fields:**
- Username TextFormField
- Confirm Password TextFormField
- Checkbox (Terms Agreement)
- Register Button Action

### 4. Main App Pages

#### Dashboard
**Route:** `/dashboard`
**Bottom Nav Index:** 0

**Widgets:**
- SingleChildScrollView
  - Column
    - Container (User Stats Row)
      - StatsWidget (XP)
      - StatsWidget (Level)
      - StatsWidget (Streak)
      - StatsWidget (Coins)
    - Container ("Active Quests")
      - ListView.builder
        - QuestCard components
    - Container ("Today's Missions")
      - ListView.builder
        - MissionCard components
    - Container ("Quick Actions")
      - Row
        - ActionButton ("Start Quest")
        - ActionButton ("Find Friends")

**Actions:**
- Page Load: Fetch user data, active quests, missions
- Refresh: Pull to refresh functionality

#### Quest Library
**Route:** `/quests`
**Bottom Nav Index:** 1

**Widgets:**
- Column
  - Container (Search & Filter)
    - TextFormField (Search)
    - DropdownButton (Category Filter)
    - DropdownButton (Difficulty Filter)
  - Expanded
    - ListView.builder
      - QuestCard components
        - OnTap: Navigate to Quest Detail

**State Variables:**
- searchQuery (String)
- selectedCategory (String)
- selectedDifficulty (String)
- filteredQuests (List<DocumentReference>)

#### Quest Detail
**Route:** `/quest-detail`
**Parameters:** questId

**Widgets:**
- SingleChildScrollView
  - Column
    - Container (Quest Header)
      - BackButton
      - Quest Title
      - Difficulty Badge
      - Rewards Display
    - Container (Description)
    - Container (Steps)
      - ListView.builder (Quest Steps)
    - Container (Actions)
      - Button ("Start Quest" or "Continue")

**Actions:**
- Start Quest: Check premium status, create userQuest
- Continue Quest: Navigate to active quest tracking

#### Discovery (Swipe)
**Route:** `/discovery`
**Bottom Nav Index:** 3

**Widgets:**
- Stack
  - Container (Background)
  - Positioned (Card Stack)
    - UserProfileCard (Current user)
      - Swipe gestures enabled
  - Positioned (Bottom Actions)
    - Row
      - IconButton (Pass - X icon)
      - IconButton (Like - Heart icon)
  - Positioned (Top Settings)
    - IconButton (Settings)

**State Variables:**
- potentialMatches (List<DocumentReference>)
- currentIndex (int)
- isLoading (bool)

**Actions:**
- Page Load: Request location, fetch potential matches
- Swipe Left: Record swipe, load next profile
- Swipe Right: Record swipe, check for match, load next
- Settings: Navigate to discovery settings

### 5. Component Configurations

#### QuestCard Component
**Parameters:**
- quest (DocumentReference)
- showProgress (bool) - default false

**Widgets:**
- Container
  - Decoration: BoxDecoration with gradient
  - Child: Column
    - Row (Title + Difficulty)
    - Text (Description)
    - Row (Rewards)
    - If showProgress: LinearProgressIndicator

**Actions:**
- OnTap: Navigate to Quest Detail with questId

#### MissionCard Component
**Parameters:**
- mission (DocumentReference)

**Widgets:**
- Card
  - ListTile
    - Leading: Icon (based on mission type)
    - Title: Mission title
    - Subtitle: Progress text
    - Trailing: Complete button or checkmark

**Actions:**
- Complete Button: Update mission progress

#### UserProfileCard Component
**Parameters:**
- userProfile (DocumentReference)

**Widgets:**
- Container (Full screen card)
  - Column
    - Expanded (Profile image area)
      - CircleAvatar (Large)
    - Container (Profile info)
      - Text (Username + Age)
      - Text (Distance)
      - Text (Bio)
      - Wrap (Interest chips)

**Gestures:**
- PanGesture: Handle swipe detection
- OnPanEnd: Determine swipe direction and trigger action

### 6. Navigation Configuration

#### Bottom Navigation Bar
**Type:** BottomNavigationBar
**Items:**
1. Home (Dashboard) - Icon: Home
2. Quests - Icon: Target
3. Missions - Icon: CheckSquare
4. Discovery - Icon: Heart
5. Profile - Icon: User

**Actions:**
- OnTap: Navigate to corresponding page with index

#### App Bar Configurations
- Dashboard: No app bar (custom header)
- Quest Library: Search app bar
- Quest Detail: Back button + title
- Discovery: Transparent app bar with settings
- Profile: Settings action button

### 7. State Management

#### App State Variables
- currentUser (DocumentReference)
- userStats (Custom Data Type)
- activeQuests (List<DocumentReference>)
- dailyMissions (List<DocumentReference>)
- isPremium (bool)

#### Page State Variables
**Dashboard:**
- isLoading (bool)
- refreshing (bool)

**Quest Library:**
- quests (List<DocumentReference>)
- filteredQuests (List<DocumentReference>)
- searchQuery (String)

**Discovery:**
- potentialMatches (List<DocumentReference>)
- currentIndex (int)
- hasLocationPermission (bool)

### 8. Custom Actions

#### Location Actions
**Request Location Permission:**
```
1. Check current permission status
2. If denied: Show permission dialog
3. Request permission
4. If granted: Get current location
5. Update user profile with coordinates
6. Return success/failure
```

**Get Nearby Users:**
```
1. Get user's current location
2. Query users within radius
3. Filter by discovery settings
4. Exclude already swiped users
5. Return list of potential matches
```

#### Purchase Actions
**Purchase Premium:**
```
1. Show loading indicator
2. Call RevenueCat purchase
3. On success: Update user premium status
4. On failure: Show error message
5. Hide loading indicator
```

**Restore Purchases:**
```
1. Call RevenueCat restore
2. Update user entitlements
3. Sync with Firestore
4. Show success message
```

### 9. Animations & Transitions

#### Page Transitions
- Slide transition for main navigation
- Fade transition for modals
- Scale transition for cards

#### Custom Animations
- Quest completion celebration
- Level up animation
- Match found animation
- Swipe card animations

#### Micro-interactions
- Button press feedback
- Loading states
- Progress bar animations
- Badge unlock animations

### 10. Responsive Design

#### Breakpoints
- Mobile: < 600px
- Tablet: 600px - 1024px
- Desktop: > 1024px

#### Adaptive Layouts
- Single column on mobile
- Two columns on tablet
- Three columns on desktop
- Responsive card sizes
- Adaptive navigation (drawer on larger screens)

This configuration guide provides the detailed setup needed for each page and component in FlutterFlow. Follow these specifications to create a cohesive, well-designed app that matches the NudgeQuest vision.