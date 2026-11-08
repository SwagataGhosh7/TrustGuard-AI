import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { auth, loginWithGoogle, logoutUser } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  canAccessCommunityIntelligence: boolean;
  signIn: () => Promise<User | null>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isGuest: true,
  canAccessCommunityIntelligence: false,
  signIn: async () => null,
  signOut: async () => {},
  continueAsGuest: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check initial guest choice from storage
    if (typeof window !== "undefined") {
      const storedGuest = localStorage.getItem("trustguard_guest_mode");
      if (storedGuest === "true") {
        setIsGuest(true);
      }
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          setIsGuest(false);
          if (typeof window !== "undefined") {
            localStorage.removeItem("trustguard_guest_mode");
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error("Auth state error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      setUser(loggedUser);
      setIsGuest(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem("trustguard_guest_mode");
      }
      return loggedUser;
    } catch (err) {
      console.error("Sign-in failed:", err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsGuest(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("trustguard_guest_mode", "true");
      }
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("trustguard_guest_mode", "true");
    }
  };

  const canAccessCommunityIntelligence = Boolean(user && !isGuest);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest,
        canAccessCommunityIntelligence,
        signIn,
        signOut,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
