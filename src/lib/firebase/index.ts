import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { firebaseConfig } from "./config";

// Initialize Firebase only on client side
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Check if Firebase config is valid (API key is set)
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

if (isBrowser && isConfigValid) {
    try {
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApps()[0];
        }

        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
    } catch (error) {
        console.error("Firebase initialization error:", error);
        console.error(
            "Please ensure your Firebase credentials are set in .env.local file."
        );
    }
} else if (isBrowser && !isConfigValid) {
    console.warn(
        "⚠️ Firebase not initialized: Missing API key. " +
        "Please copy .env.example to .env.local and add your Firebase credentials."
    );
}

export { app, auth, db, storage };
