import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import {
  Users,
  CheckCircle,
  Clock,
  Percent,
  ArrowUpRight,
  AlertTriangle,
  ArrowLeft,
  Search,
  FileText,
  GitFork,
  Plus,
  Download,
  Share2,
  Copy,
  QrCode,
  Code,
  Monitor,
  Smartphone,
  Tablet,
  Calendar,
  Check
} from 'lucide-react';
import './Dashboard.css';

interface DashboardProps {
  onChangeTab?: (tab: string) => void;
}

// Mock survey databases with custom metrics and question breakdown records
const mockSurveys = [
  {
    id: 'dev-exp',
    title: 'Developer Experience Survey',
    status: 'published',
    lastModified: '2 hours ago',
    kpis: [
      { label: 'Total Responses', value: '372', change: '+12%', icon: <Users size={18} color="var(--primary-color)" /> },
      { label: 'Completion Rate', value: '78.5%', change: '+3.2%', icon: <Percent size={18} color="var(--primary-color)" /> },
      { label: 'Avg. Finish Time', value: '3m 42s', change: '-12s', icon: <Clock size={18} color="var(--primary-color)" /> },
      { label: 'Follow-ups Triggered', value: '142', change: '84% email rate', icon: <CheckCircle size={18} color="var(--primary-color)" /> }
    ],
    timeline: [
      { date: 'Mon', completed: 18, pending: 4, disqualified: 2 },
      { date: 'Tue', completed: 32, pending: 8, disqualified: 5 },
      { date: 'Wed', completed: 38, pending: 12, disqualified: 6 },
      { date: 'Thu', completed: 20, pending: 8, disqualified: 4 },
      { date: 'Fri', completed: 60, pending: 18, disqualified: 9 },
      { date: 'Sat', completed: 68, pending: 18, disqualified: 9 },
      { date: 'Sun', completed: 88, pending: 22, disqualified: 10 },
    ],
    dropOff: [
      { name: 'Q1: Demographics', completed: 372, dropOff: 8 },
      { name: 'Q2: Core Interests', completed: 350, dropOff: 22 },
      { name: 'Q3: Usage Freq', completed: 312, dropOff: 38 },
      { name: 'Delay: Follow-up', completed: 290, dropOff: 22 },
      { name: 'Q4: Deep Feedback', completed: 250, dropOff: 40 },
    ],
    pie: [
      { name: 'Yes (Standard Flow)', value: 240, color: 'var(--primary-color)' },
      { name: 'No (Disqualified)', value: 80, color: '#ef4444' },
      { name: 'Maybe (Alternative)', value: 52, color: 'var(--text-muted)' },
    ],
    questions: [
      {
        id: 'q1',
        number: 1,
        type: 'input',
        text: 'How old are you?',
        responses: 372,
        stats: 'Median Age: 26.4 years',
        options: [
          { name: '18 - 24 years', count: 167, percentage: 45 },
          { name: '25 - 34 years', count: 141, percentage: 38 },
          { name: '35+ years', count: 64, percentage: 17 }
        ]
      },
      {
        id: 'q2',
        number: 2,
        type: 'single',
        text: 'Which framework do you prefer?',
        responses: 364,
        options: [
          { name: 'React', count: 240, percentage: 66 },
          { name: 'Vue', count: 80, percentage: 22 },
          { name: 'Svelte', count: 44, percentage: 12 }
        ]
      },
      {
        id: 'q3',
        number: 3,
        type: 'single',
        text: 'Do you schedule time-delay follow-up automations?',
        responses: 290,
        options: [
          { name: 'Yes (Option A)', count: 220, percentage: 76 },
          { name: 'No (Option B)', count: 50, percentage: 17 },
          { name: 'Unsure (Option C)', count: 20, percentage: 7 }
        ]
      }
    ],
    logs: [
      { email: 'user***@gmail.com', original: 'A (Initial Feedback)', followUp: 'B (Usage Deep-dive)', status: 'Response Linked' },
      { email: 'stud***@berkeley.edu', original: 'A (Initial Feedback)', followUp: 'B (Usage Deep-dive)', status: 'Response Linked' },
      { email: 'alex***@github.com', original: 'A (Initial Feedback)', followUp: 'B (Usage Deep-dive)', status: 'Awaiting dispatch (2h remaining)' },
      { email: 'cont***@startup.co', original: 'A (Initial Feedback)', followUp: 'B (Usage Deep-dive)', status: 'Expired (7d limit)' }
    ]
  },
  {
    id: 'cust-sat',
    title: 'Customer Satisfaction Q3',
    status: 'published',
    lastModified: 'Yesterday',
    kpis: [
      { label: 'Total Responses', value: '1,248', change: '+18%', icon: <Users size={18} color="var(--primary-color)" /> },
      { label: 'Completion Rate', value: '92.1%', change: '+1.5%', icon: <Percent size={18} color="var(--primary-color)" /> },
      { label: 'Avg. Finish Time', value: '1m 55s', change: '-45s', icon: <Clock size={18} color="var(--primary-color)" /> },
      { label: 'Follow-ups Triggered', value: '482', change: '91% email rate', icon: <CheckCircle size={18} color="var(--primary-color)" /> }
    ],
    timeline: [
      { date: 'Mon', completed: 95, pending: 20, disqualified: 5 },
      { date: 'Tue', completed: 110, pending: 25, disqualified: 5 },
      { date: 'Wed', completed: 150, pending: 35, disqualified: 10 },
      { date: 'Thu', completed: 120, pending: 30, disqualified: 10 },
      { date: 'Fri', completed: 165, pending: 35, disqualified: 10 },
      { date: 'Sat', completed: 190, pending: 45, disqualified: 5 },
      { date: 'Sun', completed: 140, pending: 35, disqualified: 8 },
    ],
    dropOff: [
      { name: 'Q1: Purchase Date', completed: 1248, dropOff: 2 },
      { name: 'Q2: Rating 1-5', completed: 1246, dropOff: 12 },
      { name: 'Q3: Recommendation', completed: 1234, dropOff: 20 },
      { name: 'Q4: Detailed Review', completed: 1214, dropOff: 66 },
    ],
    pie: [
      { name: 'Promoters (9-10)', value: 850, color: 'var(--primary-color)' },
      { name: 'Passives (7-8)', value: 280, color: '#f59e0b' },
      { name: 'Detractors (0-6)', value: 118, color: '#ef4444' },
    ],
    questions: [
      {
        id: 'q1',
        number: 1,
        type: 'input',
        text: 'When was your last purchase?',
        responses: 1248,
        stats: 'Most active day: Wednesday'
      },
      {
        id: 'q2',
        number: 2,
        type: 'single',
        text: 'Product Quality Rating',
        responses: 1246,
        options: [
          { name: '5 Stars (Excellent)', count: 720, percentage: 58 },
          { name: '4 Stars (Good)', count: 380, percentage: 30 },
          { name: '3 Stars (Average)', count: 98, percentage: 8 },
          { name: '2 Stars (Poor)', count: 32, percentage: 3 },
          { name: '1 Star (Unacceptable)', count: 16, percentage: 1 }
        ]
      },
      {
        id: 'q3',
        number: 3,
        type: 'single',
        text: 'Would you recommend Resonator to a colleague?',
        responses: 1234,
        options: [
          { name: 'Definitely (Option A)', count: 850, percentage: 69 },
          { name: 'Maybe (Option B)', count: 266, percentage: 22 },
          { name: 'Not likely (Option C)', count: 118, percentage: 9 }
        ]
      }
    ],
    logs: [
      { email: 'john***@amazon.com', original: 'Q3 Feedback', followUp: 'NPS Interview', status: 'Response Linked' },
      { email: 'sara***@microsoft.com', original: 'Q3 Feedback', followUp: 'NPS Interview', status: 'Response Linked' },
      { email: 'mark***@meta.com', original: 'Q3 Feedback', followUp: 'NPS Interview', status: 'Awaiting dispatch (12h remaining)' }
    ]
  },
  {
    id: 'prod-onboard',
    title: 'Product Onboarding Flow',
    status: 'draft',
    lastModified: '3 days ago',
    kpis: [
      { label: 'Total Responses', value: '0', change: '0%', icon: <Users size={18} color="var(--primary-color)" /> },
      { label: 'Completion Rate', value: '0%', change: '0%', icon: <Percent size={18} color="var(--primary-color)" /> },
      { label: 'Avg. Finish Time', value: '0s', change: '0s', icon: <Clock size={18} color="var(--primary-color)" /> },
      { label: 'Follow-ups Triggered', value: '0', change: 'N/A', icon: <CheckCircle size={18} color="var(--primary-color)" /> }
    ],
    timeline: [],
    dropOff: [],
    pie: [],
    questions: [],
    logs: []
  },
  {
    id: 'mobile-exit',
    title: 'Mobile App Exit Survey',
    status: 'archived',
    lastModified: '2 weeks ago',
    kpis: [
      { label: 'Total Responses', value: '58', change: '-4%', icon: <Users size={18} color="var(--primary-color)" /> },
      { label: 'Completion Rate', value: '64.2%', change: '-2.1%', icon: <Percent size={18} color="var(--primary-color)" /> },
      { label: 'Avg. Finish Time', value: '4m 05s', change: '+30s', icon: <Clock size={18} color="var(--primary-color)" /> },
      { label: 'Follow-ups Triggered', value: '12', change: '75% email rate', icon: <CheckCircle size={18} color="var(--primary-color)" /> }
    ],
    timeline: [
      { date: 'Mon', completed: 1, pending: 1, disqualified: 0 },
      { date: 'Tue', completed: 5, pending: 2, disqualified: 1 },
      { date: 'Wed', completed: 8, pending: 3, disqualified: 1 },
      { date: 'Thu', completed: 3, pending: 1, disqualified: 1 },
      { date: 'Fri', completed: 10, pending: 3, disqualified: 2 },
      { date: 'Sat', completed: 6, pending: 2, disqualified: 2 },
      { date: 'Sun', completed: 4, pending: 1, disqualified: 1 },
    ],
    dropOff: [
      { name: 'Q1: Exit Reason', completed: 58, dropOff: 2 },
      { name: 'Q2: Future Plans', completed: 56, dropOff: 14 },
      { name: 'Q3: Alternatives', completed: 42, dropOff: 4 },
    ],
    pie: [
      { name: 'High Price', value: 25, color: '#ef4444' },
      { name: 'Missing Features', value: 18, color: 'var(--primary-color)' },
      { name: 'Buggy Experience', value: 15, color: 'var(--text-muted)' },
    ],
    questions: [
      {
        id: 'q1',
        number: 1,
        type: 'single',
        text: 'What is the primary reason for leaving?',
        responses: 58,
        options: [
          { name: 'High Price (Option A)', count: 25, percentage: 43 },
          { name: 'Missing Features (Option B)', count: 18, percentage: 31 },
          { name: 'Buggy Experience (Option C)', count: 15, percentage: 26 }
        ]
      },
      {
        id: 'q2',
        number: 2,
        type: 'single',
        text: 'Are you planning to return in the future?',
        responses: 56,
        options: [
          { name: 'Yes, likely', count: 12, percentage: 21 },
          { name: 'No, permanently leaving', count: 44, percentage: 79 }
        ]
      }
    ],
    logs: [
      { email: 'app***@yahoo.com', original: 'Exit Survey', followUp: 'Win-back Offer', status: 'Expired (7d limit)' },
      { email: 'play***@outlook.com', original: 'Exit Survey', followUp: 'Win-back Offer', status: 'Response Linked' }
    ]
  }
];

// Mock individual responses for the Responses tab
const mockResponses: Record<string, Array<{ id: string; timestamp: string; path: string; answers: Record<string, string>; status: string; device: string }>> = {
  'dev-exp': [
    { id: 'R-001', timestamp: '2024-07-07 14:32', path: 'Q1 → Q2 → Delay → Q4 → ✓', answers: { 'Q1': '28', 'Q2': 'React', 'Q3': 'Yes' }, status: 'Completed', device: 'Desktop' },
    { id: 'R-002', timestamp: '2024-07-07 13:18', path: 'Q1 → ✕ Disqualified', answers: { 'Q1': '16' }, status: 'Disqualified', device: 'Mobile' },
    { id: 'R-003', timestamp: '2024-07-07 12:45', path: 'Q1 → Q2 → Q4 → ✓', answers: { 'Q1': '34', 'Q2': 'Vue', 'Q3': 'No' }, status: 'Completed', device: 'Desktop' },
    { id: 'R-004', timestamp: '2024-07-07 11:22', path: 'Q1 → Q2 → Delay → Q4 → ✓', answers: { 'Q1': '22', 'Q2': 'React', 'Q3': 'Unsure' }, status: 'Completed', device: 'Tablet' },
    { id: 'R-005', timestamp: '2024-07-07 10:05', path: 'Q1 → Q2 → Delay → ⏳', answers: { 'Q1': '29', 'Q2': 'Svelte', 'Q3': 'Yes' }, status: 'Pending Follow-up', device: 'Mobile' },
    { id: 'R-006', timestamp: '2024-07-06 21:44', path: 'Q1 → Q2 → Q4 → ✓', answers: { 'Q1': '41', 'Q2': 'React', 'Q3': 'Yes' }, status: 'Completed', device: 'Desktop' },
  ],
  'cust-sat': [
    { id: 'R-101', timestamp: '2024-07-07 16:12', path: 'Q1 → Q2 → Q3 → Q4 → ✓', answers: { 'Q1': 'July 3', 'Q2': '5 Stars', 'Q3': 'Definitely' }, status: 'Completed', device: 'Mobile' },
    { id: 'R-102', timestamp: '2024-07-07 15:55', path: 'Q1 → Q2 → Q3 → Q4 → ✓', answers: { 'Q1': 'June 28', 'Q2': '4 Stars', 'Q3': 'Maybe' }, status: 'Completed', device: 'Desktop' },
    { id: 'R-103', timestamp: '2024-07-07 14:30', path: 'Q1 → Q2 → Q3 → ✓', answers: { 'Q1': 'July 1', 'Q2': '3 Stars', 'Q3': 'Not likely' }, status: 'Completed', device: 'Desktop' },
  ],
  'mobile-exit': [
    { id: 'R-201', timestamp: '2024-06-22 09:15', path: 'Q1 → Q2 → ✓', answers: { 'Q1': 'High Price', 'Q2': 'No' }, status: 'Completed', device: 'Mobile' },
    { id: 'R-202', timestamp: '2024-06-21 18:40', path: 'Q1 → Q2 → ✓', answers: { 'Q1': 'Missing Features', 'Q2': 'Yes' }, status: 'Completed', device: 'Mobile' },
  ]
};

// Mock device breakdown data
const mockDeviceData: Record<string, Array<{ name: string; value: number; color: string }>> = {
  'dev-exp': [
    { name: 'Desktop', value: 234, color: 'var(--primary-color)' },
    { name: 'Mobile', value: 108, color: '#f59e0b' },
    { name: 'Tablet', value: 30, color: 'var(--text-muted)' }
  ],
  'cust-sat': [
    { name: 'Desktop', value: 524, color: 'var(--primary-color)' },
    { name: 'Mobile', value: 662, color: '#f59e0b' },
    { name: 'Tablet', value: 62, color: 'var(--text-muted)' }
  ],
  'mobile-exit': [
    { name: 'Desktop', value: 5, color: 'var(--primary-color)' },
    { name: 'Mobile', value: 48, color: '#f59e0b' },
    { name: 'Tablet', value: 5, color: 'var(--text-muted)' }
  ]
};
const getKpiIcon = (iconName: any, label: string) => {
  if (React.isValidElement(iconName)) return iconName;

  switch (iconName || label) {
    case 'users':
    case 'Total Responses':
      return <Users size={18} color="var(--primary-color)" />;
    case 'percent':
    case 'Completion Rate':
      return <Percent size={18} color="var(--primary-color)" />;
    case 'clock':
    case 'Avg. Finish Time':
      return <Clock size={18} color="var(--primary-color)" />;
    case 'check-circle':
    case 'Follow-ups Triggered':
    default:
      return <CheckCircle size={18} color="var(--primary-color)" />;
  }
};

export const Dashboard: React.FC<DashboardProps> = () => {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<typeof mockSurveys>(() => {
    const saved = localStorage.getItem('resonator_surveys');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
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

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/survey/${selectedSurveyId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    const embedUrl = `${window.location.origin}/survey/${selectedSurveyId}`;
    navigator.clipboard.writeText(`<iframe src="${embedUrl}" width="100%" height="600" frameborder="0"></iframe>`);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleCreateSurvey = () => {
    const newId = 'survey_' + Date.now();
    const newSurvey = {
      id: newId,
      title: 'Untitled Questionnaire',
      status: 'draft',
      lastModified: 'Just now',
      kpis: [
        { label: 'Total Responses', value: '0', change: '0%', icon: <Users size={18} color="var(--primary-color)" /> },
        { label: 'Completion Rate', value: '0%', change: '0%', icon: <Percent size={18} color="var(--primary-color)" /> },
        { label: 'Avg. Finish Time', value: '0s', change: '0s', icon: <Clock size={18} color="var(--primary-color)" /> },
        { label: 'Follow-ups Triggered', value: '0', change: '0% email rate', icon: <CheckCircle size={18} color="var(--primary-color)" /> }
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
    navigate(`/builder/${newId}`);
  };

  // Filter surveys
  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard-container">
      <AnimatePresence mode="wait">
        {!selectedSurveyId ? (
          /* SURVEY LIST VIEW (Default Screen - Clean, uncrowded) */
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="dashboard-list-layout"
          >
            {/* Header */}
            <div className="dashboard-header">
              <div>
                <h1 className="dashboard-title">
                  Research Analytics
                </h1>
                <p className="dashboard-subtitle">
                  Manage, monitor, and audit your branching questionnaires.
                </p>
              </div>
              <button
                onClick={handleCreateSurvey}
                className="btn btn-primary flex-row-center dashboard-create-btn"
              >
                <Plus size={16} /> Create Survey
              </button>
            </div>

            {/* Toolbar */}
            <div className="dashboard-toolbar">
              {/* Search */}
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

              {/* Status Filters */}
              <div className="dashboard-filter-group">
                {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className="dashboard-filter-btn"
                    style={{
                      backgroundColor: statusFilter === status ? 'var(--primary-color)' : 'var(--input-bg)',
                      color: statusFilter === status ? '#ffffff' : 'var(--text-color)'
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Survey Cards Grid */}
            {filteredSurveys.length > 0 ? (
              <div className="dashboard-grid">
                {filteredSurveys.map((survey) => (
                  <motion.div
                    key={survey.id}
                    onClick={() => { setSelectedSurveyId(survey.id); setActiveTab('overview'); }}
                    whileHover={{ y: -4, scale: 1.01, boxShadow: 'var(--shadow-md)' }}
                    className="glass-panel dashboard-card"
                  >
                    <div className="dashboard-card-header">
                      <span
                        className="dashboard-status-badge"
                        style={{
                          backgroundColor: survey.status === 'published' ? 'var(--color-success-bg)' : survey.status === 'draft' ? 'var(--color-accent-amber-bg)' : 'rgba(148, 163, 184, 0.08)',
                          color: survey.status === 'published' ? 'var(--color-success)' : survey.status === 'draft' ? 'var(--color-accent-amber)' : '#94a3b8',
                          border: `1px solid ${survey.status === 'published' ? 'var(--color-success-bg)' : survey.status === 'draft' ? 'var(--color-accent-amber-bg)' : 'rgba(148, 163, 184, 0.15)'}`
                        }}
                      >
                        {survey.status.toUpperCase()}
                      </span>
                      <span className="text-muted-xs">Modified {survey.lastModified}</span>
                    </div>

                    <div>
                      <h3 className="dashboard-card-title">
                        {survey.title}
                      </h3>
                    </div>

                    <div className="dashboard-card-stats">
                      <div>
                        <div className="dashboard-stat-val">
                          {survey.kpis[0].value}
                        </div>
                        <div className="dashboard-stat-lbl">Responses</div>
                      </div>
                      <div className="dashboard-divider-y" />
                      <div>
                        <div className="dashboard-stat-val">
                          {survey.kpis[1].value}
                        </div>
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
              /* No matching search result */
              <div className="dashboard-empty">
                No surveys match your filter or search query.
              </div>
            )}
          </motion.div>
        ) : (
          /* SURVEY ANALYTICS DETAIL VIEW (Tabbed & Organized) */
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="flex-column flex-gap-xl"
          >
            {/* Breadcrumb Back Button */}
            <div className="flex-row-center flex-gap-sm">
              <button
                onClick={() => setSelectedSurveyId(null)}
                className="dashboard-back-btn"
              >
                <ArrowLeft size={16} /> Back to Surveys
              </button>
            </div>

            {/* Detailed Header */}
            <div className="flex-row-center-between flex-wrap flex-gap-lg">
              <div>
                <h1 className="dashboard-title-detail">
                  {selectedSurvey?.title}
                </h1>
                <p className="dashboard-subtitle">
                  Detailed analysis and respondent scheduling status.
                </p>
              </div>

              <div className="flex-row-center flex-gap-md">
                <span className="glass-panel dashboard-status-badge-detailed" style={{
                  color: selectedSurvey?.status === 'published' ? '#22c55e' : selectedSurvey?.status === 'draft' ? '#f59e0b' : '#94a3b8',
                  backgroundColor: selectedSurvey?.status === 'published' ? 'rgba(34, 197, 94, 0.08)' : selectedSurvey?.status === 'draft' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(148, 163, 184, 0.08)',
                  borderColor: selectedSurvey?.status === 'published' ? 'rgba(34, 197, 94, 0.2)' : selectedSurvey?.status === 'draft' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(148, 163, 184, 0.2)'
                }}>
                  ● {selectedSurvey?.status === 'published' ? 'Active & Collecting' : selectedSurvey?.status === 'draft' ? 'Draft Mode' : 'Archived'}
                </span>
                <button
                  onClick={() => setShowSharePanel(!showSharePanel)}
                  className="btn btn-secondary flex-row-center dashboard-btn-sm"
                >
                  <Share2 size={14} /> Share
                </button>
                <button
                  onClick={() => navigate(`/builder/${selectedSurveyId}`)}
                  className="btn btn-secondary flex-row-center dashboard-btn-sm"
                >
                  <GitFork size={14} /> Edit Flow
                </button>
              </div>
            </div>

            {/* Share & Distribute Panel */}
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
                    {/* Copy Link */}
                    <div className="flex-column flex-gap-sm">
                      <span className="dashboard-label-sm-bold">Survey Link</span>
                      <div className="flex-row-center flex-gap-sm">
                        <div className="dashboard-link-box">
                          resonator.io/s/{selectedSurveyId}
                        </div>
                        <button onClick={handleCopyLink} className="btn btn-secondary flex-row-center dashboard-copy-btn">
                          {copiedLink ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                        </button>
                      </div>
                    </div>
                    {/* QR Code */}
                    <div className="flex-column flex-gap-sm flex-align-center">
                      <span className="dashboard-label-sm-bold">QR Code</span>
                      <div className="dashboard-qr-box">
                        <QrCode size={40} color="var(--text-muted)" />
                      </div>
                      <span className="text-muted-xs font-size-xs">Download PNG</span>
                    </div>
                    {/* Embed Snippet */}
                    <div className="flex-column flex-gap-sm">
                      <span className="dashboard-label-sm-bold">Embed Code</span>
                      <div className="dashboard-embed-code">
                        {`<iframe src="resonator.io/embed/${selectedSurveyId}" ...>`}
                      </div>
                      <button onClick={handleCopyEmbed} className="btn btn-secondary flex-row-center dashboard-btn-xs">
                        {copiedEmbed ? <><Check size={14} /> Copied</> : <><Code size={14} /> Copy Embed</>}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Check if Draft with 0 responses (Render empty state onboarding) */}
            {selectedSurvey?.status === 'draft' && Number(selectedSurvey.kpis[0].value) === 0 ? (
              <div className="dashboard-empty-card">
                <div className="dashboard-empty-icon-wrapper">
                  <FileText size={28} />
                </div>
                <h3 className="dashboard-details-title">
                  No responses collected yet
                </h3>
                <p className="dashboard-details-desc">
                  This survey is currently in **Draft** state. Publish it and distribute survey links to respondents to begin collecting insights.
                </p>
                <button onClick={() => navigate(`/builder/${selectedSurveyId}`)} className="btn btn-primary flex-row-center dashboard-create-btn">
                  <GitFork size={16} /> Open Visual Builder
                </button>
              </div>
            ) : (
              /* If has responses, show Tabbed Sheets */
              <>
                {/* Tabs Bar */}
                <div className="dashboard-tabs-bar">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'logic', label: 'Routing & Drop-off' },
                    { id: 'breakdown', label: 'Question Breakdown' },
                    { id: 'responses', label: 'Responses' },
                    { id: 'logs', label: 'Follow-up Logs' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className="dashboard-tab-btn"
                      style={{
                        color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-muted)',
                        borderBottomColor: activeTab === tab.id ? 'var(--primary-color)' : 'transparent'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content switcher */}
                <div className="margin-top-sm">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview-tab"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-column flex-gap-xl"
                    >
                      {/* Date Range + Export Toolbar */}
                      <div className="flex-row-center-between flex-wrap flex-gap-md">
                        <div className="flex-row-center flex-gap-xs">
                          <Calendar size={14} color="var(--text-muted)" />
                          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                            <button
                              key={range}
                              onClick={() => setDateRange(range)}
                              className="dashboard-range-btn"
                              style={{
                                backgroundColor: dateRange === range ? 'var(--primary-color)' : 'transparent',
                                color: dateRange === range ? '#ffffff' : 'var(--text-muted)',
                              }}
                            >
                              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
                            </button>
                          ))}
                        </div>
                        <div className="flex-row-center flex-gap-xs">
                          <button className="btn btn-secondary flex-row-center dashboard-btn-xs">
                            <Download size={13} /> CSV
                          </button>
                          <button className="btn btn-secondary flex-row-center dashboard-btn-xs">
                            <Download size={13} /> PDF Report
                          </button>
                        </div>
                      </div>

                      {/* KPI Cards Row */}
                      <div className="dashboard-kpi-grid">
                        {selectedSurvey?.kpis.map((kpi, idx) => (
                          <div key={idx} className="glass-panel dashboard-stats-card">
                            <div className="flex-row-center-between">
                              <span className="dashboard-label-sm-bold">{kpi.label}</span>
                              <div className="dashboard-kpi-icon-box">
                                {getKpiIcon(kpi.icon, kpi.label)}
                              </div>
                            </div>
                            <div className="dashboard-kpi-row-bottom">
                              <span className="dashboard-kpi-val">{kpi.value}</span>
                              <span className="dashboard-kpi-change">
                                {kpi.change}
                                <ArrowUpRight size={12} />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Area Chart block */}
                      <div className="glass-panel dashboard-chart-card">
                        <div className="flex-row-center-between">
                          <h3 className="dashboard-chart-title">Respondent Journey Distribution</h3>
                          <span className="text-muted-xs">Daily breakdown of completed, pending, and disqualified paths</span>
                        </div>
                        <div className="dashboard-chart-wrapper">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={selectedSurvey?.timeline}>
                              <defs>
                                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.35} />
                                  <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorDisqualified" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" />
                              <XAxis dataKey="date" stroke="var(--text-muted)" style={{ fontSize: '0.75rem' }} />
                              <YAxis stroke="var(--text-muted)" style={{ fontSize: '0.75rem' }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'var(--panel-bg)',
                                  borderColor: 'var(--panel-border)',
                                  color: 'var(--text-color)',
                                  borderRadius: '8px'
                                }}
                              />
                              <Area type="monotone" dataKey="completed" stackId="1" stroke="var(--primary-color)" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
                              <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorPending)" name="Pending Follow-up" />
                              <Area type="monotone" dataKey="disqualified" stackId="1" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDisqualified)" name="Disqualified" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div className="dashboard-chart-legend">
                          <div className="legend-item">
                            <div className="legend-dot" style={{ backgroundColor: 'var(--primary-color)' }} />
                            <span className="legend-label">Completed</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-dot" style={{ backgroundColor: '#f59e0b' }} />
                            <span className="legend-label">Pending Follow-up</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-dot" style={{ backgroundColor: '#ef4444' }} />
                            <span className="legend-label">Disqualified</span>
                          </div>
                        </div>
                      </div>

                      {/* Device Breakdown + Avg Time per Question */}
                      <div className="dashboard-detail-grid">
                        {/* Device Breakdown */}
                        <div className="glass-panel dashboard-chart-card">
                          <h3 className="dashboard-chart-title-sm">Device Breakdown</h3>
                          <div className="flex-row-center flex-wrap flex-gap-xl">
                            <div className="dashboard-pie-wrapper">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={selectedSurveyId ? mockDeviceData[selectedSurveyId] || [] : []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={30}
                                    outerRadius={45}
                                    paddingAngle={3}
                                    dataKey="value"
                                  >
                                    {(selectedSurveyId ? mockDeviceData[selectedSurveyId] || [] : []).map((entry, index) => (
                                      <Cell key={`device-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex-column flex-gap-sm">
                              {(selectedSurveyId ? mockDeviceData[selectedSurveyId] || [] : []).map((d, i) => {
                                const total = (selectedSurveyId ? mockDeviceData[selectedSurveyId] || [] : []).reduce((s, v) => s + v.value, 0);
                                const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                                const Icon = d.name === 'Desktop' ? Monitor : d.name === 'Mobile' ? Smartphone : Tablet;
                                return (
                                  <div key={i} className="flex-row-center flex-gap-sm">
                                    <Icon size={14} color={d.color} />
                                    <span className="dashboard-device-label">{d.name}</span>
                                    <span className="text-muted-xs">{d.value} ({pct}%)</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="glass-panel dashboard-chart-card">
                          <h3 className="dashboard-chart-title-sm">Quick Insights</h3>
                          <div className="flex-column flex-gap-md">
                            <div className="dashboard-insight-row">
                              <span className="text-muted-xs font-size-sm">Peak Response Hour</span>
                              <span className="dashboard-insight-value">2:00 PM - 4:00 PM</span>
                            </div>
                            <div className="dashboard-insight-row">
                              <span className="text-muted-xs font-size-sm">Highest Drop-off</span>
                              <span className="dashboard-insight-value text-danger">Q4: Deep Feedback</span>
                            </div>
                            <div className="dashboard-insight-row">
                              <span className="text-muted-xs font-size-sm">Most Popular Path</span>
                              <span className="dashboard-insight-value text-primary">Q1 → Q2 → Q4 → ✓</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'logic' && (
                    <motion.div
                      key="logic-tab"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="dashboard-logic-grid"
                    >
                      {/* Funnel chart */}
                      <div className="glass-panel dashboard-chart-card">
                        <div className="flex-row-center-between">
                          <h3 className="dashboard-chart-title">Drop-off Funnel Analysis</h3>
                          <span className="dashboard-dropout-label">
                            <AlertTriangle size={12} /> Dropouts recorded
                          </span>
                        </div>
                        <div className="dashboard-chart-height-240">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={selectedSurvey?.dropOff} layout="vertical" margin={{ left: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" />
                              <XAxis type="number" stroke="var(--text-muted)" style={{ fontSize: '0.75rem' }} />
                              <YAxis dataKey="name" type="category" stroke="var(--text-muted)" style={{ fontSize: '0.75rem' }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'var(--panel-bg)',
                                  borderColor: 'var(--panel-border)',
                                  color: 'var(--text-color)',
                                  borderRadius: '8px'
                                }}
                              />
                              <Bar dataKey="completed" fill="var(--primary-color)" radius={[0, 4, 4, 0]} barSize={12} />
                              <Bar dataKey="dropOff" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={12} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Pie chart ratios */}
                      <div className="glass-panel dashboard-chart-card">
                        <h3 className="dashboard-chart-title">Question Branching Routing Ratios</h3>
                        <div className="dashboard-pie-content-row">
                          <div className="dashboard-pie-wrapper-lg">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={selectedSurvey?.pie}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={60}
                                  paddingAngle={4}
                                  dataKey="value"
                                >
                                  {selectedSurvey?.pie.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex-column flex-gap-sm">
                            {selectedSurvey?.pie.map((d, i) => (
                              <div key={i} className="flex-row-center flex-gap-sm">
                                <div className="legend-color-block" style={{ backgroundColor: d.color }} />
                                <span className="dashboard-stat-label font-size-08">
                                  {d.name} ({d.value})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'breakdown' && (
                    <motion.div
                      key="breakdown-tab"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-column flex-gap-lg"
                    >
                      {selectedSurvey?.questions && selectedSurvey.questions.length > 0 ? (
                        selectedSurvey.questions.map((question) => (
                          <div key={question.id} className="glass-panel dashboard-chart-card">
                            <div className="flex-row-center-between">
                              <span className="dashboard-label-sm-bold">
                                Question {question.number} • {question.type === 'input' ? 'Input Field' : 'Choice Selection'}
                              </span>
                              <span className="text-muted-xs">
                                {question.responses} Responses
                              </span>
                            </div>
                            <h3 className="dashboard-details-title margin-bottom-0">
                              {question.text}
                            </h3>

                            {question.stats && (
                              <div className="dashboard-stats-highlight">
                                {question.stats}
                              </div>
                            )}

                            <div className="flex-column flex-gap-md margin-top-xs">
                              {question.options && question.options.map((opt, idx) => (
                                <div key={idx} className="flex-column flex-gap-sm">
                                  <div className="flex-row-center-between font-size-sm">
                                    <span className="dashboard-stat-label">{opt.name}</span>
                                    <span className="text-muted-xs">{opt.count} ({opt.percentage}%)</span>
                                  </div>
                                  <div className="dashboard-progress-track">
                                    <div className="dashboard-progress-fill" style={{ width: `${opt.percentage}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="dashboard-empty">
                          No question data available for this survey draft.
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'logs' && (
                    <motion.div
                      key="logs-tab"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="glass-panel dashboard-chart-card"
                    >
                      <div className="flex-row-center-between">
                        <h3 className="dashboard-chart-title">Follow-up Correlation Streams</h3>
                        <span className="text-muted-xs">Secure single-use JWT dispatch audits</span>
                      </div>

                      {selectedSurvey?.logs && selectedSurvey.logs.length > 0 ? (
                        <div className="dashboard-scroll-list">
                          {selectedSurvey.logs.map((log, idx) => (
                            <div key={idx} className="dashboard-list-row">
                              <div>
                                <div className="dashboard-stat-label">{log.email}</div>
                                <div className="text-muted-xs font-size-xs">{log.original} → {log.followUp}</div>
                              </div>
                              <span className="dashboard-log-status" style={{
                                backgroundColor: log.status === 'Response Linked' ? 'rgba(34, 197, 94, 0.1)' : log.status.includes('Awaiting') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: log.status === 'Response Linked' ? '#22c55e' : log.status.includes('Awaiting') ? '#f59e0b' : '#ef4444'
                              }}>
                                {log.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="dashboard-empty">
                          No follow-up dispatch links triggered for this survey yet.
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'responses' && (
                    <motion.div
                      key="responses-tab"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-column flex-gap-lg"
                    >
                      {/* Export row */}
                      <div className="flex-row-center-between">
                        <span className="text-muted-xs font-size-sm">
                          Showing {selectedSurveyId && mockResponses[selectedSurveyId] ? mockResponses[selectedSurveyId].length : 0} individual submissions
                        </span>
                        <button className="btn btn-secondary flex-row-center dashboard-btn-xs">
                          <Download size={13} /> Export CSV
                        </button>
                      </div>

                      {/* Table */}
                      <div className="glass-panel dashboard-table-wrapper">
                        <table className="dashboard-table">
                          <thead>
                            <tr className="dashboard-table-head-row">
                              <th className="dashboard-table-th">ID</th>
                              <th className="dashboard-table-th">Timestamp</th>
                              <th className="dashboard-table-th">Device</th>
                              <th className="dashboard-table-th">Path Taken</th>
                              <th className="dashboard-table-th">Status</th>
                              {selectedSurvey?.questions?.map((q) => (
                                <th key={q.id} className="dashboard-table-th">Q{q.number}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(selectedSurveyId && mockResponses[selectedSurveyId] ? mockResponses[selectedSurveyId] : []).map((resp) => (
                              <tr key={resp.id} className="dashboard-table-tr">
                                <td className="dashboard-table-td--monospace">{resp.id}</td>
                                <td className="dashboard-table-td--muted">{resp.timestamp}</td>
                                <td className="dashboard-table-td">
                                  <span className="flex-row-center flex-gap-xs display-inline-flex">
                                    {resp.device === 'Desktop' ? <Monitor size={12} /> : resp.device === 'Mobile' ? <Smartphone size={12} /> : <Tablet size={12} />}
                                    {resp.device}
                                  </span>
                                </td>
                                <td className="dashboard-table-td--muted font-monospace-sm">{resp.path}</td>
                                <td className="dashboard-table-td">
                                  <span className="dashboard-table-status" style={{
                                    backgroundColor: resp.status === 'Completed' ? 'rgba(34, 197, 94, 0.1)' : resp.status === 'Disqualified' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                    color: resp.status === 'Completed' ? '#22c55e' : resp.status === 'Disqualified' ? '#ef4444' : '#f59e0b'
                                  }}>
                                    {resp.status}
                                  </span>
                                </td>
                                {selectedSurvey?.questions?.map((q) => (
                                  <td key={q.id} className="dashboard-table-td">
                                    {resp.answers[`Q${q.number}`] || '—'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
