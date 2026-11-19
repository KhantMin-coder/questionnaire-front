import { useState, useCallback, useEffect, useRef } from 'react';
import { useNodesState, useEdgesState, addEdge, useReactFlow } from '@xyflow/react';
import type { Connection, Edge, Node } from '@xyflow/react';
import type { CustomNode, ExtendedEdge, ValidationWarning } from '../../types/builder';
import type { EdgeRule } from '../../utils/graphLogic';

// Custom Hooks
import { useGraphValidation } from './useGraphValidation';
import { useBuilderPersistence } from './useBuilderPersistence';

export const useBuilderState = (id: string | undefined) => {
  const { getNode, setCenter } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [surveyTitle, setSurveyTitle] = useState('Untitled Questionnaire');
  const [surveyStatus, setSurveyStatus] = useState('draft');
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<ExtendedEdge | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'properties' | 'issues'>('properties');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [validationResult, setValidationResult] = useState<{
    status: 'idle' | 'success' | 'warning' | 'error';
    message: string;
    warnings?: ValidationWarning[];
  }>({
    status: 'idle',
    message: '',
    warnings: []
  });

  // Keep mutable refs of nodes and edges to avoid side-effects inside state updaters
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const edgesRef = useRef(edges);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  useEffect(() => {
    if (id) {
      localStorage.setItem('resonator_active_survey_id', id);
      window.dispatchEvent(new Event('active_survey_changed'));
    }
  }, [id]);

  const focusNode = useCallback((nodeId: string): void => {
    const node = getNode(nodeId);
    if (node) {
      const latestNodes = nodesRef.current;
      const fullNode = latestNodes.find((n) => n.id === nodeId);
      if (fullNode) {
        setSelectedNode(fullNode);
        setSelectedEdge(null);
        setIsSidebarOpen(true);
        setActiveSidebarTab('properties');
      }

      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === nodeId,
        }))
      );

      const x = (node.position?.x || 0) + (node.measured?.width || 0) / 2;
      const y = (node.position?.y || 0) + (node.measured?.height || 0) / 2;
      setCenter(x, y, { zoom: 1.2, duration: 800 });
    }
  }, [getNode, setCenter, setNodes]);

  const handleSelectEdgeById = useCallback((edgeId: string): void => {
    const found = edgesRef.current.find((e) => e.id === edgeId);
    if (found) {
      setSelectedEdge(found as ExtendedEdge);
      setSelectedNode(null);
      setIsSidebarOpen(true);
      setActiveSidebarTab('properties');
    }
  }, []);

  // validation hook composition
  const { validateGraph } = useGraphValidation(
    nodes,
    setNodes,
    edges,
    focusNode,
    setIsSidebarOpen,
    setActiveSidebarTab,
    setValidationResult
  );

  // persistence hook composition
  const { handleSave } = useBuilderPersistence(
    id,
    nodes,
    setNodes,
    edges,
    setEdges,
    surveyTitle,
    setSurveyTitle,
    setSurveyStatus,
    isLoaded,
    setIsLoaded,
    focusNode,
    handleSelectEdgeById,
    validateGraph,
    setToast
  );

  // Live validation background sync
  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      validateGraph(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [nodes, edges, isLoaded, validateGraph]);

  const onConnect = useCallback(
    (params: Connection): void => {
      const newEdgeId = `e-${params.source}-${params.target}`;
      const newEdge: ExtendedEdge = {
        ...params,
        id: newEdgeId,
        type: 'custom',
        animated: true,
        rules: [],
        data: {
          rules: [],
          onSelect: () => handleSelectEdgeById(newEdgeId)
        }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, handleSelectEdgeById]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node): void => {
    setSelectedNode(node as CustomNode);
    setSelectedEdge(null);
    setIsSidebarOpen(true);
    setActiveSidebarTab('properties');
  }, []);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge): void => {
    setSelectedEdge(edge as ExtendedEdge);
    setSelectedNode(null);
    setIsSidebarOpen(true);
    setActiveSidebarTab('properties');
  }, []);

  const onPaneClick = useCallback((): void => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setIsSidebarOpen(false);
  }, []);

  const updateSelectedNodeData = useCallback((updates: Partial<CustomNode['data']>): void => {
    if (!selectedNode) return;
    const targetId = selectedNode.id;

    setNodes((nds) =>
      nds.map((n) =>
        n.id === targetId
          ? ({
              ...n,
              data: { ...n.data, ...updates }
            } as CustomNode)
          : n
      )
    );

    setSelectedNode((prev) =>
      prev && prev.id === targetId
        ? ({
            ...prev,
            data: { ...prev.data, ...updates }
          } as CustomNode)
        : prev
    );
  }, [selectedNode, setNodes]);

  const duplicateSelectedNode = useCallback((): void => {
    if (!selectedNode) return;
    const newNodeId = `q_${Date.now()}`;
    const duplicatedNode: CustomNode = {
      ...selectedNode,
      id: newNodeId,
      selected: true,
      position: {
        x: selectedNode.position.x + 40,
        y: selectedNode.position.y + 40
      },
      data: {
        ...selectedNode.data,
        label: selectedNode.data.label ? `${selectedNode.data.label} (Copy)` : 'Untitled (Copy)',
        options: selectedNode.data.options ? [...selectedNode.data.options] : undefined,
        warnings: [],
        onFocusWarning: () => focusNode(newNodeId)
      }
    };

    setNodes((nds) => [
      ...nds.map((n): CustomNode => ({ ...n, selected: false })),
      duplicatedNode
    ]);
    setSelectedNode(duplicatedNode);
  }, [selectedNode, setNodes, focusNode]);

  const propagateOptionRename = useCallback((nodeId: string, oldVal: string, newVal: string): void => {
    setEdges((eds) =>
      eds.map((edge) => {
        const extEdge = edge as ExtendedEdge;
        if (extEdge.source === nodeId && extEdge.rules) {
          const updatedRules = extEdge.rules.map((rule: EdgeRule) => {
            if ((rule.operator === '==' || rule.operator === '!=') && rule.value === oldVal) {
              return { ...rule, value: newVal };
            }
            return rule;
          });
          return {
            ...extEdge,
            rules: updatedRules,
            data: {
              ...extEdge.data,
              rules: updatedRules,
            }
          } as ExtendedEdge;
        }
        return edge;
      })
    );

    setSelectedEdge((prev) => {
      if (!prev || prev.source !== nodeId || !prev.rules) return prev;
      const updatedRules = prev.rules.map((rule: EdgeRule) =>
        (rule.operator === '==' || rule.operator === '!=') && rule.value === oldVal
          ? { ...rule, value: newVal }
          : rule
      );
      return {
        ...prev,
        rules: updatedRules,
        data: {
          ...prev.data,
          rules: updatedRules
        }
      } as ExtendedEdge;
    });
  }, [setEdges]);

  const updateSelectedEdgeRules = useCallback((rules: EdgeRule[]): void => {
    if (!selectedEdge) return;
    const targetEdgeId = selectedEdge.id;

    setEdges((eds) =>
      eds.map((e) =>
        e.id === targetEdgeId
          ? ({
              ...e,
              rules,
              data: { ...e.data, rules }
            } as ExtendedEdge)
          : e
      )
    );

    setSelectedEdge((prev) =>
      prev && prev.id === targetEdgeId
        ? ({
            ...prev,
            rules,
            data: { ...prev.data, rules }
          } as ExtendedEdge)
        : prev
    );
  }, [selectedEdge, setEdges]);

  return {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    surveyTitle,
    setSurveyTitle,
    surveyStatus,
    selectedNode,
    setSelectedNode,
    selectedEdge,
    setSelectedEdge,
    isSidebarOpen,
    setIsSidebarOpen,
    activeSidebarTab,
    setActiveSidebarTab,
    toast,
    isLoaded,
    validationResult,
    focusNode,
    validateGraph,
    onConnect,
    onNodeClick,
    onEdgeClick,
    onPaneClick,
    updateSelectedNodeData,
    duplicateSelectedNode,
    propagateOptionRename,
    updateSelectedEdgeRules,
    handleSave
  };
};
