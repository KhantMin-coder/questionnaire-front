import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath
} from '@xyflow/react';
import type { Connection, Edge, NodeProps, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './Builder.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Trash2, AlertTriangle, CheckCircle2, Sliders, Clock, HelpCircle as QuestionIcon, ArrowLeft } from 'lucide-react';
import { detectCycle, validateFollowUpDepth } from '../utils/graphLogic';
import type { EdgeRule } from '../utils/graphLogic';

export interface SurveyItem {
  id: string;
  title: string;
  status: 'published' | 'draft';
  lastModified: string;
  kpis?: Array<{
    label: string;
    value: string;
    change: string;
    icon: string;
  }>;
  timeline?: any[];
  dropOff?: any[];
  pie?: any[];
  questions?: any[];
  logs?: any[];
}

export interface CustomNode extends Node {
  data: {
    label?: string;
    questionType?: 'single' | 'multi' | 'input';
    options?: string[];
    delayDuration?: string;
    targetQuestionnaireId?: string;
    targetQuestionnaireName?: string;
    isDisqualification?: boolean;
    terminalMessage?: string;
    [key: string]: any;
  };
}

// Custom Node Components
const QuestionNode: React.FC<NodeProps<CustomNode>> = ({ data }) => {
  const qType = data.questionType || 'single';
  return (
    <div className="glass-panel-glow question-node">
      <Handle type="target" position={Position.Left} className="handle--muted" />
      <div className="node-header">
        <div className="node-icon-badge node-icon-badge--primary">
          <QuestionIcon size={16} />
        </div>
        <span className="node-type-label">
          Question Node ({qType})
        </span>
      </div>
      <div className="node-title">
        {data.label || 'Enter question...'}
      </div>
      {data.options && Array.isArray(data.options) && data.options.length > 0 && (
        <div className="node-options-list">
          {data.options.map((opt: string, i: number) => (
            <div key={i} className="node-option-chip">
              {opt}
            </div>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="handle--primary" />
    </div>
  );
};

const DelayNode: React.FC<NodeProps<CustomNode>> = ({ data }) => {
  return (
    <div className="glass-panel delay-node">
      <Handle type="target" position={Position.Left} className="handle--muted" />
      <div className="node-header">
        <div className="node-icon-badge node-icon-badge--warning">
          <Clock size={16} />
        </div>
        <span className="node-type-label">
          Delay / Follow-up
        </span>
      </div>
      <div className="node-title">
        Wait: {data.delayDuration || '24 hours'}
      </div>
      <div className="node-subtitle">
        Target Q: {data.targetQuestionnaireName || 'Follow-up survey'}
      </div>
      <Handle type="source" position={Position.Right} className="handle--warning" />
    </div>
  );
};

const TerminalNode: React.FC<NodeProps<CustomNode>> = ({ data }) => {
  const isDisqualify = data.isDisqualification === true;
  return (
    <div className="glass-panel terminal-node" style={{
      borderLeft: `4px solid ${isDisqualify ? 'var(--color-danger)' : 'var(--color-success)'}`
    }}>
      <Handle type="target" position={Position.Left} className="handle--muted" />
      <div className="node-type-header">
        <span className="terminal-dot" style={{
          backgroundColor: isDisqualify ? 'var(--color-danger)' : 'var(--color-success)'
        }} />
        <span className="node-type-label">
          {isDisqualify ? 'Disqualification Terminus' : 'Completion Terminus'}
        </span>
      </div>
      <div className="node-subtitle">
        {data.terminalMessage || 'Flow Ends Here.'}
      </div>
    </div>
  );
};

// Initial state mock-up
const initialNodes: CustomNode[] = [
  {
    id: '1',
    type: 'question',
    position: { x: 50, y: 150 },
    data: { label: 'How old are you?', questionType: 'input', options: [] }
  },
  {
    id: '2',
    type: 'question',
    position: { x: 340, y: 50 },
    data: { label: 'Which framework do you prefer?', questionType: 'single', options: ['React', 'Vue', 'Svelte'] }
  },
  {
    id: '3',
    type: 'delay',
    position: { x: 340, y: 250 },
    data: { delayDuration: '2 days', targetQuestionnaireId: 'q_depth_2', targetQuestionnaireName: 'Deep React Survey' }
  },
  {
    id: '4',
    type: 'terminal',
    position: { x: 620, y: 50 },
    data: { isDisqualification: false, terminalMessage: 'Thank you for completes!' }
  },
  {
    id: '5',
    type: 'terminal',
    position: { x: 620, y: 250 },
    data: { isDisqualification: true, terminalMessage: 'Survey ended. Age qualification mismatch.' }
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
];

// ---------------------------------------------------------
// Sidebar Palette Component (Draggable Nodes)
// ---------------------------------------------------------
const SidebarPalette: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    console.log('Drag Start:', nodeType);
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="glass-panel node-palette">
      <h3 className="node-palette-title">Node Palette</h3>
      <p className="node-palette-sub">Drag and drop nodes onto the canvas.</p>

      <div className="node-palette-list">
        <div
          onDragStart={(event) => onDragStart(event, 'question')}
          draggable
          className="palette-item"
        >
          <div className="palette-item-icon palette-item-icon--primary">
            <QuestionIcon size={16} />
          </div>
          <span className="palette-item-label">Question Node</span>
        </div>

        <div
          onDragStart={(event) => onDragStart(event, 'delay')}
          draggable
          className="palette-item"
        >
          <div className="palette-item-icon palette-item-icon--warning">
            <Clock size={16} />
          </div>
          <span className="palette-item-label">Delay / Follow-up</span>
        </div>

        <div
          onDragStart={(event) => onDragStart(event, 'terminal')}
          draggable
          className="palette-item"
        >
          <div className="terminal-palette-dot">
            <div className="terminal-palette-dot-inner" />
          </div>
          <span className="palette-item-label">Terminal Node</span>
        </div>
      </div>
    </div>
  );
};

interface CustomEdgeProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  style?: React.CSSProperties;
  markerEnd?: string;
  selected?: boolean;
  data?: {
    rules?: EdgeRule[];
    onSelect?: () => void;
  };
}

// ---------------------------------------------------------
// Custom Edge Component with Visual Logic Labels
// ---------------------------------------------------------
const CustomEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data
}: CustomEdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const rules = data?.rules || [];
  
  // Format a friendly representation of the rules for the edge badge
  let label = '';
  if (rules.length > 0) {
    label = rules.map((r: EdgeRule, idx: number) => {
      const prefix = idx > 0 ? ` ${r.combinator || 'AND'} ` : '';
      return `${prefix}Q${r.field} ${r.operator} "${r.value}"`;
    }).join('');
  }

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          stroke: selected ? 'var(--primary-color)' : (rules.length > 0 ? 'var(--color-accent-orange)' : 'var(--text-muted)'),
          strokeWidth: selected ? 3 : 2,
          opacity: selected ? 1 : (rules.length > 0 ? 0.95 : 0.4),
          transition: 'stroke 0.2s, stroke-width 0.2s, opacity 0.2s',
        }} 
      />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className="nodrag nopan edge-label-wrapper"
          onClick={(e) => {
            e.stopPropagation();
            if (data?.onSelect) {
              data.onSelect();
            }
          }}
        >
          <div
            className={`edge-label-badge ${
              selected 
                ? 'edge-label-badge--selected' 
                : (rules.length > 0 ? 'edge-label-badge--rules' : '')
            }`}
          >
            {rules.length > 0 ? (
              <span>
                ⚡️ {label}
              </span>
            ) : (
              <span>⚙️ Default Flow</span>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

interface ExtendedEdge extends Edge {
  rules?: EdgeRule[];
}

// ---------------------------------------------------------
// Builder Canvas Inner Component
// ---------------------------------------------------------
const BuilderCanvas: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [surveyTitle, setSurveyTitle] = useState('Untitled Questionnaire');
  const [surveyStatus, setSurveyStatus] = useState('draft');
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<ExtendedEdge | null>(null);
  const [validationResult, setValidationResult] = useState<{ status: 'idle' | 'success' | 'warning' | 'error'; message: string; warnings?: string[] }>({
    status: 'idle',
    message: '',
    warnings: []
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load survey data from localStorage
  useEffect(() => {
    if (!id) return;
    
    // Read survey metadata
    const savedSurveys = localStorage.getItem('resonator_surveys');
    if (savedSurveys) {
      try {
        const list = JSON.parse(savedSurveys) as SurveyItem[];
        const found = list.find((s) => s.id === id);
        if (found) {
          setSurveyTitle(found.title);
          setSurveyStatus(found.status);
        }
      } catch (e) {}
    }
    
    const handleSelectEdgeById = (edgeId: string) => {
      setEdges((eds) => {
        const found = eds.find((e) => e.id === edgeId);
        if (found) {
          setSelectedEdge(found);
          setSelectedNode(null);
        }
        return eds;
      });
    };

    // Read survey graph structure
    const savedGraph = localStorage.getItem(`resonator_graph_${id}`);
    if (savedGraph) {
      try {
        const data = JSON.parse(savedGraph);
        if (data.nodes) setNodes(data.nodes);
        if (data.edges) {
          const loadedEdges = data.edges.map((e: ExtendedEdge) => ({
            ...e,
            type: 'custom',
            rules: e.rules || e.data?.rules || [],
            data: {
              ...e.data,
              rules: e.rules || e.data?.rules || [],
              onSelect: () => handleSelectEdgeById(e.id)
            }
          }));
          setEdges(loadedEdges);
        }
      } catch (e) {}
    } else {
      // Default fallback template
      setNodes(initialNodes);
      const loadedEdges = initialEdges.map((e: ExtendedEdge) => ({
        ...e,
        type: 'custom',
        rules: e.rules || e.data?.rules || [],
        data: {
          ...e.data,
          rules: e.rules || e.data?.rules || [],
          onSelect: () => handleSelectEdgeById(e.id)
        }
      }));
      setEdges(loadedEdges);
    }
    setIsLoaded(true);
  }, [id, setNodes, setEdges]);

  // Auto-save graph to localStorage on changes
  useEffect(() => {
    if (!isLoaded || !id) return;
    
    const graphData = { nodes, edges };
    localStorage.setItem(`resonator_graph_${id}`, JSON.stringify(graphData));
    
    // Update metadata list lastModified
    const savedSurveys = localStorage.getItem('resonator_surveys');
    if (savedSurveys) {
      try {
        const surveysList = JSON.parse(savedSurveys) as SurveyItem[];
        const updatedList = surveysList.map((s: SurveyItem) => {
          if (s.id === id) {
            return {
              ...s,
              title: surveyTitle,
              lastModified: 'Just now'
            };
          }
          return s;
        });
        localStorage.setItem('resonator_surveys', JSON.stringify(updatedList));
      } catch (e) {}
    }
  }, [nodes, edges, surveyTitle, id, isLoaded]);

  const nodeTypes = useMemo(() => ({
    question: QuestionNode,
    delay: DelayNode,
    terminal: TerminalNode
  }), []);

  const edgeTypes = useMemo(() => ({
    custom: CustomEdge
  }), []);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdgeId = 'edge_' + Date.now();
      const newEdge: Edge = {
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
                setSelectedEdge(found);
                setSelectedNode(null);
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

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node as CustomNode);
    setSelectedEdge(null);
  };

  const onEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge as ExtendedEdge);
    setSelectedNode(null);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  // ---- Native DOM drag-and-drop via ref ----
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  useEffect(() => {
    const wrapper = reactFlowWrapper.current;
    if (!wrapper) return;

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const type = event.dataTransfer?.getData('text/plain');
      if (!type || !['question', 'delay', 'terminal'].includes(type)) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const id = `node_${Date.now()}`;
      
      let data = {};
      if (type === 'question') {
        data = { label: 'New Question', questionType: 'single', options: ['Option A', 'Option B'] };
      } else if (type === 'delay') {
        data = { delayDuration: '24 hours', targetQuestionnaireName: 'Follow-up questionnaire' };
      } else if (type === 'terminal') {
        data = { isDisqualification: false, terminalMessage: 'Flow Ends Here.' };
      }

      const newNode: CustomNode = { id, type, position, data };
      setNodes((nds) => nds.concat(newNode));
    };

    wrapper.addEventListener('dragover', handleDragOver);
    wrapper.addEventListener('drop', handleDrop);

    return () => {
      wrapper.removeEventListener('dragover', handleDragOver);
      wrapper.removeEventListener('drop', handleDrop);
    };
  }, [screenToFlowPosition, setNodes]);

  // Handle Graph Validation (Cycle detection + Follow-up Depth limit)
  const validateGraph = () => {
    // Cycle check
    const hasCycle = detectCycle(nodes, edges);
    if (hasCycle) {
      setValidationResult({
        status: 'error',
        message: 'Graph contains infinite routing loops (cycles detected). Cannot publish.'
      });
      return false;
    }

    // Follow-up depth check (max 3)
    const depthVal = validateFollowUpDepth(nodes, edges);
    if (!depthVal.valid) {
      setValidationResult({
        status: 'error',
        message: `Maximum follow-up chain depth exceeded. Limit: 3 levels (Found: ${depthVal.depth}).`
      });
      return false;
    }

    // Warnings check (Does not block publish)
    const warningList: string[] = [];
    const questionNodes = nodes.filter(n => n.type === 'question');
    const allEdges = edges as ExtendedEdge[];

    questionNodes.forEach(node => {
      const outgoing = allEdges.filter(e => e.source === node.id);
      if (outgoing.length > 0) {
        const conditionalEdges = outgoing.filter(e => e.rules && e.rules.length > 0);
        const defaultEdges = outgoing.filter(e => !e.rules || e.rules.length === 0);

        // A. Fallback Warning
        if (conditionalEdges.length > 0 && defaultEdges.length === 0) {
          warningList.push(`Question "Q${node.id}: ${node.data?.label || 'Untitled'}" has conditional paths but no fallback flow. If a respondent's answer matches none of the rules, the survey will end abruptly.`);
        }

        // B. Duplicate Option Warning
        const optionUsage: Record<string, string[]> = {}; // optionValue -> list of edgeIds
        conditionalEdges.forEach(edge => {
          const rules = edge.rules || [];
          rules.forEach((rule: EdgeRule) => {
            if (rule.operator === '==') {
              const key = `${rule.field}_${rule.value.toLowerCase().trim()}`;
              if (!optionUsage[key]) {
                optionUsage[key] = [];
              }
              optionUsage[key].push(edge.id);
            }
          });
        });

        Object.entries(optionUsage).forEach(([key, edgeIds]) => {
          if (edgeIds.length > 1) {
            const [, val] = key.split('_');
            warningList.push(`Question "Q${node.id}: ${node.data?.label || 'Untitled'}" has duplicate equals rules for value "${val}" on multiple paths. The router will default to the first matching connection.`);
          }
        });
      }
    });

    if (warningList.length > 0) {
      setValidationResult({
        status: 'warning',
        message: `Validation passed with ${warningList.length} warning(s). Review recommendations below:`,
        warnings: warningList
      });
      return true; // Warnings do not block publish
    }

    setValidationResult({
      status: 'success',
      message: `Graph validation passed! Cycle check complete, Follow-up depth: ${depthVal.depth}/3.`
    });
    return true;
  };

  // Handle Save (Draft or Publish)
  const handleSave = (publish: boolean = false) => {
    if (!id) return;
    const isValid = validateGraph();
    if (!isValid && publish) {
      return;
    }
    
    const newStatus = publish ? 'published' : 'draft';
    setSurveyStatus(newStatus);
    
    // Save graph representation
    const graphData = { nodes, edges };
    localStorage.setItem(`resonator_graph_${id}`, JSON.stringify(graphData));
    
    // Save metadata
    const savedSurveys = localStorage.getItem('resonator_surveys');
    let surveysList: SurveyItem[] = [];
    if (savedSurveys) {
      try {
        surveysList = JSON.parse(savedSurveys) as SurveyItem[];
      } catch (e) {}
    }
    
    let exists = false;
    const updatedList = surveysList.map((s: SurveyItem) => {
      if (s.id === id) {
        exists = true;
        return {
          ...s,
          title: surveyTitle,
          status: newStatus,
          lastModified: 'Just now'
        };
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
    
    setValidationResult({
      status: 'success',
      message: publish 
        ? 'Flow published successfully! Survey links are active.'
        : 'Draft saved successfully.'
    });
  };

  // Node settings update helper
  const updateSelectedNodeData = (updates: Partial<CustomNode['data']>) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          const updatedNode = {
            ...n,
            data: { ...n.data, ...updates }
          };
          setSelectedNode(updatedNode); // Update local reference
          return updatedNode;
        }
        return n;
      })
    );
  };

  // Edge settings rule helper
  const updateSelectedEdgeRules = (ruleUpdates: EdgeRule[]) => {
    if (!selectedEdge) return;
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === selectedEdge.id) {
          const updatedEdge = {
            ...e,
            rules: ruleUpdates,
            data: {
              ...e.data,
              rules: ruleUpdates
            }
          };
          setSelectedEdge(updatedEdge);
          return updatedEdge;
        }
        return e;
      })
    );
  };

  return (
    <div className="builder-layout">
      {/* Top Header Bar */}
      <div className="builder-toolbar">
        <div className="builder-toolbar-left">
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary builder-toolbar-btn flex-align-center"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          
          <div className="builder-header-title-wrapper">
            <input 
              value={surveyTitle}
              onChange={(e) => setSurveyTitle(e.target.value)}
              className="builder-title-input"
              placeholder="Questionnaire Title"
            />
            <span 
              className="builder-status-label"
              style={{
                color: surveyStatus === 'published' ? 'var(--color-success)' : 'var(--color-accent-amber)',
                backgroundColor: surveyStatus === 'published' ? 'var(--color-success-bg)' : 'var(--color-accent-amber-bg)',
                borderColor: surveyStatus === 'published' ? 'var(--color-success)' : 'var(--color-accent-amber)'
              }}
            >
              ● {surveyStatus === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
        
        <div className="builder-toolbar-right">
          <button 
            onClick={() => handleSave(false)} 
            className="btn btn-secondary builder-toolbar-btn"
          >
            Save Draft
          </button>
          <button 
            onClick={() => handleSave(true)} 
            className="btn btn-primary builder-toolbar-btn flex-align-center"
          >
            <Save size={14} /> Publish Flow
          </button>
        </div>
      </div>

      {/* Main Builder Work Area */}
      <div className="builder-work-area">
        {/* Sidebar Palette */}
        <SidebarPalette />

        {/* Visual Canvas Block */}
        <div 
          ref={reactFlowWrapper}
          className="dotted-canvas"
        >
          <ReactFlow
            className="builder-flow-canvas"
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          >
            <Controls />
            <MiniMap />

            <Panel position="top-right" className="builder-panel-actions">
              <button onClick={validateGraph} className="btn btn-secondary builder-panel-btn flex-align-center">
                <Sliders size={14} /> Run Validation
              </button>
              <button onClick={() => handleSave(true)} className="btn btn-primary builder-panel-btn flex-align-center">
                <Save size={14} /> Save & Publish
              </button>
            </Panel>
          </ReactFlow>

        {/* Validation result popup indicator */}
        <AnimatePresence>
          {validationResult.status !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="validation-banner-wrapper"
            >
              <div 
                className="glass-panel validation-banner" 
                style={{
                  backgroundColor: validationResult.status === 'success' ? 'var(--color-success-bg)' : (validationResult.status === 'warning' ? 'var(--color-warning-bg)' : 'var(--color-danger-bg)'),
                  borderColor: validationResult.status === 'success' ? 'var(--color-success)' : (validationResult.status === 'warning' ? 'var(--color-warning)' : 'var(--color-danger)')
                }}
              >
                {validationResult.status === 'success' && (
                  <CheckCircle2 size={20} color="var(--color-success)" className="validation-icon" />
                )}
                {validationResult.status === 'warning' && (
                  <AlertTriangle size={20} color="var(--color-warning)" className="validation-icon" />
                )}
                {validationResult.status === 'error' && (
                  <AlertTriangle size={20} color="var(--color-danger)" className="validation-icon" />
                )}
                <div className="validation-body">
                  <div className="validation-title">
                    {validationResult.status === 'success' ? 'Validation Passed' : (validationResult.status === 'warning' ? 'Validation Warnings' : 'Validation Failed')}
                  </div>
                  <div className="validation-message">
                    {validationResult.message}
                  </div>
                  {validationResult.status === 'warning' && validationResult.warnings && validationResult.warnings.length > 0 && (
                    <ul className="validation-warnings-list">
                      {validationResult.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  onClick={() => setValidationResult({ status: 'idle', message: '' })}
                  className="validation-close-btn"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide sheet settings Panel */}
      <AnimatePresence>
        {(selectedNode || selectedEdge) && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="glass-panel builder-sidebar"
          >
            {/* Header info */}
            <div className="sidebar-header">
              <h3 className="sidebar-title">
                {selectedNode ? 'Node Settings' : 'Branch Settings'}
              </h3>
              <button
                onClick={onPaneClick}
                className="sidebar-close-btn"
              >
                ✕
              </button>
            </div>

            {/* Dynamic Node Options form */}
            {selectedNode && (
              <div className="sidebar-content">
                <div className="sidebar-subtitle">
                  NODE ID: {selectedNode.id}
                </div>

                {selectedNode.type === 'question' && (
                  <>
                    <div className="form-group">
                      <label className="form-label" htmlFor="node-label">Question Text</label>
                      <input
                        id="node-label"
                        className="form-input"
                        value={selectedNode.data.label || ''}
                        onChange={(e) => updateSelectedNodeData({ label: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="question-type-select">Response Input Type</label>
                      <select
                        id="question-type-select"
                        className="form-input"
                        value={selectedNode.data.questionType || 'single'}
                        onChange={(e) => {
                          const newType = e.target.value as 'single' | 'multi' | 'input';
                          const updates: Partial<CustomNode['data']> = { questionType: newType };
                          if (newType === 'input') {
                            updates.options = [];
                          }
                          updateSelectedNodeData(updates);
                        }}
                      >
                        <option value="single">Single Choice (Radio)</option>
                        <option value="multi">Multiple Choice (Checkbox)</option>
                        <option value="input">Text / Number Input</option>
                      </select>
                    </div>

                    {/* Options list for choices */}
                    {(selectedNode.data.questionType === 'single' || selectedNode.data.questionType === 'multi') && (
                      <div className="form-group">
                        <label className="form-label">Multiple-Choice Options</label>
                        {selectedNode.data.options?.map((opt: string, i: number) => (
                          <div key={i} className="sidebar-option-row">
                            <input
                              className="form-input sidebar-form-input-sm"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...(selectedNode.data.options || [])];
                                newOpts[i] = e.target.value;
                                updateSelectedNodeData({ options: newOpts });
                              }}
                            />
                            <button
                              onClick={() => {
                                 const newOpts = (selectedNode.data.options || []).filter((_: string, idx: number) => idx !== i);
                                updateSelectedNodeData({ options: newOpts });
                              }}
                              className="btn btn-secondary sidebar-remove-option-btn"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                             const newOpts = [...(selectedNode.data.options || []), `Option ${(selectedNode.data.options || []).length + 1}`];
                            updateSelectedNodeData({ options: newOpts });
                          }}
                          className="btn btn-secondary sidebar-add-option-btn"
                        >
                          + Add Option
                        </button>
                      </div>
                    )}
                  </>
                )}

                {selectedNode.type === 'delay' && (
                  <>
                    <div className="form-group">
                      <label className="form-label" htmlFor="delay-duration-input">Delay Duration</label>
                      <input
                        id="delay-duration-input"
                        className="form-input"
                        value={selectedNode.data.delayDuration || ''}
                        onChange={(e) => updateSelectedNodeData({ delayDuration: e.target.value })}
                        placeholder="e.g. 24 hours, 3 days"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="target-q-input">Target Follow-Up Questionnaire</label>
                      <input
                        id="target-q-input"
                        className="form-input"
                        value={selectedNode.data.targetQuestionnaireName || ''}
                        onChange={(e) => updateSelectedNodeData({ targetQuestionnaireName: e.target.value })}
                        placeholder="Survey Title"
                      />
                    </div>
                  </>
                )}

                {selectedNode.type === 'terminal' && (
                  <>
                    <div className="form-group sidebar-flex-row">
                      <input
                        id="disqualify-checkbox"
                        type="checkbox"
                        checked={selectedNode.data.isDisqualification === true}
                        onChange={(e) => updateSelectedNodeData({ isDisqualification: e.target.checked })}
                      />
                      <label className="form-label margin-bottom-0" htmlFor="disqualify-checkbox">Is Disqualification Terminus</label>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="terminal-msg-input">Terminus Message</label>
                      <textarea
                        id="terminal-msg-input"
                        className="form-input"
                        value={selectedNode.data.terminalMessage || ''}
                        onChange={(e) => updateSelectedNodeData({ terminalMessage: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </>
                )}

                <button
                  onClick={() => {
                    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
                    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
                    setSelectedNode(null);
                  }}
                  className="btn btn-secondary sidebar-delete-btn"
                >
                  <Trash2 size={16} /> Delete Node
                </button>
              </div>
            )}

            {/* Dynamic Edge Branch Options / Condition Builder UI */}
            {selectedEdge && (
              <div className="sidebar-content">
                <div className="sidebar-subtitle">
                  EDGE: {selectedEdge.source} ➔ {selectedEdge.target}
                </div>

                <div className="sidebar-section-header">
                  <label className="form-label">Branching Conditions</label>
                  <p className="sidebar-section-desc">
                    Configure rules evaluating whether to direct respondents along this path.
                  </p>
                </div>

                {/* Condition Rule Builder Rows */}
                {selectedEdge.rules && selectedEdge.rules.length > 0 ? (
                  selectedEdge.rules.map((rule: EdgeRule, i: number) => (
                    <div key={i} className="glass-panel sidebar-rule-card">
                      {i > 0 && (
                        <div className="form-group margin-bottom-sm">
                          <label className="form-label" htmlFor={`combinator-select-${i}`}>Combinator</label>
                          <select
                            id={`combinator-select-${i}`}
                            className="form-input sidebar-combinator-select"
                            value={rule.combinator || 'AND'}
                            onChange={(e) => {
                              const newRules = [...(selectedEdge.rules || [])];
                              newRules[i] = { ...newRules[i], combinator: e.target.value as 'AND' | 'OR' };
                              updateSelectedEdgeRules(newRules);
                            }}
                          >
                            <option value="AND">AND</option>
                            <option value="OR">OR</option>
                          </select>
                        </div>
                      )}

                      {(() => {
                        const sourceNode = nodes.find(n => n.id === selectedEdge.source);
                        return (
                          <div className="form-group margin-bottom-xs">
                            <label className="form-label">Evaluate Question</label>
                            <div className="eval-question-display">
                              Q{selectedEdge.source}: {sourceNode?.data?.label || 'Untitled Question'}
                            </div>
                          </div>
                        );
                      })()}

                      <div className="form-group margin-bottom-xs">
                        <label className="form-label" htmlFor={`rule-operator-${i}`}>Operator</label>
                        <select
                          id={`rule-operator-${i}`}
                          className="form-input sidebar-form-input-sm"
                          value={rule.operator}
                          onChange={(e) => {
                            const newRules = [...(selectedEdge.rules || [])];
                            newRules[i] = { ...newRules[i], operator: e.target.value as EdgeRule['operator'] };
                            updateSelectedEdgeRules(newRules);
                          }}
                        >
                          <option value="==">Equals (==)</option>
                          <option value="!=">Not Equals (!=)</option>
                          <option value="<">Less Than (&lt;)</option>
                          <option value=">">Greater Than (&gt;)</option>
                          <option value="contains">Contains</option>
                        </select>
                      </div>

                      <div className="form-group margin-bottom-xs">
                        <label className="form-label" htmlFor={`rule-value-${i}`}>Match Value</label>
                        {(() => {
                          const targetNode = nodes.find(n => n.id === selectedEdge.source);
                          const isChoiceQuestion = targetNode?.data?.questionType === 'single' || targetNode?.data?.questionType === 'multi';
                          const options = targetNode?.data?.options || [];
                          
                          if (isChoiceQuestion && options.length > 0) {
                            return (
                              <select
                                id={`rule-value-${i}`}
                                className="form-input sidebar-form-input-sm"
                                value={rule.value}
                                onChange={(e) => {
                                  const newRules = [...(selectedEdge.rules || [])];
                                  newRules[i] = { ...newRules[i], value: e.target.value };
                                  updateSelectedEdgeRules(newRules);
                                }}
                              >
                                <option value="">-- Select Option --</option>
                                {options.map((opt: string) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            );
                          }
                          
                          return (
                            <input
                              id={`rule-value-${i}`}
                              className="form-input sidebar-form-input-sm"
                              value={rule.value}
                              onChange={(e) => {
                                const newRules = [...(selectedEdge.rules || [])];
                                newRules[i] = { ...newRules[i], value: e.target.value };
                                updateSelectedEdgeRules(newRules);
                              }}
                              placeholder="e.g. React"
                            />
                          );
                        })()}
                      </div>

                      {rule.operator && ['>', '<', '>=', '<='].includes(rule.operator) && (
                        <div className="exclusive-tip-box">
                          <span className="exclusive-tip-title">💡 Mutually Exclusive tip:</span>
                          <span>If you use <strong>{rule.operator}</strong>, ensure other outgoing paths from this question do not overlap. Consider adding an upper/lower bound rule (e.g. <code>AND &lt;= 50</code>) to this same path to keep flows separate.</span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          const newRules = (selectedEdge.rules || []).filter((_: EdgeRule, idx: number) => idx !== i);
                          updateSelectedEdgeRules(newRules);
                        }}
                        className="btn btn-secondary sidebar-remove-rule-btn"
                      >
                        Remove Rule
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="sidebar-no-rules">
                    No conditions. This branch evaluates to always true.
                  </div>
                )}

                <button
                  onClick={() => {
                    const newRules = [...(selectedEdge.rules || []), { field: selectedEdge.source, operator: '==', value: '', combinator: 'AND' } as EdgeRule];
                    updateSelectedEdgeRules(newRules);
                  }}
                  className="btn btn-secondary sidebar-add-option-btn"
                >
                  + Add Condition Rule
                </button>

                <button
                  onClick={() => {
                    setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
                    setSelectedEdge(null);
                  }}
                  className="btn btn-secondary sidebar-delete-btn"
                >
                  <Trash2 size={16} /> Delete Connection
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
};

// ---------------------------------------------------------
// Main Exported Builder Wrapper
// ---------------------------------------------------------
export const Builder: React.FC = () => {
  return (
    <ReactFlowProvider>
      <BuilderCanvas />
    </ReactFlowProvider>
  );
};
