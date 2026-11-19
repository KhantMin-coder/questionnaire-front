import React from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Mail, AlertCircle, ShieldAlert } from 'lucide-react';

import { useRunnerState } from './runner/useRunnerState';
import { QuestionRenderer } from './runner/QuestionRenderer';
import { EmailCaptureForm } from './runner/EmailCaptureForm';
import type { NodeData, GraphEdge } from '../utils/graphLogic';
import './Runner.css';

const questionnaireNodes: NodeData[] = [
  { id: '1', type: 'question', label: 'How old are you?', helperText: 'Participants must be 18 or older.', questionType: 'input', inputType: 'number' },
  { id: '2', type: 'question', label: 'Which framework do you prefer?', questionType: 'single', options: ['React', 'Vue', 'Svelte'] },
  { id: '3', type: 'delay', label: 'Delay Follow-up target', delayDuration: '2 days', targetQuestionnaireName: 'Framework Deep-Dive Follow-up', options: [] },
  { id: '4', type: 'terminal', label: 'Completion', terminalMessage: 'Thank you for completing the survey!' },
  { id: '5', type: 'terminal', label: 'Disqualification', isDisqualification: true, terminalMessage: 'Survey ended. You must be over 18 to participate.' }
];

const questionnaireEdges: GraphEdge[] = [
  { id: 'e1-5', source: '1', target: '5', rules: [{ field: '1', operator: '<', value: '18' }] },
  { id: 'e1-2', source: '1', target: '2', rules: [{ field: '1', operator: '>=', value: '18' }] },
  { id: 'e2-3', source: '2', target: '3', rules: [{ field: '2', operator: '!=', value: 'React' }] },
  { id: 'e2-4', source: '2', target: '4', rules: [{ field: '2', operator: '==', value: 'React' }] },
  { id: 'e3-4', source: '3', target: '4', rules: [] }
];

export const Runner: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    currentNode,
    answers,
    setAnswers,
    history,
    traversedDelayNodes,
    emailInput,
    setEmailInput,
    isSubmitted,
    errorMsg,
    sessionToken,
    handleNext,
    handleBack,
    handleRestart,
    handleSubmit
  } = useRunnerState(id, questionnaireNodes, questionnaireEdges);

  const isTerminal = currentNode?.type === 'terminal';
  const isDisqualified = isTerminal && currentNode?.isDisqualification === true;

  return (
    <div className="dotted-canvas runner-wrapper">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key={currentNode?.id || 'empty'}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="glass-panel runner-card"
          >
            <div className="runner-header">
              <span className="runner-progress-info">
                Session: {sessionToken.substring(0, 12)}...
              </span>
              {history.length > 0 && !isTerminal && (
                <button onClick={handleBack} className="runner-back-btn">
                  <ArrowLeft size={14} /> Back
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="runner-error">
                <AlertCircle size={16} />
                {errorMsg}
              </div>
            )}

            {currentNode && (
              <div className="runner-content-pane">
                {currentNode.type === 'question' && (
                  <>
                    <h2 className="runner-question-title">{currentNode.label}</h2>
                    <QuestionRenderer
                      currentNode={currentNode}
                      answers={answers}
                      setAnswers={setAnswers}
                    />
                  </>
                )}

                {currentNode.type === 'delay' && (
                  <div className="runner-delay-section">
                    <div className="runner-status-icon runner-status-icon--delay">
                      <Mail size={32} />
                    </div>
                    <h2 className="runner-question-title">Follow-up Scheduled</h2>
                    <p className="runner-delay-desc">
                      Based on your input, <strong>{currentNode.targetQuestionnaireName || 'a follow-up questionnaire'}</strong> will be triggered in <strong>{currentNode.delayDuration}</strong>.
                    </p>
                  </div>
                )}

                {currentNode.type === 'terminal' && (
                  <div className="runner-terminal-section">
                    <div className={`runner-status-icon ${isDisqualified ? 'runner-status-icon--disqualified' : 'runner-status-icon--terminal'}`}>
                      {isDisqualified ? <ShieldAlert size={36} /> : <CheckCircle size={36} />}
                    </div>
                    <h2 className="runner-question-title">{currentNode.terminalMessage}</h2>

                    {isDisqualified ? (
                      <div className="runner-complete-section">
                        <button onClick={handleRestart} className="btn btn-secondary runner-complete-btn">
                          Restart Survey
                        </button>
                      </div>
                    ) : (
                      <EmailCaptureForm
                        emailInput={emailInput}
                        setEmailInput={setEmailInput}
                        handleSubmit={handleSubmit}
                        isRequired={traversedDelayNodes}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {!isTerminal && (
              <div className="runner-nav-row">
                <button onClick={handleNext} className="btn btn-primary">
                  Continue
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel runner-success-card"
          >
            <div className="runner-success-icon">
              <CheckCircle size={40} />
            </div>
            <h2 className="runner-success-title">Submission Confirmed!</h2>
            <p>
              Your responses have been successfully recorded.
              {traversedDelayNodes && emailInput && ` We've scheduled your follow-up survey and will dispatch a secure link to ${emailInput} when ready.`}
            </p>
            <button onClick={handleRestart} className="btn btn-secondary runner-restart-btn">
              Restart Survey Demo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
