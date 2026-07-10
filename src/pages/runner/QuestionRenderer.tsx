import React from 'react';
import type { NodeData } from '../../utils/graphLogic';

interface QuestionRendererProps {
  currentNode: NodeData;
  answers: Record<string, any>;
  setAnswers: (a: Record<string, any>) => void;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  currentNode,
  answers,
  setAnswers
}) => {
  const currentAnswer = answers[currentNode.id];

  if (currentNode.questionType === 'input') {
    return (
      <div className="form-group margin-bottom-0">
        <input
          id={`ans-${currentNode.id}`}
          className="form-input"
          type="text"
          placeholder="Your answer..."
          value={currentAnswer || ''}
          onChange={(e) => setAnswers({ ...answers, [currentNode.id]: e.target.value })}
        />
      </div>
    );
  }

  if (currentNode.questionType === 'single' && currentNode.options) {
    const ansStr = String(currentAnswer || '');
    const isOtherSelected = ansStr.startsWith('Other');
    const otherText = ansStr.startsWith('Other: ') ? ansStr.substring(7) : '';

    return (
      <div className="runner-options-list">
        {currentNode.options.map((opt, idx) => {
          const isSelected = currentAnswer === opt;
          return (
            <label
              key={idx}
              className={`glass-panel runner-option-label ${isSelected ? 'runner-option-label--selected' : ''}`}
            >
              <input
                type="radio"
                name={`ans-${currentNode.id}`}
                checked={isSelected}
                onChange={() => setAnswers({ ...answers, [currentNode.id]: opt })}
                className="runner-option-radio"
              />
              <span className="runner-option-text">{opt}</span>
            </label>
          );
        })}
        {currentNode.allowOther && (
          <>
            <label
              className={`glass-panel runner-option-label ${isOtherSelected ? 'runner-option-label--selected' : ''}`}
            >
              <input
                type="radio"
                name={`ans-${currentNode.id}`}
                checked={isOtherSelected}
                onChange={() => setAnswers({ ...answers, [currentNode.id]: 'Other' })}
                className="runner-option-radio"
              />
              <span className="runner-option-text">Other</span>
            </label>
            {isOtherSelected && (
              <div className="runner-other-input-wrapper">
                <input
                  type="text"
                  className="runner-other-input"
                  placeholder="Please specify..."
                  value={otherText}
                  onChange={(e) => {
                    const val = e.target.value.trim() ? `Other: ${e.target.value}` : 'Other';
                    setAnswers({ ...answers, [currentNode.id]: val });
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (currentNode.questionType === 'multi' && currentNode.options) {
    const currentList = Array.isArray(currentAnswer) ? (currentAnswer as string[]) : [];
    const isOtherChecked = currentList.some(item => item.startsWith('Other'));
    const otherItem = currentList.find(item => item.startsWith('Other'));
    const otherText = otherItem && otherItem.startsWith('Other: ') ? otherItem.substring(7) : '';

    return (
      <div className="runner-options-list">
        {currentNode.options.map((opt, idx) => {
          const isChecked = currentList.includes(opt);
          return (
            <label
              key={idx}
              className={`glass-panel runner-option-label ${isChecked ? 'runner-option-label--selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {
                  if (isChecked) {
                    setAnswers({ ...answers, [currentNode.id]: currentList.filter(o => o !== opt) });
                  } else {
                    setAnswers({ ...answers, [currentNode.id]: [...currentList, opt] });
                  }
                }}
                className="runner-option-checkbox"
              />
              <span className="runner-option-text">{opt}</span>
            </label>
          );
        })}
        {currentNode.allowOther && (
          <>
            <label
              className={`glass-panel runner-option-label ${isOtherChecked ? 'runner-option-label--selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={isOtherChecked}
                onChange={() => {
                  if (isOtherChecked) {
                    setAnswers({ ...answers, [currentNode.id]: currentList.filter(o => !o.startsWith('Other')) });
                  } else {
                    setAnswers({ ...answers, [currentNode.id]: [...currentList, 'Other'] });
                  }
                }}
                className="runner-option-checkbox"
              />
              <span className="runner-option-text">Other</span>
            </label>
            {isOtherChecked && (
              <div className="runner-other-input-wrapper">
                <input
                  type="text"
                  className="runner-other-input"
                  placeholder="Please specify..."
                  value={otherText}
                  onChange={(e) => {
                    const val = e.target.value.trim() ? `Other: ${e.target.value}` : 'Other';
                    const cleanList = currentList.filter(o => !o.startsWith('Other'));
                    setAnswers({ ...answers, [currentNode.id]: [...cleanList, val] });
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return null;
};
