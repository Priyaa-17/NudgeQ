// Cloud Functions for NudgeQuest
// Deploy these to Firebase Functions for server-side logic

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// Generate daily missions for all users
exports.generateDailyMissions = functions.pubsub
  .schedule('0 0 * * *') // Run daily at midnight
  .timeZone('UTC')
  .onRun(async (context) => {
    const users = await db.collection('users').get();
    const batch = db.batch();
    
    const dailyMissionTemplates = [
      {
        title: 'Complete 3 Quest Steps',
        description: 'Make progress on any active quest',
        type: 'daily',
        target: 3,
        xpReward: 15,
        coinReward: 10
      },
      {
        title: 'Maintain Your Streak',
        description: 'Log in and complete at least one mission',
        type: 'daily',
        target: 1,
        xpReward: 10,
        coinReward: 5
      },
      {
        title: 'Discover New Friends',
        description: 'Swipe on potential matches',
        type: 'daily',
        target: 5,
        xpReward: 20,
        coinReward: 15
      }
    ];
    
    users.forEach(userDoc => {
      const userId = userDoc.id;
      const randomMissions = dailyMissionTemplates
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);
      
      randomMissions.forEach(mission => {
        const missionRef = db.collection('missions').doc();
        batch.set(missionRef, {
          ...mission,
          userId,
          current: 0,
          isCompleted: false,
          dueDate: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + 24 * 60 * 60 * 1000)
          ),
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
    });
    
    await batch.commit();
    console.log('Daily missions generated for all users');
  });

// Handle quest completion and rewards
exports.onQuestCompleted = functions.firestore
  .document('userQuests/{userQuestId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Check if quest was just completed
    if (before.status !== 'completed' && after.status === 'completed') {
      const userId = after.userId;
      const questId = after.questId;
      
      // Get quest details for rewards
      const questDoc = await db.collection('quests').doc(questId).get();
      const quest = questDoc.data();
      
      // Update user stats
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        xp: admin.firestore.FieldValue.increment(quest.xpReward),
        coins: admin.firestore.FieldValue.increment(quest.coinReward),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Check for level up
      const userDoc = await userRef.get();
      const user = userDoc.data();
      const newLevel = Math.floor(user.xp / 100) + 1;
      
      if (newLevel > user.level) {
        await userRef.update({ level: newLevel });
        
        // Award level up bonus
        await userRef.update({
          coins: admin.firestore.FieldValue.increment(newLevel * 10)
        });
      }
      
      // Check for badge eligibility
      await checkAndAwardBadges(userId, 'quest_completed');
    }
  });

// Handle mutual swipes and create matches
exports.onSwipeCreated = functions.firestore
  .document('swipes/{swipeId}')
  .onCreate(async (snap, context) => {
    const swipe = snap.data();
    
    if (swipe.direction === 'right') {
      // Check for mutual swipe
      const mutualSwipeQuery = await db.collection('swipes')
        .where('swiperId', '==', swipe.swipedUserId)
        .where('swipedUserId', '==', swipe.swiperId)
        .where('direction', '==', 'right')
        .get();
      
      if (!mutualSwipeQuery.empty) {
        // Create match
        const matchRef = db.collection('matches').doc();
        await matchRef.set({
          user1Id: swipe.swiperId,
          user2Id: swipe.swipedUserId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastMessageAt: null
        });
        
        // Send push notifications to both users
        await sendMatchNotification(swipe.swiperId, swipe.swipedUserId);
        await sendMatchNotification(swipe.swipedUserId, swipe.swiperId);
      }
    }
  });

// Handle RevenueCat webhook events
exports.revenueCatWebhook = functions.https.onRequest(async (req, res) => {
  const event = req.body;
  
  if (event.type === 'INITIAL_PURCHASE' || event.type === 'RENEWAL') {
    const userId = event.app_user_id;
    const productId = event.product_id;
    const expiresDate = new Date(event.expiration_time_ms);
    
    // Update user premium status
    await db.collection('users').doc(userId).update({
      isPremium: true,
      premiumExpiresAt: admin.firestore.Timestamp.fromDate(expiresDate),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
  } else if (event.type === 'CANCELLATION' || event.type === 'EXPIRATION') {
    const userId = event.app_user_id;
    
    // Remove premium status
    await db.collection('users').doc(userId).update({
      isPremium: false,
      premiumExpiresAt: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  
  res.status(200).send('OK');
});

// Update user streaks daily
exports.updateStreaks = functions.pubsub
  .schedule('0 1 * * *') // Run daily at 1 AM
  .timeZone('UTC')
  .onRun(async (context) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const users = await db.collection('users').get();
    const batch = db.batch();
    
    users.forEach(userDoc => {
      const user = userDoc.data();
      const lastActive = user.lastActiveDate?.toDate();
      
      if (lastActive && lastActive >= yesterday) {
        // User was active yesterday, maintain streak
        batch.update(userDoc.ref, {
          streak: user.streak + 1
        });
      } else {
        // User was not active, reset streak
        batch.update(userDoc.ref, {
          streak: 0
        });
      }
    });
    
    await batch.commit();
  });

// Helper function to check and award badges
async function checkAndAwardBadges(userId, trigger) {
  const userDoc = await db.collection('users').doc(userId).get();
  const user = userDoc.data();
  
  const badgeChecks = {
    'first_quest': user.xp >= 10,
    'level_5': user.level >= 5,
    'level_10': user.level >= 10,
    'streak_7': user.streak >= 7,
    'streak_30': user.streak >= 30,
    'social_butterfly': trigger === 'friend_added' // Custom logic needed
  };
  
  const badges = await db.collection('badges').get();
  const batch = db.batch();
  
  badges.forEach(badgeDoc => {
    const badge = badgeDoc.data();
    const badgeId = badgeDoc.id;
    
    if (badgeChecks[badgeId]) {
      // Check if user already has this badge
      db.collection('userBadges')
        .where('userId', '==', userId)
        .where('badgeId', '==', badgeId)
        .get()
        .then(existingBadges => {
          if (existingBadges.empty) {
            // Award badge
            const userBadgeRef = db.collection('userBadges').doc();
            batch.set(userBadgeRef, {
              userId,
              badgeId,
              earnedAt: admin.firestore.FieldValue.serverTimestamp(),
              progress: 100
            });
          }
        });
    }
  });
  
  await batch.commit();
}

// Helper function to send match notifications
async function sendMatchNotification(userId, matchedUserId) {
  // Get matched user info
  const matchedUserDoc = await db.collection('users').doc(matchedUserId).get();
  const matchedUser = matchedUserDoc.data();
  
  // This would integrate with your push notification service
  // For example, using Firebase Cloud Messaging
  const message = {
    notification: {
      title: 'New Match! 🎉',
      body: `You matched with ${matchedUser.username}!`
    },
    topic: `user_${userId}`
  };
  
  // Send notification (implement based on your notification service)
  console.log('Would send notification:', message);
}