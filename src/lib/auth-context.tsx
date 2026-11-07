import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  provider: "firebase" | "github" | "google";
  role: "contributor" | "analyst";
}

interface AuthContextType {
  isAuthenticated: boolean;
  isGuest: boolean;
  user: AuthUser | null;
  // Sign in with Firebase simulation / bridge (prepares for Firebase Auth)
  signInWithFirebase: (credentials?: {
    email?: string;
    password?: string;
    provider?: "github" | "google" | "email";
  }) => Promise<void>;
  // Continue as guest
  continueAsGuest: () => void;
  // Sign out / reset back to MLH landing gate
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "trustguard_auth_state";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Load saved session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isGuest) {
          setIsGuest(true);
          setIsAuthenticated(false);
          setUser(null);
        } else if (parsed.isAuthenticated && parsed.user) {
          setIsAuthenticated(true);
          setIsGuest(false);
          setUser(parsed.user);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const signInWithFirebase = async (credentials?: {
    email?: string;
    password?: string;
    provider?: "github" | "google" | "email";
  }) => {
    // Simulated realistic Firebase Authentication flow (ready for direct Firebase config injection)
    await new Promise((resolve) => setTimeout(resolve, 600));

    const email = credentials?.email || "swagataghosh538@gmail.com";
    const provider = credentials?.provider || (email.includes("github") ? "github" : "firebase");
    const name = email.split("@")[0] || "Security Hacker";

    const authenticatedUser: AuthUser = {
      uid: "usr_fb_" + Math.random().toString(36).substring(2, 9),
      email,
      displayName: name.charAt(0).toUpperCase() + name.slice(1),
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      provider: provider === "github" ? "github" : "firebase",
      role: "contributor",
    };

    setUser(authenticatedUser);
    setIsAuthenticated(true);
    setIsGuest(false);

    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ isAuthenticated: true, isGuest: false, user: authenticatedUser }),
      );
    } catch {
      // ignore storage error
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setIsAuthenticated(false);
    setUser(null);
    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ isAuthenticated: false, isGuest: true, user: null }),
      );
    } catch {
      // ignore
    }
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setIsGuest(false);
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isGuest,
        user,
        signInWithFirebase,
        continueAsGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
