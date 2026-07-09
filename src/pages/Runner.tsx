import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Mail, AlertCircle } from 'lucide-react';
import { evaluateEdgeConditions } from '../utils/graphLogic';
import type { NodeData, GraphEdge, EdgeRule } from '../utils/graphLogic';
import './Runner.css';

// Sample mock nodes & edges matching the visual builder mock
const questionnaireNodes: NodeData[] = [
  { id: '1', type: 'question', label: 'How old are you?', questionType: 'input' },
  { id: '2', type: 'question', label: 'Which framework do you prefer?', questionType: 'single', options: ['React', 'Vue', 'Svelte'] },
  { id: '3', type: 'delay', label: 'Delay Follow-up target', delayDuration: '2 days', options: [] },
  { id: '4', type: 'terminal', label: 'Completion', terminalMessage: 'Thank you for completing the survey!' },
  { id: '5', type: 'terminal', label: 'Disqualification', terminalMessage: 'Survey ended. You must be over 18 to participate.' }
];

const questionnaireEdges: GraphEdge[] = [
  // Edge 1 -> 5: if age < 18
  { id: 'e1-5', source: '1', target: '5', rules: [{ field: '1', operator: '<', value: '18' }] },
  // Edge 1 -> 2: if age >= 18
  { id: 'e1-2', source: '1', target: '2', rules: [{ field: '1', operator: '>=', value: '18' }] },
  // Edge 2 -> 3: if choice is Vue or Svelte (or anything other than React)
  { id: 'e2-3', source: '2', target: '3', rules: [{ field: '2', operator: '!=', value: 'React' }] },
  // Edge 2 -> 4: if choice is React
  { id: 'e2-4', source: '2', target: '4', rules: [{ field: '2', operator: '==', value: 'React' }] },
  // Edge 3 -> 4: default flow
  { id: 'e3-4', source: '3', target: '4', rules: [] }
];

export const Runner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [currentNode, setCurrentNode] = useState<NodeData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number | string[] | null | undefined>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [traversedDelayNodes, setTraversedDelayNodes] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 1. Initialize respondent session and load graph
  useEffect(() => {
    let token = localStorage.getItem('resonator_respondent_uuid');
    if (!token) {
      token = 'resp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('resonator_respondent_uuid', token);
    }
    setSessionToken(token);

    // Try to load graph from localStorage
    let loadedNodes: NodeData[] = questionnaireNodes;
    let loadedEdges: GraphEdge[] = questionnaireEdges;

    if (id) {
      const savedGraph = localStorage.getItem(`resonator_graph_${id}`);
      if (savedGraph) {
        try {
          const parsed = JSON.parse(savedGraph);
          // Convert react flow nodes to runner nodes
          if (parsed.nodes && parsed.nodes.length > 0) {
            loadedNodes = parsed.nodes.map((n: { id: string; type: string; data?: Record<string, unknown> }) => {
              return {
                id: n.id,
                type: n.type as 'question' | 'delay' | 'terminal',
                label: (n.data?.label as string) || (n.data?.terminalMessage as string) || (n.data?.delayDuration as string) || '',
                questionType: n.data?.questionType as 'single' | 'multi' | 'input',
                options: (n.data?.options as string[]) || [],
                delayDuration: n.data?.delayDuration as string,
                terminalMessage: n.data?.terminalMessage as string,
                isDisqualification: n.data?.isDisqualification as boolean,
                allowOther: n.data?.allowOther as boolean
              };
            });
          }
          if (parsed.edges) {
            loadedEdges = parsed.edges.map((e: { id: string; source: string; target: string; rules?: EdgeRule[]; data?: { rules?: EdgeRule[] } }) => {
              return {
                id: e.id,
                source: e.source,
                target: e.target,
                rules: e.rules || e.data?.rules || []
              };
            });
          }
        } catch (e) {
          console.error("Failed to parse graph", e);
        }
      }
    }

    setNodes(loadedNodes);
    setEdges(loadedEdges);
    
    // Find the starting root node (first node that is not a target of any edge)
    if (loadedNodes.length > 0) {
      const targets = new Set(loadedEdges.map(e => e.target));
      const rootNode = loadedNodes.find(n => !targets.has(n.id)) || loadedNodes[0];
      setCurrentNode(rootNode);
    }
  }, [id]);

  const handleNext = () => {
    if (!currentNode) return;
    setErrorMsg('');

    // Field validation check
    const currentAnswer = answers[currentNode.id];
    const isEmptyArray = Array.isArray(currentAnswer) && currentAnswer.length === 0;
    if (currentNode.type === 'question') {
      if (currentAnswer === undefined || currentAnswer === '' || isEmptyArray) {
        setErrorMsg('Please provide an answer before continuing.');
        return;
      }
      if (typeof currentAnswer === 'string' && currentAnswer === 'Other') {
        setErrorMsg('Please specify your "Other" answer.');
        return;
      }
      if (Array.isArray(currentAnswer) && currentAnswer.includes('Other')) {
        setErrorMsg('Please specify your "Other" answer.');
        return;
      }
    }

    // Keep history path for back navigation
    setHistory(prev => [...prev, currentNode.id]);

    // Check if the current node is a delay node
    if (currentNode.type === 'delay') {
      setTraversedDelayNodes(true);
    }

    // Evaluate outgoing edges to find next node
    const outgoingEdges = edges.filter(e => e.source === currentNode.id);
    let nextNodeId: string | null = null;

    // Check conditional edges first
    for (const edge of outgoingEdges) {
      const edgeRules = edge.rules || edge.data?.rules;
      if (edgeRules && edgeRules.length > 0) {
        if (evaluateEdgeConditions(answers, edgeRules)) {
          nextNodeId = edge.target;
          break;
        }
      }
    }

    // Check fallback/default edges if no condition was matched
    if (!nextNodeId) {
      const defaultEdge = outgoingEdges.find(e => {
        const edgeRules = e.rules || e.data?.rules;
        return !edgeRules || edgeRules.length === 0;
      });
      if (defaultEdge) {
        nextNodeId = defaultEdge.target;
      }
    }

    if (nextNodeId) {
      const nextNode = nodes.find(n => n.id === nextNodeId);
      if (nextNode) {
        // If nextNode is a delay node, we automatically traverse it and go to its child
        if (nextNode.type === 'delay') {
          setTraversedDelayNodes(true);
          // Let's set it as current, but automatically find the node after this delay
          setCurrentNode(nextNode);
        } else {
          setCurrentNode(nextNode);
        }
      }
    } else {
      // Fallback in case graph has dead end
      setErrorMsg('No outgoing path matches your input. End of questionnaire.');
    }
  };

  const handleBack = () => {
    if (history.length === 0) return;
    setErrorMsg('');
    const prevHistory = [...history];
    const prevNodeId = prevHistory.pop();
    setHistory(prevHistory);

    const prevNode = nodes.find(n => n.id === prevNodeId);
    if (prevNode) {
      setCurrentNode(prevNode);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setHistory([]);
    setTraversedDelayNodes(false);
    setEmailInput('');
    setIsSubmitted(false);
    setErrorMsg('');
    // Find root node again
    const targets = new Set(edges.map(e => e.target));
    const rootNode = nodes.find(n => !targets.has(n.id)) || nodes[0];
    setCurrentNode(rootNode || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (traversedDelayNodes && !emailInput) {
      setErrorMsg('An email address is required to schedule your follow-up survey.');
      return;
    }

    // Success response trigger
    setIsSubmitted(true);
  };

  // Check if terminal node
  const isTerminal = currentNode?.type === 'terminal';

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
            {/* Header / Session badge */}
            <div className="runner-header">
              <span className="runner-progress-info">
                Session: {sessionToken.substring(0, 12)}...
              </span>
              {history.length > 0 && !isTerminal && (
                <button
                  onClick={handleBack}
                  className="runner-back-btn"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="runner-error">
                <AlertCircle size={16} />
                {errorMsg}
              </div>
            )}

            {/* Main Content Pane */}
            {currentNode && (
              <div className="runner-content-pane">
                {currentNode.type === 'question' && (
                  <>
                    <h2 className="runner-question-title">
                      {currentNode.label}
                    </h2>

                    {currentNode.questionType === 'input' && (
                      <div className="form-group margin-bottom-0">
                        <input
                          id={`ans-${currentNode.id}`}
                          className="form-input"
                          type="text"
                          placeholder="Your answer..."
                          value={answers[currentNode.id] || ''}
                          onChange={(e) => setAnswers({ ...answers, [currentNode.id]: e.target.value })}
                        />
                      </div>
                    )}

                    {currentNode.questionType === 'single' && currentNode.options && (
                      <div className="runner-options-list">
                        {currentNode.options.map((opt, idx) => (
                          <label
                            key={idx}
                            className="glass-panel runner-option-label"
                            style={{
                              border: answers[currentNode.id] === opt 
                                ? '1.5px solid var(--primary-color)' 
                                : '1px solid var(--panel-border)',
                              backgroundColor: answers[currentNode.id] === opt 
                                ? 'var(--primary-glow)' 
                                : 'var(--panel-bg)'
                            }}
                          >
                            <input
                              type="radio"
                              name={`ans-${currentNode.id}`}
                              checked={answers[currentNode.id] === opt}
                              onChange={() => setAnswers({ ...answers, [currentNode.id]: opt })}
                              className="runner-option-radio"
                            />
                            <span className="runner-option-text">
                              {opt}
                            </span>
                          </label>
                        ))}
                        
                        {currentNode.allowOther && (
                          <>
                            {(() => {
                              const ansStr = String(answers[currentNode.id] || '');
                              const isOtherSelected = ansStr.startsWith('Other');
                              const otherText = ansStr.startsWith('Other: ') ? ansStr.substring(7) : '';
                              return (
                                <>
                                  <label
                                    className="glass-panel runner-option-label"
                                    style={{
                                      border: isOtherSelected 
                                        ? '1.5px solid var(--primary-color)' 
                                        : '1px solid var(--panel-border)',
                                      backgroundColor: isOtherSelected 
                                        ? 'var(--primary-glow)' 
                                        : 'var(--panel-bg)'
                                    }}
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
                              );
                            })()}
                          </>
                        )}
                      </div>
                    )}

                    {currentNode.questionType === 'multi' && currentNode.options && (
                      <div className="runner-options-list">
                        {(() => {
                          const currentList = Array.isArray(answers[currentNode.id]) ? (answers[currentNode.id] as string[]) : [];
                          const isOtherChecked = currentList.some(item => item.startsWith('Other'));
                          const otherItem = currentList.find(item => item.startsWith('Other'));
                          const otherText = otherItem && otherItem.startsWith('Other: ') ? otherItem.substring(7) : '';

                          return (
                            <>
                              {currentNode.options.map((opt, idx) => {
                                const isChecked = currentList.includes(opt);
                                return (
                                  <label
                                    key={idx}
                                    className="glass-panel runner-option-label"
                                    style={{
                                      border: isChecked 
                                        ? '1.5px solid var(--primary-color)' 
                                        : '1px solid var(--panel-border)',
                                      backgroundColor: isChecked 
                                        ? 'var(--primary-glow)' 
                                        : 'var(--panel-bg)'
                                    }}
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
                                    <span className="runner-option-text">
                                      {opt}
                                    </span>
                                  </label>
                                );
                              })}

                              {currentNode.allowOther && (
                                <>
                                  <label
                                    className="glass-panel runner-option-label"
                                    style={{
                                      border: isOtherChecked 
                                        ? '1.5px solid var(--primary-color)' 
                                        : '1px solid var(--panel-border)',
                                      backgroundColor: isOtherChecked 
                                        ? 'var(--primary-glow)' 
                                        : 'var(--panel-bg)'
                                    }}
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
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </>
                )}

                {currentNode.type === 'delay' && (
                  <div className="runner-delay-section">
                    <div className="runner-status-icon runner-status-icon--delay">
                      <Mail size={32} />
                    </div>
                    <h2 className="runner-question-title">Follow-up Scheduled</h2>
                    <p className="runner-delay-desc">
                      Based on your input, a follow-up questionnaire will be triggered in <strong>{currentNode.delayDuration}</strong>.
                    </p>
                  </div>
                )}

                {currentNode.type === 'terminal' && (
                  <div className="runner-terminal-section">
                    <div className="runner-status-icon runner-status-icon--terminal">
                      <CheckCircle size={36} />
                    </div>
                    <h2 className="runner-question-title">
                      {currentNode.terminalMessage}
                    </h2>

                    {/* Email Capture Section for follow-ups */}
                    {traversedDelayNodes ? (
                      <form onSubmit={handleSubmit} className="runner-email-form">
                        <div className="form-group">
                          <label className="form-label" htmlFor="email-capture">Email address required</label>
                          <p className="runner-email-hint">
                            We need your email to send the scheduled follow-up survey link.
                          </p>
                          <input
                            id="email-capture"
                            className="form-input"
                            type="email"
                            placeholder="you@example.com"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            required
                          />
                        </div>
                        <button type="submit" className="btn btn-primary runner-submit-btn">
                          Submit Answers & Schedule Follow-ups
                        </button>
                      </form>
                    ) : (
                      <div className="runner-complete-section">
                        <button onClick={handleSubmit} className="btn btn-primary runner-complete-btn">
                          Complete Survey
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
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
              {traversedDelayNodes && ` We've scheduled your follow-up survey and will dispatch a secure link to ${emailInput} when ready.`}
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
