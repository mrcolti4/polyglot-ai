import admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";

const { GOOGLE_FIREBASE_APPLICATION_CREDENTIALS } = process.env;

admin.initializeApp({
  credential: admin.credential.cert(
    GOOGLE_FIREBASE_APPLICATION_CREDENTIALS || ""
  ),
  storageBucket: "polyglotai-76138.appspot.com"
});

export const db: FirebaseFirestore.Firestore = admin.firestore();
export const bucket = getStorage().bucket();
