import React, { useState } from 'react';
import { Database, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, signup, demoLogin, guestLogin } = useAuth();
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  const [errorCode, setErrorCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorCode(null);
    setLoading(true);

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError('Please enter your email and password.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUpMode) {
        await signup(cleanEmail, password);
      } else {
        await login(cleanEmail, password);
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err?.code, err?.message);
      const code = err?.code || '';
      setErrorCode(code);
      let msg = err?.message || 'Authentication failed.';

      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        msg = 'Invalid email or password. If you haven\'t created an account with this email yet, click "Register New Account" below.';
      } else if (code === 'auth/user-not-found') {
        msg = 'No account found with this email in Firebase. Would you like to register it now?';
      } else if (code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Click "Sign In" below to log in.';
      } else if (code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters long.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Too many failed attempts. Access temporarily locked for security. You can use Instant Admin Demo Mode below.';
      } else if (code === 'auth/operation-not-allowed') {
        msg = 'Email/Password sign-in is not enabled in Firebase Console. Please use Instant Admin Demo Mode below.';
      } else if (code === 'auth/network-request-failed') {
        msg = 'Network connection failed. Please check your internet connection or try Instant Admin Demo Mode.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRegister = async () => {
    setError(null);
    setErrorCode(null);
    setLoading(true);
    try {
      await signup(email.trim(), password);
    } catch (err: any) {
      console.error('Quick register error:', err);
      setError(err?.message || 'Registration failed.');
      setIsSignUpMode(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Brand Decorative Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0B132B] text-blue-400 shadow-xl shadow-slate-300 mb-4">
          <Database className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Internal Medicine Workspace
        </h2>
        <p className="mt-2 text-sm text-slate-600 font-medium max-w-md mx-auto">
          Hospital Sultan Ismail
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Panel: Guest Mode */}
          <div className="bg-white hover:border-slate-300/80 border border-slate-200 shadow-lg shadow-slate-200/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300">
            <div className="space-y-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Clinical Guest Access</h3>
                <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mt-1">Read-Only Viewer Mode</p>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                type="button"
                onClick={guestLogin}
                className="w-full py-4 px-4 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 text-sm font-bold flex items-center justify-center gap-2 transition-all min-h-[48px] shadow-2xs hover:shadow-xs hover:scale-[1.01] active:scale-[0.99]"
              >
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Enter as Guest</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Admin Mode */}
          <div className="bg-white hover:border-slate-300/80 border border-slate-200 shadow-lg shadow-slate-200/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300">
            <div className="space-y-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Authorized Admin Portal</h3>
                <p className="text-xs text-violet-600 font-semibold uppercase tracking-wider mt-1">Full Operations Access</p>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(true)}
                className="w-full py-4 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all min-h-[48px] shadow-md hover:scale-[1.01] active:scale-[0.99]"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Admin Login</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Admin Login Modal / Popup */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-slate-950 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-extrabold tracking-wide uppercase">Admin Authentication</span>
              </div>
              <button
                onClick={() => { setIsAdminModalOpen(false); setError(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Container */}
            <div className="p-6 space-y-6">
              
              {/* Mode Switcher */}
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => { setIsSignUpMode(false); setError(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    !isSignUpMode 
                      ? 'bg-white text-slate-900 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUpMode(true); setError(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    isSignUpMode 
                      ? 'bg-white text-slate-900 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium space-y-2.5">
                  <p className="font-semibold">{error}</p>
                  
                  {!isSignUpMode && (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') && (
                    <div className="pt-1 flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={handleQuickRegister}
                        className="w-full text-left font-bold text-rose-900 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg transition-all text-xs flex items-center justify-between"
                      >
                        <span>Register "{email}" as a new account</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsSignUpMode(true); setError(null); }}
                        className="text-left font-medium text-rose-700 hover:underline text-[11px]"
                      >
                        Switch to Create Account form
                      </button>
                    </div>
                  )}

                  {isSignUpMode && errorCode === 'auth/email-already-in-use' && (
                    <button
                      type="button"
                      onClick={() => { setIsSignUpMode(false); setError(null); }}
                      className="font-bold underline text-rose-800 hover:text-rose-900 block pt-1"
                    >
                      Click here to switch to Sign In with "{email}"
                    </button>
                  )}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter admin email"
                      className="block w-full pl-10 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-slate-900 placeholder-slate-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter secure Password"
                      className="block w-full pl-10 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-slate-900 placeholder-slate-400 font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow-md transition-all disabled:opacity-50 min-h-[40px]"
                  >
                    {loading ? (
                      <span>Processing...</span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        {isSignUpMode ? 'Register Account' : 'Sign In'}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </div>
              </form>

              {/* Quick Demo Access Divider */}
              <div className="border-t border-slate-200 pt-4 space-y-2">
                <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                  Or bypass credentials with Admin Demo
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminModalOpen(false);
                    demoLogin();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 transition-all min-h-[40px]"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Instant Admin Demo Mode</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
