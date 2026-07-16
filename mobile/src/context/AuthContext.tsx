import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  getIdToken,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import api from '../services/api';
import type { ApiResponse, UserProfile, SyncProfileRequest } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  profile: UserProfile | null;
  refreshProfile: () => Promise<void>;
  syncProfile: (data: SyncProfileRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    try {
      return await getIdToken(auth.currentUser);
    } catch {
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<UserProfile>>('/users/me');
      if (res.data.success && res.data.data) {
        setProfile(res.data.data);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [user, refreshProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setProfile(null);
  }, []);

  const syncProfile = useCallback(async (data: SyncProfileRequest) => {
    const res = await api.post<ApiResponse<UserProfile>>('/users/me', data);
    if (res.data.success && res.data.data) {
      setProfile(res.data.data);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        getToken,
        profile,
        refreshProfile,
        syncProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
