import { getAuth, signInWithCustomToken } from "firebase/auth";
import app from "@/firebase";

let signInPromise: Promise<void> | null = null;

export async function signIntoFirebaseWithClerk(): Promise<void> {
  // Prevent multiple concurrent sign-in attempts
  if (signInPromise !== null) return signInPromise;

  const auth = getAuth(app);

  // Already signed in — nothing to do
  if (auth.currentUser) return;

  signInPromise = (async () => {
    try {
      const res = await fetch("/api/firebase-token");
      if (!res.ok) throw new Error("Failed to fetch Firebase token");

      const { firebaseToken } = await res.json();
      await signInWithCustomToken(auth, firebaseToken);
    } finally {
      signInPromise = null;
    }
  })();

  return signInPromise;
}
