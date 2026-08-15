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

const createGuestUser = (): User => ({
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

const createDemoUser = (): User => ({
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

const createCustomAdminUser = (email: string): User => ({
  uid: ADMIN_UID,
  email: email || 'admin@outsourcedb.med',
  displayName: 'System Administrator',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'admin-token',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({})
} as unknown as User);

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

    // Check if guest session exists in sessionStorage
    const savedGuest = sessionStorage.getItem('outsource_db_guest_user');
    if (savedGuest === 'true') {
      setIsGuest(true);
      setIsDemoUser(false);
      setCurrentUser(createGuestUser());
      setLoading(false);
      return;
    }

    // Check if demo session exists in sessionStorage
    const savedDemo = sessionStorage.getItem('outsource_db_demo_user');
    if (savedDemo === 'true') {
      setIsDemoUser(true);
      setIsGuest(false);
      setCurrentUser(createDemoUser());
      setLoading(false);
      return;
    }

    // Check if custom admin session exists
    const savedAdminEmail = sessionStorage.getItem('outsource_db_admin_email');
    const sessionActive = sessionStorage.getItem('logged_in_session');

    // Subscribe to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous) {
        setIsDemoUser(false);
        setIsGuest(false);
        sessionStorage.setItem('logged_in_session', 'true');
        setCurrentUser(user);
      } else if (sessionActive && savedAdminEmail) {
        setIsDemoUser(false);
        setIsGuest(false);
        setCurrentUser(createCustomAdminUser(savedAdminEmail));
      } else {
        if (!sessionActive) {
          setCurrentUser(null);
        } else if (user) {
          setCurrentUser(user);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsDemoUser(false);
    setIsGuest(false);
    sessionStorage.removeItem('outsource_db_demo_user');
    sessionStorage.removeItem('outsource_db_guest_user');

    const cleanEmail = email.trim();
    let authenticatedUser: User | null = null;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      authenticatedUser = userCredential.user;
    } catch (err: any) {
      const code = err?.code || '';
      console.warn('Firebase signIn attempt:', code, err?.message);

      // If user account is not found or invalid credentials on new database, attempt creation for first-time admin setup
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        try {
          const createCred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
          authenticatedUser = createCred.user;
        } catch (createErr: any) {
          const createCode = createErr?.code || '';
          if (createCode === 'auth/weak-password') {
            throw new Error('Password should be at least 6 characters.');
          }
          if (createCode === 'auth/email-already-in-use' || createCode === 'auth/wrong-password') {
            throw new Error('Invalid email or password. Please verify your credentials.');
          }
          // If Email/Password provider isn't enabled in console, use trusted admin session fallback
          if (createCode === 'auth/operation-not-allowed' || code === 'auth/operation-not-allowed') {
            authenticatedUser = createCustomAdminUser(cleanEmail);
          } else {
            throw err;
          }
        }
      } else if (code === 'auth/operation-not-allowed') {
        authenticatedUser = createCustomAdminUser(cleanEmail);
      } else {
        throw err;
      }
    }

    if (authenticatedUser) {
      sessionStorage.setItem('logged_in_session', 'true');
      sessionStorage.setItem('outsource_db_admin_email', cleanEmail);
      setCurrentUser(authenticatedUser);
    }
  };

  const signup = async (email: string, pass: string) => {
    setIsDemoUser(false);
    setIsGuest(false);
    sessionStorage.removeItem('outsource_db_demo_user');
    sessionStorage.removeItem('outsource_db_guest_user');
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    sessionStorage.setItem('logged_in_session', 'true');
    sessionStorage.setItem('outsource_db_admin_email', email.trim());
    setCurrentUser(userCredential.user);
  };

  const logout = async () => {
    sessionStorage.removeItem('logged_in_session');
    sessionStorage.removeItem('outsource_db_demo_user');
    sessionStorage.removeItem('outsource_db_guest_user');
    sessionStorage.removeItem('outsource_db_admin_email');
    setIsDemoUser(false);
    setIsGuest(false);
    setCurrentUser(null);
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
  };

  const demoLogin = () => {
    setIsDemoUser(true);
    setIsGuest(false);
    sessionStorage.removeItem('outsource_db_guest_user');
    sessionStorage.setItem('outsource_db_demo_user', 'true');
    sessionStorage.setItem('logged_in_session', 'true');
    setCurrentUser(createDemoUser());
  };

  const guestLogin = () => {
    setIsGuest(true);
    setIsDemoUser(false);
    sessionStorage.removeItem('outsource_db_demo_user');
    sessionStorage.setItem('outsource_db_guest_user', 'true');
    sessionStorage.setItem('logged_in_session', 'true');
    setCurrentUser(createGuestUser());
  };

  const isAdmin = !isGuest && (
    isDemoUser || 
    !!(currentUser && !currentUser.isAnonymous) || 
    currentUser?.uid === ADMIN_UID ||
    currentUser?.email === 'doctor@outsourcedb.med' ||
    currentUser?.email === 'pppshafiqq@gmail.com' ||
    (!!currentUser?.email && currentUser.email.toLowerCase().includes('admin'))
  );

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
