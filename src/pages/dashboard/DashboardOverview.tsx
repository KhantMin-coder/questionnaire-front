import React from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, Monitor, Smartphone, Tablet, ArrowUpRight } from 'lucide-react';
import { getKpiIcon, mockDeviceData } from './constants';
import type { SurveyItem } from '../../types/builder';

interface DashboardOverviewProps {
  selectedSurvey: SurveyItem;
  dateRange: '7d' | '30d' | '90d' | 'all';
  setDateRange: (r: '7d' | '30d' | '90d' | 'all') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  selectedSurvey,
  dateRange,
  setDateRange
}) => {
  const deviceData = mockDeviceData[selectedSurvey.id] || [];

  return (
    <div className="flex-column flex-gap-xl">
      <div className="flex-row-center-between flex-wrap flex-gap-md">
        <div className="flex-row-center flex-gap-xs">
          <Calendar size={14} color="var(--text-muted)" />
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`dashboard-range-btn ${dateRange === range ? 'dashboard-range-btn--active' : ''}`}
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

      <div className="dashboard-kpi-grid">
        {selectedSurvey.kpis?.map((kpi, idx) => (
          <div key={idx} className="glass-panel dashboard-stats-card">
            <div className="flex-row-center-between">
              <span className="dashboard-label-sm-bold">{kpi.label}</span>
              <div className="dashboard-kpi-icon-box">{getKpiIcon(kpi.icon)}</div>
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

      <div className="glass-panel dashboard-chart-card">
        <div className="flex-row-center-between">
          <h3 className="dashboard-chart-title">Respondent Journey Distribution</h3>
          <span className="text-muted-xs">Daily breakdown of completed, pending, and disqualified paths</span>
        </div>
        <div className="dashboard-chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={selectedSurvey.timeline}>
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
              <XAxis dataKey="date" stroke="var(--text-muted)" className="recharts-axis-font" />
              <YAxis stroke="var(--text-muted)" className="recharts-axis-font" />
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

        <div className="dashboard-chart-legend">
          <div className="legend-item">
            <div className="legend-dot legend-dot--primary" />
            <span className="legend-label">Completed</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot legend-dot--warning" />
            <span className="legend-label">Pending Follow-up</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot legend-dot--danger" />
            <span className="legend-label">Disqualified</span>
          </div>
        </div>
      </div>

      <div className="dashboard-detail-grid">
        <div className="glass-panel dashboard-chart-card">
          <h3 className="dashboard-chart-title-sm">Device Breakdown</h3>
          <div className="flex-row-center flex-wrap flex-gap-xl">
            <div className="dashboard-pie-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`device-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-column flex-gap-sm">
              {deviceData.map((d, i) => {
                const total = deviceData.reduce((s, v) => s + v.value, 0);
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
    </div>
  );
};
