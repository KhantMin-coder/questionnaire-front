import { useState, useEffect, useMemo } from 'react';
import { evaluateEdgeConditions } from '../../utils/graphLogic';
import type { NodeData, GraphEdge } from '../../utils/graphLogic';
import type { CustomNode, ExtendedEdge, SurveyItem } from '../../types/builder';

export const useRunnerState = (id: string | undefined, defaultNodes: NodeData[], defaultEdges: GraphEdge[]) => {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [currentNode, setCurrentNode] = useState<NodeData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Derive traversed delay nodes dynamically from the active path so Back navigation stays consistent
  const traversedDelayNodesList = useMemo<NodeData[]>(() => {
    const activeIds = new Set([...history, ...(currentNode ? [currentNode.id] : [])]);
    return nodes.filter((n) => n.type === 'delay' && activeIds.has(n.id));
  }, [nodes, history, currentNode]);

  const traversedDelayNodes = traversedDelayNodesList.length > 0;

  useEffect(() => {
    if (id) {
      localStorage.setItem('resonator_active_survey_id', id);
      window.dispatchEvent(new Event('active_survey_changed'));
    }

    let token = localStorage.getItem('resonator_respondent_uuid');
    if (!token) {
      token = `resp_${crypto.randomUUID()}`;
      localStorage.setItem('resonator_respondent_uuid', token);
    }
    document.cookie = `resonator_respondent_uuid=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
    setSessionToken(token);

    let loadedNodes = defaultNodes;
    let loadedEdges = defaultEdges;

    if (id) {
      const savedGraph = localStorage.getItem(`resonator_graph_${id}`);
      if (savedGraph) {
        try {
          const parsed = JSON.parse(savedGraph);
          if (Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
            loadedNodes = parsed.nodes.map((n: CustomNode) => ({
              id: n.id,
              type: (n.type || 'question') as 'question' | 'delay' | 'terminal',
              label: n.data?.label || n.data?.terminalMessage || n.data?.delayDuration || '',
              helperText: n.data?.helperText,
              questionType: n.data?.questionType,
              inputType: n.data?.inputType,
              options: n.data?.options || [],
              delayDuration: n.data?.delayDuration,
              targetQuestionnaireId: n.data?.targetQuestionnaireId,
              targetQuestionnaireName: n.data?.targetQuestionnaireName,
              terminalMessage: n.data?.terminalMessage,
              isDisqualification: n.data?.isDisqualification,
              allowOther: n.data?.allowOther
            }));
          }
          if (Array.isArray(parsed.edges)) {
            loadedEdges = parsed.edges.map((e: ExtendedEdge) => ({
              id: e.id,
              source: e.source,
              target: e.target,
              rules: e.rules || e.data?.rules || []
            }));
          }
        } catch {
          // Fallback to default if parsing failed
        }
      }
    }

    setNodes(loadedNodes);
    setEdges(loadedEdges);

    // Restore auto-saved respondent progress if available
    if (id) {
      const savedProgress = localStorage.getItem(`resonator_runner_progress_${id}`);
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);
          const restoredNode = loadedNodes.find((n) => n.id === progress.currentNodeId);
          if (restoredNode && progress.answers && Array.isArray(progress.history)) {
            setAnswers(progress.answers);
            setHistory(progress.history);
            setCurrentNode(restoredNode);
            return;
          }
        } catch {
          localStorage.removeItem(`resonator_runner_progress_${id}`);
        }
      }
    }

    if (loadedNodes.length > 0) {
      const targets = new Set(loadedEdges.map(e => e.target));
      const rootNode = loadedNodes.find(n => !targets.has(n.id)) || loadedNodes[0];
      setCurrentNode(rootNode);
    }
  }, [id, defaultNodes, defaultEdges]);

  // Auto-save respondent progress across reloads (without dispatching follow-ups until final submission)
  useEffect(() => {
    if (!id || !currentNode || isSubmitted) return;
    localStorage.setItem(
      `resonator_runner_progress_${id}`,
      JSON.stringify({
        currentNodeId: currentNode.id,
        answers,
        history
      })
    );
  }, [id, currentNode, answers, history, isSubmitted]);

  const handleNext = (): void => {
    if (!currentNode) return;
    setErrorMsg('');

    const currentAnswer = answers[currentNode.id];
    const isEmptyArray = Array.isArray(currentAnswer) && currentAnswer.length === 0;
    if (currentNode.type === 'question') {
      if (currentAnswer === undefined || currentAnswer === '' || isEmptyArray) {
        setErrorMsg('Please provide an answer before continuing.');
        return;
      }
      if (currentNode.questionType === 'input' && currentNode.inputType === 'number' && Number.isNaN(Number(currentAnswer))) {
        setErrorMsg('Please enter a valid number.');
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

    setHistory(prev => [...prev, currentNode.id]);

    const outgoingEdges = edges.filter(e => e.source === currentNode.id);
    let nextNodeId: string | null = null;

    for (const edge of outgoingEdges) {
      const edgeRules = edge.rules || edge.data?.rules;
      if (edgeRules && edgeRules.length > 0) {
        if (evaluateEdgeConditions(answers, edgeRules)) {
          nextNodeId = edge.target;
          break;
        }
      }
    }

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
        setCurrentNode(nextNode);
      }
    } else {
      setErrorMsg('No outgoing path matches your input. End of questionnaire.');
    }
  };

  const handleBack = (): void => {
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

  const handleRestart = (): void => {
    setAnswers({});
    setHistory([]);
    setEmailInput('');
    setIsSubmitted(false);
    setErrorMsg('');
    if (id) {
      localStorage.removeItem(`resonator_runner_progress_${id}`);
    }
    const targets = new Set(edges.map(e => e.target));
    const rootNode = nodes.find(n => !targets.has(n.id)) || nodes[0];
    setCurrentNode(rootNode || null);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = emailInput.trim();
    if (traversedDelayNodes && !trimmedEmail) {
      setErrorMsg('An email address is required to schedule your follow-up survey.');
      return;
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (id) {
      localStorage.removeItem(`resonator_runner_progress_${id}`);
      const savedSurveys = localStorage.getItem('resonator_surveys');
      if (savedSurveys) {
        try {
          const parsed: unknown = JSON.parse(savedSurveys);
          if (Array.isArray(parsed)) {
            const list = parsed as SurveyItem[];
            const updatedList = list.map((s: SurveyItem) => {
              if (s.id === id) {
                const currentTotal = parseInt(s.kpis?.[0]?.value?.replace(/,/g, '') || '0', 10) + 1;
                const scheduledCount = traversedDelayNodesList.length;
                const currentFollowUps = parseInt(s.kpis?.[3]?.value?.replace(/,/g, '') || '0', 10) + scheduledCount;
                const updatedKpis = [
                  { ...s.kpis[0], value: currentTotal.toLocaleString() },
                  s.kpis[1],
                  s.kpis[2],
                  { ...s.kpis[3], value: currentFollowUps.toLocaleString() }
                ];

                const generatedLogs =
                  trimmedEmail && traversedDelayNodesList.length > 0
                    ? traversedDelayNodesList.map((dNode) => ({
                        email: trimmedEmail,
                        original: s.title,
                        followUp: dNode.targetQuestionnaireName || 'Scheduled Follow-up',
                        status: `Awaiting dispatch (${dNode.delayDuration || '24h'})`
                      }))
                    : [];

                const newLogs = [...generatedLogs, ...(s.logs || [])];

                return {
                  ...s,
                  kpis: updatedKpis,
                  logs: newLogs,
                  lastModified: 'Just now'
                };
              }
              return s;
            });
            localStorage.setItem('resonator_surveys', JSON.stringify(updatedList));
            window.dispatchEvent(new Event('active_survey_changed'));
          }
        } catch {
          // Ignore storage update errors
        }
      }
    }

    setIsSubmitted(true);
  };

  return {
    currentNode,
    setCurrentNode,
    answers,
    setAnswers,
    history,
    traversedDelayNodes,
    traversedDelayNodesList,
    emailInput,
    setEmailInput,
    isSubmitted,
    setIsSubmitted,
    errorMsg,
    setErrorMsg,
    sessionToken,
    handleNext,
    handleBack,
    handleRestart,
    handleSubmit
  };
};
