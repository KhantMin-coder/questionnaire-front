import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { ParticleCanvas } from '../components/ParticleCanvas';
import './Login.css';

interface LoginLocationState {
  register?: boolean;
  from?: { pathname: string };
}

// Helper hook to watch document.documentElement theme class changes
const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (root.classList.contains('light-theme')) return 'light';
      if (root.classList.contains('dark-theme')) return 'dark';
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const observer = new MutationObserver(() => {
      const isLight = root.classList.contains('light-theme');
      setTheme(isLight ? 'light' : 'dark');
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
};

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const theme = useTheme();

  // Extract isRegister from location state safely
  useEffect(() => {
    const state = location.state as LoginLocationState | null;
    if (state && state.register !== undefined) {
      setIsRegister(state.register);
    }
  }, [location.state]);

  // Redirect if already authenticated safely
  useEffect(() => {
    if (isAuthenticated) {
      const state = location.state as LoginLocationState | null;
      const from = state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isRegister && !name)) {
      setError('Please fill in all fields');
      return;
    }

    // Mock API Auth Call
    const mockToken = 'mock_jwt_token_' + Math.random().toString(36).substr(2);
    const mockUser = {
      id: 'usr_' + Date.now(),
      email: email,
      name: isRegister ? name : email.split('@')[0],
    };

    login(mockToken, mockUser);
  };

  return (
    <div className="login-wrapper">
      <div className="login-background-animation">
        <ParticleCanvas theme={theme} />
      </div>

      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass-panel login-card"
      >
        {/* Glow Element */}
        <div className="login-glow-bg" />

        <div className="login-card-content">
          <div className="login-header-group">
            <div className="login-header-badge">
              Research & Surveys
            </div>
            <h1 className="login-title">
              <AnimatePresence mode="wait">
                <motion.span
                  key={isRegister ? 'register-title' : 'login-title'}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="display-inline-block"
                >
                  {isRegister ? (
                    <>
                      Create your new <span className="login-title-accent">account</span>
                    </>
                  ) : (
                    <>
                      Welcome back to <span className="login-title-accent">Resonator</span>
                    </>
                  )}
                </motion.span>
              </AnimatePresence>
            </h1>
            <p className="login-sub">
              <AnimatePresence mode="wait">
                <motion.span
                  key={isRegister ? 'register-sub' : 'login-sub'}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="display-inline-block"
                >
                  {isRegister
                    ? 'Join Resonator to build dynamic research flows.'
                    : 'Sign in to access your questionnaire dashboard.'}
                </motion.span>
              </AnimatePresence>
            </p>
          </div>

          {error && (
            <div className="login-error-msg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <AnimatePresence initial={false}>
              {isRegister && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{
                    opacity: 1,
                    height: 'auto',
                    marginBottom: 20,
                    transition: { duration: 0.3, ease: 'easeOut' }
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    marginBottom: 0,
                    transition: { duration: 0.2, ease: 'easeIn' }
                  }}
                  className="form-group overflow-hidden"
                >
                  <label className="form-label" htmlFor="name-input">Full Name</label>
                  <div className="login-input-wrapper">
                    <User size={18} className="login-input-icon" />
                    <input
                      id="name-input"
                      type="text"
                      className="form-input login-input-field"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="form-group">
              <label className="form-label" htmlFor="email-input">Email Address</label>
              <div className="login-input-wrapper">
                <Mail size={18} className="login-input-icon" />
                <input
                  id="email-input"
                  type="email"
                  className="form-input login-input-field"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group login-password-group">
              <label className="form-label" htmlFor="password-input">Password</label>
              <div className="login-input-wrapper">
                <Lock size={18} className="login-input-icon" />
                <input
                  id="password-input"
                  type="password"
                  className="form-input login-input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary login-submit-btn">
              <AnimatePresence mode="wait">
                <motion.span
                  key={isRegister ? 'register-btn' : 'login-btn'}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-row-center flex-gap-sm width-full justify-center"
                >
                  {isRegister ? 'Register' : 'Sign In'}
                  <ArrowRight size={18} />
                </motion.span>
              </AnimatePresence>
            </button>
          </form>

          <div className="login-toggle-footer">
            <span className="login-toggle-text">
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="login-toggle-btn"
            >
              {isRegister ? 'Sign In' : 'Register now'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
