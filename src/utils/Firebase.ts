import admin from "firebase-admin";

const { GOOGLE_APPLICATION_CREDENTIALS } = process.env;

admin.initializeApp({
  credential: admin.credential.cert(GOOGLE_APPLICATION_CREDENTIALS || ""),
});

export const db: FirebaseFirestore.Firestore = admin.firestore();
