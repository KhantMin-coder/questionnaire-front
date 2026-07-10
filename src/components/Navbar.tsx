import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sun, Moon, LogOut, LayoutDashboard, GitFork, ClipboardList } from 'lucide-react';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = (): void => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Determine currentTab from URL path
  const currentTab = location.pathname.startsWith('/dashboard') 
    ? 'dashboard' 
    : location.pathname.startsWith('/builder') 
    ? 'builder' 
    : location.pathname.startsWith('/survey') 
    ? 'runner' 
    : '';

  return (
    <header className="glass-panel navbar-header">
      <div 
        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
        className="navbar-brand"
      >
        <div className="navbar-logo-icon">
          R
        </div>
        <span className="navbar-brand-text">
          Resonator
        </span>
      </div>

      {isAuthenticated && (
        <nav className="navbar-nav">
          <button
            onClick={() => navigate('/dashboard')}
            className={`btn navbar-link ${currentTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>
          <button
            onClick={() => {
              // Try to find the last edited survey ID, otherwise fallback to dev-exp
              const saved = localStorage.getItem('resonator_surveys');
              let targetId = 'dev-exp';
              if (saved) {
                try {
                  const surveys = JSON.parse(saved);
                  if (surveys.length > 0) {
                    targetId = surveys[0].id;
                  }
                } catch (e) {
                  // ignore
                }
              }
              navigate(`/builder/${targetId}`);
            }}
            className={`btn navbar-link ${currentTab === 'builder' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <GitFork size={16} />
            Visual Builder
          </button>
          <button
            onClick={() => {
              const saved = localStorage.getItem('resonator_surveys');
              let targetId = 'dev-exp';
              if (saved) {
                try {
                  const surveys = JSON.parse(saved);
                  if (surveys.length > 0) {
                    targetId = surveys[0].id;
                  }
                } catch (e) {
                  // ignore
                }
              }
              navigate(`/survey/${targetId}`);
            }}
            className={`btn navbar-link ${currentTab === 'runner' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ClipboardList size={16} />
            Survey Runner
          </button>
        </nav>
      )}

      <div className="navbar-actions">
        {!isAuthenticated && (
          <div className="navbar-auth-group">
            <button
              onClick={() => navigate('/login', { state: { register: false } })}
              className="btn btn-secondary navbar-auth-btn"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login', { state: { register: true } })}
              className="btn btn-primary navbar-auth-btn"
            >
              Register
            </button>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="btn btn-secondary navbar-theme-toggle"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {isAuthenticated && user && (
          <div className="navbar-user-info">
            <span className="navbar-user-name">
              {user.name}
            </span>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="btn btn-secondary navbar-logout-btn"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
