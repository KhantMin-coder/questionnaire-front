import React from 'react';
import type { SurveyItem } from '../../types/builder';

interface DashboardQuestionBreakdownProps {
  selectedSurvey: SurveyItem;
}

export const DashboardQuestionBreakdown: React.FC<DashboardQuestionBreakdownProps> = ({ selectedSurvey }) => {
  return (
    <div className="flex-column flex-gap-lg">
      {selectedSurvey.questions && selectedSurvey.questions.length > 0 ? (
        selectedSurvey.questions.map((question) => (
          <div key={question.id} className="glass-panel dashboard-chart-card">
            <div className="flex-row-center-between">
              <span className="dashboard-label-sm-bold">
                Question {question.number} • {question.type === 'input' ? 'Input Field' : 'Choice Selection'}
              </span>
              <span className="text-muted-xs">{question.responses} Responses</span>
            </div>
            <h3 className="dashboard-details-title margin-bottom-0">{question.text}</h3>

            {question.stats && <div className="dashboard-stats-highlight">{question.stats}</div>}

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
        <div className="dashboard-empty">No question data available for this survey draft.</div>
      )}
    </div>
  );
};
