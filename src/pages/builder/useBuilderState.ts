import { useState, useCallback, useEffect, useRef } from 'react';
import { useNodesState, useEdgesState, addEdge, useReactFlow } from '@xyflow/react';
import type { Connection, Edge } from '@xyflow/react';
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

  // Keep a mutable ref of nodes to avoid dependency loops in focusNode callback
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const focusNode = useCallback((nodeId: string) => {
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

  const handleSelectEdgeById = useCallback((edgeId: string) => {
    setEdges((eds) => {
      const found = eds.find((e) => e.id === edgeId);
      if (found) {
        setSelectedEdge(found as ExtendedEdge);
        setSelectedNode(null);
        setIsSidebarOpen(true);
        setActiveSidebarTab('properties');
      }
      return eds;
    });
  }, [setEdges]);

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
    (params: Connection) => {
      const newEdgeId = `e-${params.source}-${params.target}`;
      const newEdge: ExtendedEdge = {
        ...params,
        id: newEdgeId,
        type: 'custom',
        animated: true,
        data: {
          rules: [],
          onSelect: () => {
            setEdges((eds) => {
              const found = eds.find((e) => e.id === newEdgeId);
              if (found) {
                setSelectedEdge(found as ExtendedEdge);
                setSelectedNode(null);
                setIsSidebarOpen(true);
                setActiveSidebarTab('properties');
              }
              return eds;
            });
          }
        }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNode(node as CustomNode);
    setSelectedEdge(null);
    setIsSidebarOpen(true);
    setActiveSidebarTab('properties');
  }, []);

  const onEdgeClick = useCallback((_: any, edge: any) => {
    setSelectedEdge(edge as ExtendedEdge);
    setSelectedNode(null);
    setIsSidebarOpen(true);
    setActiveSidebarTab('properties');
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setIsSidebarOpen(false);
  }, []);

  const updateSelectedNodeData = useCallback((updates: Partial<CustomNode['data']>) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          const updatedNode = {
            ...n,
            data: { ...n.data, ...updates }
          } as CustomNode;
          setSelectedNode(updatedNode);
          return updatedNode;
        }
        return n;
      })
    );
  }, [selectedNode, setNodes]);

  const propagateOptionRename = useCallback((nodeId: string, oldVal: string, newVal: string) => {
    setEdges((eds) =>
      eds.map((edge) => {
        const extEdge = edge as ExtendedEdge;
        if (extEdge.source === nodeId && extEdge.rules) {
          const updatedRules = extEdge.rules.map((rule: EdgeRule) => {
            if (rule.operator === '==' && rule.value === oldVal) {
              return { ...rule, value: newVal };
            }
            return rule;
          });
          const updatedEdge = {
            ...extEdge,
            rules: updatedRules,
            data: {
              ...extEdge.data,
              rules: updatedRules,
            }
          } as ExtendedEdge;
          if (selectedEdge && selectedEdge.id === extEdge.id) {
            setSelectedEdge(updatedEdge);
          }
          return updatedEdge;
        }
        return edge;
      })
    );
  }, [selectedEdge, setEdges]);

  const updateSelectedEdgeRules = useCallback((rules: EdgeRule[]) => {
    if (!selectedEdge) return;
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === selectedEdge.id) {
          const updatedEdge = {
            ...e,
            rules,
            data: { ...e.data, rules }
          } as ExtendedEdge;
          setSelectedEdge(updatedEdge);
          return updatedEdge;
        }
        return e;
      })
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
    propagateOptionRename,
    updateSelectedEdgeRules,
    handleSave
  };
};
