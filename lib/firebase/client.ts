import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { type Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (hasFirebaseConfig) {
  app = getApps()[0] ?? initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export function isFirebaseConfigured(): boolean {
  return hasFirebaseConfig;
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    throw new Error('Firebase no está configurado. Define las variables NEXT_PUBLIC_FIREBASE_*');
  }
  return db;
}
