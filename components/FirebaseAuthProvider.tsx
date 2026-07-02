"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { signIntoFirebaseWithClerk } from "@/lib/firebaseAuth";

export function FirebaseAuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isSignedIn, isLoaded } = useAuth();
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      // Public pages don't need Firebase Auth
      setFirebaseReady(true);
      return;
    }

    signIntoFirebaseWithClerk()
      .then(() => setFirebaseReady(true))
      .catch((err) => {
        console.error("Firebase auth error:", err);
        // Still render — Firestore rules will block unauthorised access
        setFirebaseReady(true);
      });
  }, [isLoaded, isSignedIn]);

  if (!firebaseReady) return null;

  return <>{children}</>;
}
