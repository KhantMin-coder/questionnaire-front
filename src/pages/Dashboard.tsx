import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Share2, GitFork, QrCode, Copy, Check, FileText, Trash2 } from 'lucide-react';

import { mockSurveys, mockSurveyGraphs } from './dashboard/constants';
import { DashboardList } from './dashboard/DashboardList';
import { DashboardOverview } from './dashboard/DashboardOverview';
import { DashboardLogicBreakdown } from './dashboard/DashboardLogicBreakdown';
import { DashboardQuestionBreakdown } from './dashboard/DashboardQuestionBreakdown';
import { DashboardResponses } from './dashboard/DashboardResponses';
import { DashboardLogs } from './dashboard/DashboardLogs';
import type { SurveyItem } from '../types/builder';
import './Dashboard.css';

const seedDefaultGraphs = (): void => {
  Object.entries(mockSurveyGraphs).forEach(([surveyId, graphData]) => {
    if (!localStorage.getItem(`resonator_graph_${surveyId}`)) {
      localStorage.setItem(`resonator_graph_${surveyId}`, JSON.stringify(graphData));
    }
  });
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<SurveyItem[]>(() => {
    seedDefaultGraphs();
    const saved = localStorage.getItem('resonator_surveys');
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed as SurveyItem[];
        }
      } catch {
        // ignore corrupt storage
      }
    }
    localStorage.setItem('resonator_surveys', JSON.stringify(mockSurveys));
    return mockSurveys;
  });

  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'logic' | 'breakdown' | 'responses' | 'logs'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('7d');
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const selectedSurvey = surveys.find(s => s.id === selectedSurveyId);

  const handleCopyLink = (): void => {
    if (!selectedSurveyId) return;
    const shareUrl = `${window.location.origin}/survey/${encodeURIComponent(selectedSurveyId)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = (): void => {
    if (!selectedSurveyId) return;
    const embedUrl = `${window.location.origin}/survey/${encodeURIComponent(selectedSurveyId)}`;
    navigator.clipboard.writeText(
      `<iframe src="${embedUrl}" width="100%" height="600" style="border:0;" sandbox="allow-scripts allow-forms allow-same-origin" loading="lazy" title="Resonator Survey"></iframe>`
    );
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleCreateSurvey = (): void => {
    const newId = 'survey_' + Date.now();
    const newSurvey: SurveyItem = {
      id: newId,
      title: 'Untitled Questionnaire',
      status: 'draft',
      lastModified: 'Just now',
      kpis: [
        { label: 'Total Responses', value: '0', change: '0%', icon: 'Users' },
        { label: 'Completion Rate', value: '0%', change: '0%', icon: 'Percent' },
        { label: 'Avg. Finish Time', value: '0s', change: '0s', icon: 'Clock' },
        { label: 'Follow-ups Triggered', value: '0', change: '0% email rate', icon: 'CheckCircle' }
      ],
      timeline: [],
      dropOff: [],
      pie: [],
      questions: [],
      logs: []
    };

    const updatedSurveys = [newSurvey, ...surveys];
    setSurveys(updatedSurveys);
    localStorage.setItem('resonator_surveys', JSON.stringify(updatedSurveys));
    localStorage.setItem('resonator_active_survey_id', newId);
    window.dispatchEvent(new Event('active_survey_changed'));
    navigate(`/builder/${newId}`);
  };

  const handleDeleteSurvey = (): void => {
    if (!selectedSurveyId) return;
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this questionnaire? All collected responses and routing rules will be permanently lost.'
    );
    if (isConfirmed) {
      const updated = surveys.filter(s => s.id !== selectedSurveyId);
      setSurveys(updated);
      localStorage.setItem('resonator_surveys', JSON.stringify(updated));
      localStorage.removeItem(`resonator_graph_${selectedSurveyId}`);
      localStorage.removeItem(`resonator_runner_progress_${selectedSurveyId}`);
      
      const activeId = localStorage.getItem('resonator_active_survey_id');
      if (activeId === selectedSurveyId) {
        localStorage.removeItem('resonator_active_survey_id');
      }
      window.dispatchEvent(new Event('active_survey_changed'));
      setSelectedSurveyId(null);
    }
  };

  const handleReseedData = (): void => {
    const isConfirmed = window.confirm(
      'Are you sure you want to reset all questionnaires back to their initial demo seed data? Any drafts or custom changes will be overwritten.'
    );
    if (isConfirmed) {
      localStorage.setItem('resonator_surveys', JSON.stringify(mockSurveys));
      Object.entries(mockSurveyGraphs).forEach(([surveyId, graphData]) => {
        localStorage.setItem(`resonator_graph_${surveyId}`, JSON.stringify(graphData));
      });
      setSurveys(mockSurveys);
      localStorage.removeItem('resonator_active_survey_id');
      window.dispatchEvent(new Event('active_survey_changed'));
      setSelectedSurveyId(null);
    }
  };

  const totalResponseCount = parseInt(
    (selectedSurvey?.kpis?.[0]?.value || '0').replace(/,/g, ''),
    10
  );

  return (
    <div className="dashboard-container">
      <AnimatePresence mode="wait">
        {!selectedSurveyId ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <DashboardList
              surveys={surveys}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              handleCreateSurvey={handleCreateSurvey}
              setSelectedSurveyId={(id) => {
                setSelectedSurveyId(id);
                setActiveTab('overview');
                localStorage.setItem('resonator_active_survey_id', id);
                window.dispatchEvent(new Event('active_survey_changed'));
              }}
              handleReseedData={handleReseedData}
            />
          </motion.div>
        ) : selectedSurvey ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="flex-column flex-gap-xl"
          >
            <div className="flex-row-center flex-gap-sm">
              <button onClick={() => setSelectedSurveyId(null)} className="dashboard-back-btn">
                <ArrowLeft size={16} /> Back to Surveys
              </button>
            </div>

            <div className="flex-row-center-between flex-wrap flex-gap-lg">
              <div>
                <h1 className="dashboard-title-detail">{selectedSurvey.title}</h1>
                <p className="dashboard-subtitle">Detailed analysis and respondent scheduling status.</p>
              </div>

              <div className="flex-row-center flex-gap-md">
                <span className={`glass-panel dashboard-status-badge-detailed dashboard-status-badge-detailed--${selectedSurvey.status}`}>
                  ● {selectedSurvey.status === 'published' ? 'Active & Collecting' : selectedSurvey.status === 'draft' ? 'Draft Mode' : 'Archived'}
                </span>
                <button onClick={() => setShowSharePanel(!showSharePanel)} className="btn btn-secondary flex-row-center dashboard-btn-sm">
                  <Share2 size={14} /> Share
                </button>
                <button onClick={() => navigate(`/builder/${selectedSurveyId}`)} className="btn btn-secondary flex-row-center dashboard-btn-sm">
                  <GitFork size={14} /> Edit Flow
                </button>
                <button onClick={handleDeleteSurvey} className="btn btn-danger flex-row-center dashboard-btn-sm">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showSharePanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="glass-panel dashboard-grid-panel">
                    <div className="flex-column flex-gap-sm">
                      <span className="dashboard-label-sm-bold">Survey Link</span>
                      <div className="flex-row-center flex-gap-sm">
                        <div className="dashboard-link-box">{`${window.location.origin}/survey/${selectedSurveyId}`}</div>
                        <button onClick={handleCopyLink} className="btn btn-secondary flex-row-center dashboard-copy-btn">
                          {copiedLink ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                        </button>
                      </div>
                    </div>
                    <div className="flex-column flex-gap-sm flex-align-center">
                      <span className="dashboard-label-sm-bold">QR Code</span>
                      <div className="dashboard-qr-box">
                        <QrCode size={40} color="var(--text-muted)" />
                      </div>
                      <span className="text-muted-xs font-size-xs">Scan to open survey</span>
                    </div>
                    <div className="flex-column flex-gap-sm">
                      <span className="dashboard-label-sm-bold">Embed Code</span>
                      <div className="dashboard-embed-code">{`<iframe src="${window.location.origin}/survey/${selectedSurveyId}" sandbox="allow-scripts allow-forms allow-same-origin" ...>`}</div>
                      <button onClick={handleCopyEmbed} className="btn btn-secondary flex-row-center dashboard-btn-xs">
                        {copiedEmbed ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Embed</>}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {selectedSurvey.status === 'draft' && (Number.isNaN(totalResponseCount) || totalResponseCount === 0) ? (
              <div className="dashboard-empty-card">
                <div className="dashboard-empty-icon-wrapper">
                  <FileText size={28} />
                </div>
                <h3 className="dashboard-details-title">No responses collected yet</h3>
                <p className="dashboard-details-desc">
                  This survey is currently in <strong>Draft</strong> state. Publish it and distribute survey links to respondents to begin collecting insights.
                </p>
                <button onClick={() => navigate(`/builder/${selectedSurveyId}`)} className="btn btn-primary flex-row-center dashboard-create-btn">
                  <GitFork size={16} /> Open Visual Builder
                </button>
              </div>
            ) : (
              <>
                <div className="dashboard-tabs-bar">
                  {([
                    { id: 'overview', label: 'Overview' },
                    { id: 'logic', label: 'Routing & Drop-off' },
                    { id: 'breakdown', label: 'Question Breakdown' },
                    { id: 'responses', label: 'Responses' },
                    { id: 'logs', label: 'Follow-up Logs' }
                  ] as const).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`dashboard-tab-btn ${activeTab === tab.id ? 'dashboard-tab-btn--active' : ''}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="margin-top-sm">
                  {activeTab === 'overview' && (
                    <DashboardOverview
                      selectedSurvey={selectedSurvey}
                      dateRange={dateRange}
                      setDateRange={setDateRange}
                    />
                  )}

                  {activeTab === 'logic' && (
                    <DashboardLogicBreakdown selectedSurvey={selectedSurvey} />
                  )}

                  {activeTab === 'breakdown' && (
                    <DashboardQuestionBreakdown selectedSurvey={selectedSurvey} />
                  )}

                  {activeTab === 'responses' && (
                    <DashboardResponses selectedSurvey={selectedSurvey} />
                  )}

                  {activeTab === 'logs' && (
                    <DashboardLogs selectedSurvey={selectedSurvey} />
                  )}
                </div>
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
