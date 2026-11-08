import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

import firebaseConfig from "../../firebase-applet-config.json";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (typeof window !== "undefined") {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  if (firebaseConfig.firestoreDatabaseId) {
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    db = getFirestore(app);
  }
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Debounce mutex to prevent concurrent popup requests causing auth/cancelled-popup-request
let activeAuthPromise: Promise<User | null> | null = null;

export async function loginWithGoogle(): Promise<User | null> {
  if (!auth) {
    throw new Error("Firebase Auth is only available in browser environment");
  }

  if (activeAuthPromise) {
    return activeAuthPromise;
  }

  activeAuthPromise = (async () => {
    try {
      const result = await signInWithPopup(auth!, googleProvider);
      return result.user;
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
      // Handle user dismissing popup or cancelled duplicate gracefully without logging fatal error
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return null;
      }
      throw err;
    } finally {
      activeAuthPromise = null;
    }
  })();

  return activeAuthPromise;
}

export async function logoutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export { app, auth, db };
