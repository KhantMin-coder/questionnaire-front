import React from 'react';
import { Download, Monitor, Smartphone, Tablet } from 'lucide-react';
import { mockResponses } from './constants';
import type { SurveyItem } from '../../types/builder';

interface DashboardResponsesProps {
  selectedSurvey: SurveyItem;
}

export const DashboardResponses: React.FC<DashboardResponsesProps> = ({ selectedSurvey }) => {
  const responses = mockResponses[selectedSurvey.id] || [];

  const handleExportResponsesCsv = (): void => {
    const questionColumns = (selectedSurvey.questions || []).map((q) => `Q${q.number}`);
    const headers = ['ID', 'Timestamp', 'Device', 'Path Taken', 'Status', ...questionColumns];
    const rows = responses.map((resp) => [
      resp.id,
      resp.timestamp,
      resp.device,
      `"${resp.path}"`,
      resp.status,
      ...questionColumns.map((qCol) => `"${resp.answers[qCol] || ''}"`)
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedSurvey.id}_responses.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-column flex-gap-lg">
      <div className="flex-row-center-between">
        <span className="text-muted-xs font-size-sm">
          Showing {responses.length} individual submissions
        </span>
        <button onClick={handleExportResponsesCsv} className="btn btn-secondary flex-row-center dashboard-btn-xs">
          <Download size={13} /> Export CSV
        </button>
      </div>

      <div className="glass-panel dashboard-table-wrapper">
        <table className="dashboard-table">
          <thead>
            <tr className="dashboard-table-head-row">
              <th className="dashboard-table-th">ID</th>
              <th className="dashboard-table-th">Timestamp</th>
              <th className="dashboard-table-th">Device</th>
              <th className="dashboard-table-th">Path Taken</th>
              <th className="dashboard-table-th">Status</th>
              {selectedSurvey.questions?.map((q) => (
                <th key={q.id} className="dashboard-table-th">Q{q.number}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((resp) => (
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
                  <span className={`dashboard-table-status dashboard-table-status--${resp.status.toLowerCase()}`}>
                    {resp.status}
                  </span>
                </td>
                {selectedSurvey.questions?.map((q) => (
                  <td key={q.id} className="dashboard-table-td">
                    {resp.answers[`Q${q.number}`] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
