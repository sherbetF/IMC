import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInAnonymously,
  setPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export const ADMIN_UID = 'ogTzhERlbpPhRFsicEkdUCvma1S2';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  demoLogin: () => void;
  guestLogin: () => void;
  isDemoUser: boolean;
  isGuest: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  useEffect(() => {
    // Set persistence to browserSessionPersistence to avoid persisting across different window sessions
    setPersistence(auth, browserSessionPersistence).catch((err) => {
      console.warn('Could not set persistence to session:', err);
    });

    // If there is no active session flag in sessionStorage, force sign out to require logging in first
    const sessionActive = sessionStorage.getItem('logged_in_session');
    if (!sessionActive) {
      sessionStorage.removeItem('outsource_db_demo_user');
      sessionStorage.removeItem('outsource_db_guest_user');
      firebaseSignOut(auth).then(() => {
        setCurrentUser(null);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
      return;
    }

    // Check if guest session exists in sessionStorage
    const savedGuest = sessionStorage.getItem('outsource_db_guest_user');
    if (savedGuest === 'true') {
      setIsGuest(true);
      setCurrentUser({
        uid: 'guest-user-uid',
        email: 'guest@outsourcedb.med',
        displayName: 'Guest User',
        emailVerified: true,
        isAnonymous: true,
        metadata: {},
        providerData: [],
        refreshToken: '',
        tenantId: null,
        delete: async () => {},
        getIdToken: async () => 'guest-token',
        getIdTokenResult: async () => ({} as any),
        reload: async () => {},
        toJSON: () => ({})
      } as unknown as User);
      setLoading(false);
      return;
    }

    // Check if demo session exists in sessionStorage
    const savedDemo = sessionStorage.getItem('outsource_db_demo_user');
    if (savedDemo === 'true') {
      setIsDemoUser(true);
      setCurrentUser({
        uid: 'demo-admin-uid',
        email: 'doctor@outsourcedb.med',
        displayName: 'Medical Administrator',
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: '',
        tenantId: null,
        delete: async () => {},
        getIdToken: async () => 'demo-token',
        getIdTokenResult: async () => ({} as any),
        reload: async () => {},
        toJSON: () => ({})
      } as unknown as User);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous) {
        setIsDemoUser(false);
        setIsGuest(false);
        setCurrentUser(user);
      } else {
        setCurrentUser(user);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, pass: string) => {
    setIsDemoUser(false);
    setIsGuest(false);
    sessionStorage.removeItem('outsource_db_demo_user');
    sessionStorage.removeItem('outsource_db_guest_user');
    await signInWithEmailAndPassword(auth, email.trim(), pass);
    sessionStorage.setItem('logged_in_session', 'true');
  };

  const signup = async (email: string, pass: string) => {
    setIsDemoUser(false);
    setIsGuest(false);
    sessionStorage.removeItem('outsource_db_demo_user');
    sessionStorage.removeItem('outsource_db_guest_user');
    await createUserWithEmailAndPassword(auth, email.trim(), pass);
    sessionStorage.setItem('logged_in_session', 'true');
  };

  const logout = async () => {
    sessionStorage.removeItem('logged_in_session');
    sessionStorage.removeItem('outsource_db_demo_user');
    sessionStorage.removeItem('outsource_db_guest_user');
    if (isDemoUser || isGuest) {
      setIsDemoUser(false);
      setIsGuest(false);
      setCurrentUser(null);
      return;
    }
    await firebaseSignOut(auth);
  };

  const demoLogin = () => {
    setIsDemoUser(true);
    setIsGuest(false);
    sessionStorage.removeItem('outsource_db_guest_user');
    sessionStorage.setItem('outsource_db_demo_user', 'true');
    sessionStorage.setItem('logged_in_session', 'true');
    setCurrentUser({
      uid: 'demo-admin-uid',
      email: 'doctor@outsourcedb.med',
      displayName: 'Medical Administrator',
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'demo-token',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({})
    } as unknown as User);
  };

  const guestLogin = () => {
    setIsGuest(true);
    setIsDemoUser(false);
    sessionStorage.removeItem('outsource_db_demo_user');
    sessionStorage.setItem('outsource_db_guest_user', 'true');
    sessionStorage.setItem('logged_in_session', 'true');
    setCurrentUser({
      uid: 'guest-user-uid',
      email: 'guest@outsourcedb.med',
      displayName: 'Guest User',
      emailVerified: true,
      isAnonymous: true,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'guest-token',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({})
    } as unknown as User);
  };

  const isAdmin = !isGuest && (isDemoUser || !!(currentUser && !currentUser.isAnonymous) || currentUser?.uid === ADMIN_UID);

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, logout, demoLogin, guestLogin, isDemoUser, isGuest, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
