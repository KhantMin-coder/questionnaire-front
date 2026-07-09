import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import './Login.css';

interface LoginLocationState {
  register?: boolean;
  from?: { pathname: string };
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Extract isRegister from location state safely without 'any'
  useEffect(() => {
    const state = location.state as LoginLocationState | null;
    if (state && state.register !== undefined) {
      setIsRegister(state.register);
    }
  }, [location.state]);

  // Redirect if already authenticated safely without 'any'
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
    <div className="dotted-canvas login-wrapper">
      <motion.div
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
              {isRegister ? (
                <>
                  Create your new <span className="login-title-accent">account</span>
                </>
              ) : (
                <>
                  Welcome back to <span className="login-title-accent">Resonator</span>
                </>
              )}
            </h1>
            <p className="login-sub">
              {isRegister 
                ? 'Join Resonator to build dynamic research flows.' 
                : 'Sign in to access your questionnaire dashboard.'}
            </p>
          </div>

          {error && (
            <div className="login-error-msg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
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
              </div>
            )}

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
              {isRegister ? 'Register' : 'Sign In'}
              <ArrowRight size={18} />
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
