import { useState } from 'react';
import { demoNodes, demoEdges } from './constants';
import { evaluateEdgeConditions } from '../../utils/graphLogic';
import type { NodeData } from '../../utils/graphLogic';

export const useLandingSimulator = () => {
  const [demoCurrentNode, setDemoCurrentNode] = useState<NodeData | null>(demoNodes[0]);
  const [demoAnswers, setDemoAnswers] = useState<Record<string, string | number | string[]>>({});
  const [demoHistory, setDemoHistory] = useState<string[]>([]);
  const [demoTraversedDelay, setDemoTraversedDelay] = useState(false);
  const [demoEmail, setDemoEmail] = useState('');
  const [demoIsSubmitted, setDemoIsSubmitted] = useState(false);
  const [demoError, setDemoError] = useState('');

  const handleDemoNext = () => {
    if (!demoCurrentNode) return;
    setDemoError('');

    const answer = demoAnswers[demoCurrentNode.id];
    if (demoCurrentNode.type === 'question' && (answer === undefined || answer === '')) {
      setDemoError('Please provide an answer before continuing.');
      return;
    }

    if (demoCurrentNode.type === 'question' && demoCurrentNode.questionType === 'input' && isNaN(Number(answer))) {
      setDemoError('Please enter a valid age (number).');
      return;
    }

    setDemoHistory(prev => [...prev, demoCurrentNode.id]);

    if (demoCurrentNode.type === 'delay') {
      setDemoTraversedDelay(true);
    }

    // Evaluate outgoing branches
    const outgoing = demoEdges.filter(e => e.source === demoCurrentNode.id);
    let nextId: string | null = null;

    // Check rules
    for (const edge of outgoing) {
      if (edge.rules && edge.rules.length > 0) {
        if (evaluateEdgeConditions(demoAnswers, edge.rules)) {
          nextId = edge.target;
          break;
        }
      }
    }

    // Default route
    if (!nextId) {
      const defEdge = outgoing.find(e => !e.rules || e.rules.length === 0);
      if (defEdge) {
        nextId = defEdge.target;
      }
    }

    if (nextId) {
      const nextNode = demoNodes.find(n => n.id === nextId);
      if (nextNode) {
        if (nextNode.type === 'delay') {
          setDemoTraversedDelay(true);
          // Auto traverse delay node to the next step
          const delayOutgoing = demoEdges.filter(e => e.source === nextNode.id);
          const nextNextId = delayOutgoing.length > 0 ? delayOutgoing[0].target : null;
          if (nextNextId) {
            const nextNextNode = demoNodes.find(n => n.id === nextNextId);
            if (nextNextNode) {
              setDemoCurrentNode(nextNextNode);
              return;
            }
          }
        }
        setDemoCurrentNode(nextNode);
      }
    }
  };

  const handleDemoBack = () => {
    if (demoHistory.length === 0) return;
    const prevHistory = [...demoHistory];
    const prevId = prevHistory.pop();
    setDemoHistory(prevHistory);
    setDemoError('');

    const prevNode = demoNodes.find(n => n.id === prevId);
    if (prevNode) {
      setDemoCurrentNode(prevNode);
    }
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (demoTraversedDelay && !demoEmail) {
      setDemoError('Email address is required for follow-up scheduling.');
      return;
    }
    setDemoIsSubmitted(true);
  };

  const resetDemo = () => {
    setDemoCurrentNode(demoNodes[0]);
    setDemoAnswers({});
    setDemoHistory([]);
    setDemoTraversedDelay(false);
    setDemoEmail('');
    setDemoIsSubmitted(false);
    setDemoError('');
  };

  return {
    demoCurrentNode,
    demoAnswers,
    setDemoAnswers,
    demoHistory,
    demoTraversedDelay,
    demoEmail,
    setDemoEmail,
    demoIsSubmitted,
    setDemoIsSubmitted,
    demoError,
    handleDemoNext,
    handleDemoBack,
    handleDemoSubmit,
    resetDemo
  };
};
