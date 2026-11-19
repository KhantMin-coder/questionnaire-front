import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sun, Moon, LogOut, LayoutDashboard, GitFork, ClipboardList } from 'lucide-react';
import type { SurveyItem } from '../types/builder';
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

  const [activeSurveyTitle, setActiveSurveyTitle] = useState<string>('');
  const [activeSurveyId, setActiveSurveyId] = useState<string | null>(null);

  useEffect(() => {
    const updateActiveContext = () => {
      const activeId = localStorage.getItem('resonator_active_survey_id');
      const saved = localStorage.getItem('resonator_surveys');
      
      let title = '';
      let targetId: string | null = activeId;

      if (saved) {
        try {
          const parsed: unknown = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const surveys = parsed as SurveyItem[];
            // Fallback if no active survey context is stored yet
            if (!targetId && surveys.length > 0) {
              targetId = surveys[0].id;
            }
            const activeSurvey = surveys.find((s: SurveyItem) => s.id === targetId);
            if (activeSurvey) {
              title = activeSurvey.title;
            }
          }
        } catch {
          // ignore
        }
      }

      setActiveSurveyId(targetId);
      setActiveSurveyTitle(title ? (title.length > 12 ? title.substring(0, 12) + '...' : title) : '');
    };

    updateActiveContext();

    window.addEventListener('active_survey_changed', updateActiveContext);
    window.addEventListener('storage', updateActiveContext);

    return () => {
      window.removeEventListener('active_survey_changed', updateActiveContext);
      window.removeEventListener('storage', updateActiveContext);
    };
  }, [location.pathname]);

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
              if (activeSurveyId) {
                navigate(`/builder/${activeSurveyId}`);
              }
            }}
            className={`btn navbar-link ${currentTab === 'builder' ? 'btn-primary' : 'btn-secondary'}`}
            disabled={!activeSurveyId}
          >
            <GitFork size={16} />
            Visual Builder {activeSurveyTitle ? `(${activeSurveyTitle})` : ''}
          </button>
          <button
            onClick={() => {
              if (activeSurveyId) {
                navigate(`/survey/${activeSurveyId}`);
              }
            }}
            className={`btn navbar-link ${currentTab === 'runner' ? 'btn-primary' : 'btn-secondary'}`}
            disabled={!activeSurveyId}
          >
            <ClipboardList size={16} />
            Survey Runner {activeSurveyTitle ? `(${activeSurveyTitle})` : ''}
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
