import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { type Database, getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Solo necesitamos apiKey + databaseURL para RTDB
const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.databaseURL,
);

let app: FirebaseApp | null = null;
let rtdb: Database | null = null;

if (hasFirebaseConfig) {
  app = getApps()[0] ?? initializeApp(firebaseConfig);
  rtdb = getDatabase(app);
}

export function isFirebaseConfigured(): boolean {
  return hasFirebaseConfig;
}

export function getRTDB(): Database {
  if (!rtdb) {
    throw new Error('Firebase no está configurado. Define NEXT_PUBLIC_FIREBASE_API_KEY y NEXT_PUBLIC_FIREBASE_DATABASE_URL');
  }
  return rtdb;
}
