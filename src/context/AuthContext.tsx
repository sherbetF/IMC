import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInAnonymously
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
  isDemoUser: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);

  useEffect(() => {
    // Check if demo session exists in localStorage
    const savedDemo = localStorage.getItem('outsource_db_demo_user');
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

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsDemoUser(false);
        setCurrentUser(user);
        setLoading(false);
      } else {
        // Automatically sign in anonymously so Firebase Storage and Firestore uploads work seamlessly
        try {
          const anonCred = await signInAnonymously(auth);
          setCurrentUser(anonCred.user);
        } catch (err) {
          console.warn('Anonymous Firebase auth notice:', err);
          setCurrentUser(null);
        } finally {
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, pass: string) => {
    setIsDemoUser(false);
    localStorage.removeItem('outsource_db_demo_user');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string) => {
    setIsDemoUser(false);
    localStorage.removeItem('outsource_db_demo_user');
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    if (isDemoUser) {
      setIsDemoUser(false);
      localStorage.removeItem('outsource_db_demo_user');
      setCurrentUser(null);
      return;
    }
    await firebaseSignOut(auth);
  };

  const demoLogin = () => {
    setIsDemoUser(true);
    localStorage.setItem('outsource_db_demo_user', 'true');
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

  const isAdmin = currentUser?.uid === ADMIN_UID || isDemoUser;

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, logout, demoLogin, isDemoUser, isAdmin }}>
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
