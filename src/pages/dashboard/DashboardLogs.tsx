import React from 'react';
import type { SurveyItem } from '../../types/builder';

interface DashboardLogsProps {
  selectedSurvey: SurveyItem;
}

export const DashboardLogs: React.FC<DashboardLogsProps> = ({ selectedSurvey }) => {
  return (
    <div className="glass-panel dashboard-chart-card">
      <div className="flex-row-center-between">
        <h3 className="dashboard-chart-title">Follow-up Correlation Streams</h3>
        <span className="text-muted-xs">Secure single-use JWT dispatch audits</span>
      </div>

      {selectedSurvey.logs && selectedSurvey.logs.length > 0 ? (
        <div className="dashboard-scroll-list">
          {selectedSurvey.logs.map((log, idx) => {
            const isLinked = log.status === 'Response Linked';
            const isAwaiting = log.status.includes('Awaiting');
            const statusClass = isLinked ? 'linked' : isAwaiting ? 'awaiting' : 'failed';
            return (
              <div key={idx} className="dashboard-list-row">
                <div>
                  <div className="dashboard-stat-label">{log.email}</div>
                  <div className="text-muted-xs font-size-xs">{log.original} → {log.followUp}</div>
                </div>
                <span className={`dashboard-log-status dashboard-log-status--${statusClass}`}>
                  {log.status}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="dashboard-empty">No follow-up dispatch links triggered for this survey yet.</div>
      )}
    </div>
  );
};
