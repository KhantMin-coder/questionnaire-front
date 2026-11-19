import React, { useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Panel,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './Builder.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Sliders, ArrowLeft } from 'lucide-react';

import type { CustomNode } from '../types/builder';

// Subcomponents
import { QuestionNode } from './builder/QuestionNode';
import { DelayNode } from './builder/DelayNode';
import { TerminalNode } from './builder/TerminalNode';
import { CustomEdge } from './builder/CustomEdge';
import { SidebarPalette } from './builder/SidebarPalette';
import { SidebarSettings } from './builder/SidebarSettings';

// Custom Hook
import { useBuilderState } from './builder/useBuilderState';

const BuilderCanvas: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const {
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
  } = useBuilderState(id);
  const { screenToFlowPosition } = useReactFlow();

  const nodeTypes = useMemo(() => ({
    question: QuestionNode,
    delay: DelayNode,
    terminal: TerminalNode
  }), []);

  const edgeTypes = useMemo(() => ({
    custom: CustomEdge
  }), []);

  // HTML5 Drag and drop helpers
  const onDragOver = (event: React.DragEvent): void => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event: React.DragEvent): void => {
    event.preventDefault();
    const type = event.dataTransfer.getData('text/plain');
    if (!type || !reactFlowWrapper.current) return;

    const flowPosition = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    const position = {
      x: flowPosition.x - 100,
      y: flowPosition.y - 40,
    };

    const newNodeId = `q_${Date.now()}`;
    const newNode: CustomNode = {
      id: newNodeId,
      type,
      position,
      data: {
        label: type === 'delay' ? 'Wait 24 hours' : (type === 'terminal' ? 'Thank you for your response!' : 'Untitled Question'),
        helperText: '',
        questionType: type === 'question' ? 'single' : undefined,
        inputType: type === 'question' ? 'text' : undefined,
        options: type === 'question' ? ['Option 1', 'Option 2'] : undefined,
        delayDuration: type === 'delay' ? '24 hours' : undefined,
        targetQuestionnaireName: type === 'delay' ? 'Follow-up survey' : undefined,
        isDisqualification: false,
        terminalMessage: type === 'terminal' ? 'Thank you for your response!' : undefined,
        warnings: [],
        onFocusWarning: () => focusNode(newNodeId)
      }
    };

    setNodes((nds) => nds.concat(newNode));
  };

  if (!isLoaded) {
    return (
      <div className="builder-loading">
        <div className="spinner" />
        <p>Loading Survey Flow Studio...</p>
      </div>
    );
  }

  return (
    <div className="builder-layout">
      {/* Toast Notification popup */}
      <AnimatePresence>
        {toast && (
          <div className="toast-notification-container">
            <motion.div
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              transition={{ duration: 0.2 }}
              className={`toast-notification toast-notification--${toast.type}`}
            >
              {toast.message}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              type="text"
              className="builder-title-input"
              value={surveyTitle}
              onChange={(e) => setSurveyTitle(e.target.value)}
              placeholder="Enter survey title..."
            />
            <span className="builder-status-label">
              {surveyStatus.toUpperCase()}
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
          onDragOver={onDragOver}
          onDrop={onDrop}
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
              <button onClick={() => validateGraph(false)} className="btn btn-secondary builder-panel-btn flex-align-center">
                <Sliders size={14} /> Run Validation
              </button>
            </Panel>
          </ReactFlow>

        </div>

        {/* Slide sheet settings Panel */}
        <SidebarSettings
          currentSurveyId={id}
          isSidebarOpen={isSidebarOpen}
          activeSidebarTab={activeSidebarTab}
          setActiveSidebarTab={setActiveSidebarTab}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          selectedEdge={selectedEdge}
          setSelectedEdge={setSelectedEdge}
          setIsSidebarOpen={setIsSidebarOpen}
          updateSelectedNodeData={updateSelectedNodeData}
          duplicateSelectedNode={duplicateSelectedNode}
          propagateOptionRename={propagateOptionRename}
          updateSelectedEdgeRules={updateSelectedEdgeRules}
          nodes={nodes}
          setNodes={setNodes}
          setEdges={setEdges}
          validationResult={validationResult}
          focusNode={focusNode}
        />
      </div>
    </div>
  );
};

export const Builder: React.FC = () => {
  return (
    <ReactFlowProvider>
      <BuilderCanvas />
    </ReactFlowProvider>
  );
};
