import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, ArrowUpRight } from 'lucide-react';
import type { SurveyItem } from '../../types/builder';

interface DashboardListProps {
  surveys: SurveyItem[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: 'all' | 'published' | 'draft' | 'archived';
  setStatusFilter: (f: 'all' | 'published' | 'draft' | 'archived') => void;
  handleCreateSurvey: () => void;
  setSelectedSurveyId: (id: string) => void;
}

export const DashboardList: React.FC<DashboardListProps> = ({
  surveys,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  handleCreateSurvey,
  setSelectedSurveyId
}) => {
  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-list-layout">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Research Analytics</h1>
          <p className="dashboard-subtitle">Manage, monitor, and audit your branching questionnaires.</p>
        </div>
        <button onClick={handleCreateSurvey} className="btn btn-primary flex-row-center dashboard-create-btn">
          <Plus size={16} /> Create Survey
        </button>
      </div>

      <div className="dashboard-toolbar">
        <div className="dashboard-search-wrapper">
          <Search size={16} className="dashboard-search-icon" />
          <input
            type="text"
            placeholder="Search surveys..."
            className="form-input dashboard-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="dashboard-filter-group">
          {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`dashboard-filter-btn ${statusFilter === status ? 'dashboard-filter-btn--active' : ''}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredSurveys.length > 0 ? (
        <div className="dashboard-grid">
          {filteredSurveys.map((survey) => (
            <motion.div
              key={survey.id}
              onClick={() => setSelectedSurveyId(survey.id)}
              whileHover={{ y: -4, scale: 1.01, boxShadow: 'var(--shadow-md)' }}
              className="glass-panel dashboard-card"
            >
              <div className="dashboard-card-header">
                <span className={`dashboard-status-badge dashboard-status-badge--${survey.status}`}>
                  {survey.status.toUpperCase()}
                </span>
                <span className="text-muted-xs">Modified {survey.lastModified}</span>
              </div>

              <div>
                <h3 className="dashboard-card-title">{survey.title}</h3>
              </div>

              <div className="dashboard-card-stats">
                <div>
                  <div className="dashboard-stat-val">{survey.kpis?.[0].value || '0'}</div>
                  <div className="dashboard-stat-lbl">Responses</div>
                </div>
                <div className="dashboard-divider-y" />
                <div>
                  <div className="dashboard-stat-val">{survey.kpis?.[1].value || '0%'}</div>
                  <div className="dashboard-stat-lbl">Completion</div>
                </div>
              </div>

              <div className="dashboard-card-footer">
                <span>View Analytics</span>
                <ArrowUpRight size={16} />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="dashboard-empty">No surveys match your filter or search query.</div>
      )}
    </div>
  );
};
