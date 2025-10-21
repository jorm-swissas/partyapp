# Firebase Setup Guide - RhyConnect Party App

## Overview

Your app has been migrated from mock data to a real Firebase backend. All data is now persisted in the cloud with real-time synchronization.

## What Changed

### Before (Mock Data)
- All data stored in memory (lost on app restart)
- Simulated network delays (300-1000ms)
- No user authentication
- No data persistence
- No real-time updates

### After (Real Firebase)
- **Firestore Database**: All events and user data persisted in cloud
- **Firebase Authentication**: Real user accounts with email/password
- **Firebase Storage**: Event images stored in cloud
- **Real-time Sync**: Changes appear instantly across all devices
- **Security Rules**: Data protected by server-side rules

## Firebase Services to Enable

Your Firebase project (`rhyconnect-basel`) needs the following services enabled:

### 1. Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **rhyconnect-basel**
3. Navigate to **Authentication** → **Get started**
4. Click on **Sign-in method** tab
5. Enable **Email/Password** provider
6. Click **Save**

### 2. Create Firestore Database

1. In Firebase Console, navigate to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we'll apply security rules next)
4. Select a location (choose closest to your users, e.g., `europe-west3` for Switzerland)
5. Click **Enable**

**Apply Security Rules:**
1. Go to **Firestore Database** → **Rules** tab
2. Copy the contents of `firestore.rules` from your project
3. Paste into the rules editor
4. Click **Publish**

**Create Indexes (Optional, for better performance):**

If you encounter errors about missing indexes when querying, create these:

1. Go to **Firestore Database** → **Indexes** tab
2. Add composite index:
   - Collection: `events`
   - Fields: `category` (Ascending), `createdAt` (Descending)
3. Click **Create**

### 3. Enable Firebase Storage

1. In Firebase Console, navigate to **Storage**
2. Click **Get started**
3. Choose **Start in production mode**
4. Select the same location as your Firestore database
5. Click **Done**

**Apply Security Rules:**
1. Go to **Storage** → **Rules** tab
2. Copy the contents of `storage.rules` from your project
3. Paste into the rules editor
4. Click **Publish**

## Data Structure

### Firestore Collections

#### `users` Collection
```javascript
{
  id: "firebase-auth-uid",
  email: "user@example.com",
  username: "username",
  displayName: "User Display Name",
  createdAt: "2025-01-15T10:30:00.000Z"
}
```

#### `events` Collection
```javascript
{
  id: "auto-generated-id",
  title: "Event Title",
  description: "Event description",
  location: "Event location",
  latitude: 47.5596,      // Optional
  longitude: 7.5886,      // Optional
  date: "2025-01-20",
  time: "20:00",
  category: "Hausparty",  // Hausparty | Party | Gaming | Outdoor | Konzert | Club
  imageUri: "https://firebasestorage.googleapis.com/...",  // Optional
  maxParticipants: 50,    // Optional
  price: 10.00,           // Optional
  currency: "CHF",        // Optional
  createdBy: "user-id",   // References users collection
  createdAt: "2025-01-15T10:30:00.000Z"
}
```

### Storage Structure

```
/events/{eventId}_{timestamp}.jpg    - Event images
/users/{userId}/{imageId}.jpg        - User profile images (future)
```

## Security Rules Explained

### Firestore Rules ([firestore.rules](firestore.rules))

**Users Collection:**
- ✅ Anyone can read user profiles (to show event creators)
- ✅ Users can create/update their own profile
- ❌ Users cannot delete profiles

**Events Collection:**
- ✅ Anyone can read events (public listing)
- ✅ Authenticated users can create events
- ✅ Only event owner can update/delete their events
- ❌ Validation: title, location, category required

### Storage Rules ([storage.rules](storage.rules))

**Event Images:**
- ✅ Anyone can read (public)
- ✅ Authenticated users can upload (max 5MB, images only)
- ✅ Authenticated users can delete

**Profile Images (Future):**
- ✅ Anyone can read
- ✅ Only profile owner can upload/update/delete (max 5MB)

## Testing Your Setup

### 1. Test Authentication

1. Run your app: `npm start` or `npx expo start`
2. Navigate to **Profile** screen
3. Try registering a new account:
   - Enter email, password, username, display name
   - Click **Registrieren**
   - Should create user in Firebase Auth + Firestore

4. Verify in Firebase Console:
   - Go to **Authentication** → **Users**
   - You should see your new user
   - Go to **Firestore Database** → **users** collection
   - You should see a document with user data

### 2. Test Event Creation

1. Make sure you're logged in
2. Navigate to **Home** screen
3. Click the **+** button
4. Fill out event form:
   - Title: "Test Event"
   - Location: "Basel, Switzerland"
   - Category: "Party"
   - Optionally add an image
5. Click **Event erstellen**

6. Verify in Firebase Console:
   - Go to **Firestore Database** → **events** collection
   - You should see your event document
   - If you added an image:
     - Go to **Storage** → **events** folder
     - You should see your uploaded image

### 3. Test Real-time Sync

1. Open your app on two devices/emulators
2. Create an event on device 1
3. Device 2 should instantly show the new event (no refresh needed!)
4. Delete the event on device 1
5. Event should disappear on device 2 immediately

### 4. Test Security

1. Log out of your account
2. Try creating an event → Should prompt you to log in
3. Log in as User A
4. Create an event
5. Log out and log in as User B
6. Try to delete User A's event → Should fail (security rules prevent this)

## Common Issues & Troubleshooting

### Issue: "Permission denied" errors

**Cause:** Security rules not deployed or too restrictive

**Solution:**
1. Go to Firebase Console → Firestore Database → Rules
2. Copy `firestore.rules` content
3. Publish rules
4. Do the same for Storage rules

### Issue: "Missing or insufficient permissions" when creating events

**Cause:** User not authenticated or security rules issue

**Solution:**
1. Make sure user is logged in (`isLoggedIn === true`)
2. Check Firebase Console → Authentication to verify user exists
3. Verify Firestore rules allow `create` for authenticated users

### Issue: Events not appearing in real-time

**Cause:** Real-time listener not set up correctly

**Solution:**
1. Check [HomeScreen.tsx:26](src/screens/HomeScreen.tsx#L26) - should use `subscribeToEventsRealtime()`
2. Make sure Firebase config is correct in [firebase.ts](src/config/firebase.ts)
3. Check browser console for Firebase errors

### Issue: Images not uploading

**Cause:** Storage not enabled or storage rules too restrictive

**Solution:**
1. Go to Firebase Console → Storage
2. Make sure Storage is enabled
3. Go to Rules tab
4. Copy `storage.rules` content
5. Publish rules
6. Check that images are under 5MB and are valid image files

### Issue: App crashes with "Cannot read properties of undefined"

**Cause:** Firebase not initialized properly

**Solution:**
1. Verify [firebase.ts](src/config/firebase.ts) has correct config
2. Make sure all Firebase packages are installed:
   ```bash
   npm install firebase
   ```
3. Clear cache and rebuild:
   ```bash
   npx expo start --clear
   ```

## Environment Variables (Optional but Recommended)

For better security, you can move Firebase credentials to environment variables:

1. Install `expo-constants`:
   ```bash
   npx expo install expo-constants
   ```

2. Create `.env` file:
   ```env
   FIREBASE_API_KEY=AIzaSyAtOdgCopoO3NNloRMmrkjtv0af4tkplig
   FIREBASE_AUTH_DOMAIN=rhyconnect-basel.firebaseapp.com
   FIREBASE_PROJECT_ID=rhyconnect-basel
   FIREBASE_STORAGE_BUCKET=rhyconnect-basel.firebasestorage.app
   FIREBASE_MESSAGING_SENDER_ID=212684705619
   FIREBASE_APP_ID=1:212684705619:web:7a28bd2a29ddb4a7dd1ba6
   FIREBASE_MEASUREMENT_ID=G-3X776M9ZB1
   ```

3. Add to `.gitignore`:
   ```
   .env
   ```

4. Update `app.json`:
   ```json
   {
     "expo": {
       "extra": {
         "firebaseApiKey": process.env.FIREBASE_API_KEY,
         "firebaseAuthDomain": process.env.FIREBASE_AUTH_DOMAIN,
         // ... etc
       }
     }
   }
   ```

5. Update [firebase.ts](src/config/firebase.ts) to read from `Constants.expoConfig.extra`

## Performance Optimization

### Enable Offline Persistence

Add to [firebase.ts](src/config/firebase.ts):

```typescript
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.log('Multiple tabs open, persistence enabled in first tab only');
  } else if (err.code === 'unimplemented') {
    console.log('Browser does not support persistence');
  }
});
```

This allows the app to work offline and sync when connection is restored.

### Add Firestore Indexes

For better query performance, create indexes for common queries:

1. Go to Firebase Console → Firestore Database → Indexes
2. Add indexes for:
   - `events` collection: `category` (Ascending) + `createdAt` (Descending)
   - `events` collection: `createdBy` (Ascending) + `createdAt` (Descending)

## Next Steps

### 1. Deploy Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Firestore
# - Storage
# - Use existing project: rhyconnect-basel
# - Use firestore.rules and storage.rules

# Deploy rules
firebase deploy --only firestore:rules,storage:rules
```

### 2. Set Up Analytics (Optional)

Firebase Analytics is already configured in your app. To view analytics:

1. Go to Firebase Console → Analytics
2. View user engagement, screen views, events, etc.

### 3. Add Push Notifications (Future)

To send notifications when new events are created:

1. Set up Firebase Cloud Messaging (FCM)
2. Install `expo-notifications`
3. Create Cloud Functions to send notifications on new events

### 4. Add Social Features

- User profiles with avatars
- Event RSVPs / attendee lists
- Comments on events
- Event ratings/reviews
- Follow other users

### 5. Add Moderation

- Admin dashboard
- Report inappropriate events
- Event approval workflow
- User bans

## Support

If you encounter issues:

1. Check Firebase Console for errors
2. Check browser console for JavaScript errors
3. Review [Firebase Documentation](https://firebase.google.com/docs)
4. Check [Expo Documentation](https://docs.expo.dev/)

## Summary

Your app is now production-ready with:

- ✅ Real user authentication
- ✅ Persistent cloud database
- ✅ Cloud image storage
- ✅ Real-time data synchronization
- ✅ Security rules protecting data
- ✅ Offline support (with persistence enabled)

All mock services have been replaced with real Firebase services. Your users can now create accounts, post events, and all data will persist across sessions and devices!
