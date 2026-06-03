import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { api } from './api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

function initFirebase() {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    const analytics = typeof window !== 'undefined' ? getAnalytics(app) : undefined;
    const messaging = typeof window !== 'undefined' ? getMessaging(app) : undefined;
    return { app, auth, db, storage, analytics, messaging };
  } catch (e) {
    console.warn('Firebase initialization failed', e);
    return { app: null as any, auth: null as any, db: null as any, storage: null as any, analytics: undefined, messaging: undefined };
  }
}

const { app, auth, db, storage, analytics, messaging } = initFirebase();

export const requestPushPermission = async () => {
  if (!messaging) return;
  try {
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('VITE_FIREBASE_VAPID_KEY not set, skipping push registration');
      return;
    }

    if ('Notification' in window) {
      if (Notification.permission === 'denied') return;
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;
      }
    }

    const currentToken = await getToken(messaging, { vapidKey });
    if (currentToken) {
      api.post('/notifications/push-token', { token: currentToken, platform: 'web' }).catch(() => {});
    }
  } catch (e) {
    console.warn('Push notification registration failed:', e);
  }
};

export const onForegroundMessage = (handler: (payload: any) => void) => {
  if (!messaging) return;
  onMessage(messaging, handler);
};

export { app, auth, db, storage, analytics, messaging };
