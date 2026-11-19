import { useEffect, useCallback } from 'react';
import type { Edge } from '@xyflow/react';
import type { CustomNode, SurveyItem, ExtendedEdge } from '../../types/builder';

export const useBuilderPersistence = (
  id: string | undefined,
  nodes: CustomNode[],
  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>,
  edges: Edge[],
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  surveyTitle: string,
  setSurveyTitle: (title: string) => void,
  setSurveyStatus: (status: string) => void,
  isLoaded: boolean,
  setIsLoaded: (loaded: boolean) => void,
  focusNode: (nodeId: string) => void,
  handleSelectEdgeById: (edgeId: string) => void,
  validateGraph: (silent?: boolean) => boolean,
  setToast: (toast: { message: string; type: 'success' | 'error' } | null) => void
) => {
  // Load Graph on Mount
  useEffect(() => {
    if (!id) return;
    const savedSurveys = localStorage.getItem('resonator_surveys');
    if (savedSurveys) {
      try {
        const list = JSON.parse(savedSurveys) as SurveyItem[];
        const found = list.find((s) => s.id === id);
        if (found) {
          setSurveyTitle(found.title);
          setSurveyStatus(found.status);
        }
      } catch { }
    }

    const savedGraph = localStorage.getItem(`resonator_graph_${id}`);
    if (savedGraph) {
      try {
        const graphData = JSON.parse(savedGraph);
        const loadedNodes = (graphData.nodes || []).map((n: CustomNode) => ({
          ...n,
          data: {
            ...n.data,
            onFocusWarning: () => focusNode(n.id)
          }
        }));
        setNodes(loadedNodes);

        const loadedEdges = (graphData.edges || []).map((e: ExtendedEdge) => ({
          ...e,
          type: 'custom',
          animated: true,
          rules: e.rules || e.data?.rules || [],
          data: {
            ...e.data,
            rules: e.rules || e.data?.rules || [],
            onSelect: () => handleSelectEdgeById(e.id)
          }
        }));
        setEdges(loadedEdges);
      } catch { }
    } else {
      setNodes([]);
      setEdges([]);
    }
    setIsLoaded(true);
  }, [id, setNodes, setEdges, focusNode, handleSelectEdgeById, setIsLoaded, setSurveyTitle, setSurveyStatus]);

  // Auto-save graph to localStorage
  useEffect(() => {
    if (!isLoaded || !id) return;
    const graphData = { nodes, edges };
    localStorage.setItem(`resonator_graph_${id}`, JSON.stringify(graphData));

    const savedSurveys = localStorage.getItem('resonator_surveys');
    if (savedSurveys) {
      try {
        const surveysList = JSON.parse(savedSurveys) as SurveyItem[];
        const updatedList = surveysList.map((s: SurveyItem) => {
          if (s.id === id) {
            return { ...s, title: surveyTitle, lastModified: 'Just now' };
          }
          return s;
        });
        localStorage.setItem('resonator_surveys', JSON.stringify(updatedList));
      } catch { }
    }
  }, [nodes, edges, surveyTitle, id, isLoaded]);

  // handleSave implementation
  const handleSave = useCallback((publish: boolean = false) => {
    if (!id) return;
    const isValid = validateGraph();
    if (!isValid && publish) return;

    const newStatus = publish ? 'published' : 'draft';
    setSurveyStatus(newStatus);

    const graphData = { nodes, edges };
    localStorage.setItem(`resonator_graph_${id}`, JSON.stringify(graphData));

    const savedSurveys = localStorage.getItem('resonator_surveys');
    let surveysList: SurveyItem[] = [];
    if (savedSurveys) {
      try {
        surveysList = JSON.parse(savedSurveys) as SurveyItem[];
      } catch { }
    }

    let exists = false;
    const updatedList = surveysList.map((s: SurveyItem) => {
      if (s.id === id) {
        exists = true;
        return { ...s, title: surveyTitle, status: newStatus, lastModified: 'Just now' };
      }
      return s;
    });

    if (!exists) {
      updatedList.unshift({
        id: id,
        title: surveyTitle,
        status: newStatus,
        lastModified: 'Just now',
        kpis: [
          { label: 'Total Responses', value: '0', change: '0%', icon: 'users' },
          { label: 'Completion Rate', value: '0%', change: '0%', icon: 'percent' },
          { label: 'Avg. Finish Time', value: '0s', change: '0s', icon: 'clock' },
          { label: 'Follow-ups Triggered', value: '0', change: '0% email rate', icon: 'check-circle' }
        ],
        timeline: [],
        dropOff: [],
        pie: [],
        questions: [],
        logs: []
      });
    }

    localStorage.setItem('resonator_surveys', JSON.stringify(updatedList));

    setToast({
      message: publish
        ? 'Flow published successfully! Survey links are active.'
        : 'Draft saved successfully.',
      type: 'success'
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, [id, nodes, edges, surveyTitle, validateGraph, setSurveyStatus, setToast]);

  return { handleSave };
};
