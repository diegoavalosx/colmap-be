import app from "./app";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.app = functions.https.onRequest(app);

exports.createUser = functions.https.onCall(async (request) => {
  const { email, password, displayName } = request.data;
  // Validate input
  if (!email || !password || !displayName) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email, password, and displayName are required."
    );
  }

  try {
    // Create the user with Firebase Admin SDK
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Optionally add the user to Firestore
    const userDoc = {
      uid: userRecord.uid,
      email: userRecord.email,
      name: displayName,
      role: "user", // Default role
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      emailVerified: userRecord.emailVerified,
    };

    await admin
      .firestore()
      .collection("users")
      .doc(userRecord.uid)
      .set(userDoc);

    return { success: true, uid: userRecord.uid };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating user:", error.message);
    } else {
      console.error("Unknown error occurred");
    }
  }
});

exports.syncUserDeletionFromFirestore = functions.firestore.onDocumentDeleted(
  "users/{uid}",
  async (event) => {
    const uid = event.params.uid; // Extract the UID from event params

    if (!uid) {
      console.error("No UID found in event params");
      return;
    }

    try {
      // Delete the user from Firebase Authentication
      await admin.auth().deleteUser(uid);
      console.log(
        `Successfully deleted user with UID: ${uid} from Firebase Authentication`
      );
    } catch (error) {
      console.error("Error deleting user from Firebase Authentication:", error);
    }
  }
);
