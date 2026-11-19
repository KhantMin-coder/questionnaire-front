import { useState, useEffect } from 'react';
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
  const [traversedDelayNodes, setTraversedDelayNodes] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (id) {
      localStorage.setItem('resonator_active_survey_id', id);
      window.dispatchEvent(new Event('active_survey_changed'));
    }
    let token = localStorage.getItem('resonator_respondent_uuid');
    if (!token) {
      token = 'resp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('resonator_respondent_uuid', token);
    }
    setSessionToken(token);

    let loadedNodes = defaultNodes;
    let loadedEdges = defaultEdges;

    if (id) {
      const savedGraph = localStorage.getItem(`resonator_graph_${id}`);
      if (savedGraph) {
        try {
          const parsed = JSON.parse(savedGraph);
          if (parsed.nodes && parsed.nodes.length > 0) {
            loadedNodes = parsed.nodes.map((n: CustomNode) => ({
              id: n.id,
              type: (n.type || 'question') as 'question' | 'delay' | 'terminal',
              label: n.data?.label || n.data?.terminalMessage || n.data?.delayDuration || '',
              questionType: n.data?.questionType,
              options: n.data?.options || [],
              delayDuration: n.data?.delayDuration,
              terminalMessage: n.data?.terminalMessage,
              isDisqualification: n.data?.isDisqualification,
              allowOther: n.data?.allowOther
            }));
          }
          if (parsed.edges) {
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

    if (loadedNodes.length > 0) {
      const targets = new Set(loadedEdges.map(e => e.target));
      const rootNode = loadedNodes.find(n => !targets.has(n.id)) || loadedNodes[0];
      setCurrentNode(rootNode);
    }
  }, [id, defaultNodes, defaultEdges]);

  const handleNext = () => {
    if (!currentNode) return;
    setErrorMsg('');

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

    setHistory(prev => [...prev, currentNode.id]);

    if (currentNode.type === 'delay') {
      setTraversedDelayNodes(true);
    }

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
        if (nextNode.type === 'delay') {
          setTraversedDelayNodes(true);
          setCurrentNode(nextNode);
        } else {
          setCurrentNode(nextNode);
        }
      }
    } else {
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

    if (id) {
      const savedSurveys = localStorage.getItem('resonator_surveys');
      if (savedSurveys) {
        try {
          const list = JSON.parse(savedSurveys) as SurveyItem[];
          const updatedList = list.map((s: SurveyItem) => {
            if (s.id === id) {
              const currentTotal = parseInt(s.kpis?.[0]?.value?.replace(/,/g, '') || '0', 10) + 1;
              const currentFollowUps = parseInt(s.kpis?.[3]?.value?.replace(/,/g, '') || '0', 10) + (traversedDelayNodes ? 1 : 0);
              const updatedKpis = [
                { ...s.kpis[0], value: currentTotal.toLocaleString() },
                s.kpis[1],
                s.kpis[2],
                { ...s.kpis[3], value: currentFollowUps.toLocaleString() }
              ];
              const newLogs = emailInput ? [{
                email: emailInput,
                original: s.title,
                followUp: 'Scheduled Follow-up',
                status: 'Awaiting dispatch'
              }, ...(s.logs || [])] : s.logs;

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
