import React from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import type { SurveyItem } from '../../types/builder';

interface DashboardLogicBreakdownProps {
  selectedSurvey: SurveyItem;
}

export const DashboardLogicBreakdown: React.FC<DashboardLogicBreakdownProps> = ({ selectedSurvey }) => {
  return (
    <div className="dashboard-logic-grid">
      <div className="glass-panel dashboard-chart-card">
        <div className="flex-row-center-between">
          <h3 className="dashboard-chart-title">Drop-off Funnel Analysis</h3>
          <span className="dashboard-dropout-label">
            <AlertTriangle size={12} /> Dropouts recorded
          </span>
        </div>
        <div className="dashboard-chart-height-240">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={selectedSurvey.dropOff} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" />
              <XAxis type="number" stroke="var(--text-muted)" className="recharts-axis-font" />
              <YAxis dataKey="name" type="category" stroke="var(--text-muted)" className="recharts-axis-font" />
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

      <div className="glass-panel dashboard-chart-card">
        <h3 className="dashboard-chart-title">Question Branching Routing Ratios</h3>
        <div className="dashboard-pie-content-row">
          <div className="dashboard-pie-wrapper-lg">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={selectedSurvey.pie}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {selectedSurvey.pie?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-column flex-gap-sm">
            {selectedSurvey.pie?.map((d, i) => (
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
    </div>
  );
};
