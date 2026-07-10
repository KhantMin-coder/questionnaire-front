import React from 'react';
import { ReactFlow, Background, Position, Handle } from '@xyflow/react';
import { HelpCircle, Clock, ShieldAlert, CheckCircle, Settings, Eye, GitFork } from 'lucide-react';
import { previewNodes, previewEdges } from './constants';
import '@xyflow/react/dist/style.css';
import '../Landing.css';

const PreviewQuestionNode: React.FC<{ data: { label: string } }> = ({ data }) => {
  return (
    <div className="glass-panel preview-node preview-node--question">
      <Handle type="target" position={Position.Left} className="handle--muted" />
      <div className="preview-node-header">
        <HelpCircle size={10} />
        <span>QUESTION</span>
      </div>
      <div className="preview-node-title">{data.label}</div>
      <Handle type="source" position={Position.Right} className="handle--primary" />
    </div>
  );
};

const PreviewDelayNode: React.FC<{ data: { label: string; delayDuration?: string } }> = ({ data }) => {
  return (
    <div className="glass-panel preview-node preview-node--delay">
      <Handle type="target" position={Position.Left} className="handle--muted" />
      <div className="preview-node-header">
        <Clock size={10} />
        <span>DELAY SCHEDULE</span>
      </div>
      <div className="preview-node-title">{data.label}</div>
      <div className="preview-node-delay-sub">Wait {data.delayDuration}</div>
      <Handle type="source" position={Position.Right} className="handle--primary" />
    </div>
  );
};

const PreviewTerminalNode: React.FC<{ data: { label: string; isDisqualification?: boolean } }> = ({ data }) => {
  const isDis = data.isDisqualification;
  return (
    <div className={`glass-panel preview-node ${isDis ? 'preview-node--terminal-danger' : 'preview-node--terminal-success'}`}>
      <Handle type="target" position={Position.Left} className="handle--muted" />
      <div className="preview-node-header">
        {isDis ? <ShieldAlert size={10} /> : <CheckCircle size={10} />}
        <span>{isDis ? 'DISQUALIFY' : 'COMPLETE'}</span>
      </div>
      <div className="preview-node-title">{data.label}</div>
    </div>
  );
};

const nodeTypes = {
  question: PreviewQuestionNode,
  delay: PreviewDelayNode,
  terminal: PreviewTerminalNode
};

export const LandingHeroFlow: React.FC = () => {
  return (
    <>
      {/* Mock Browser Header */}
      <div className="landing-flow-chrome">
        <div className="landing-flow-dots">
          <div className="landing-flow-dot landing-flow-dot--red" />
          <div className="landing-flow-dot landing-flow-dot--yellow" />
          <div className="landing-flow-dot landing-flow-dot--green" />
        </div>
        <div className="landing-flow-url">
          <Eye size={10} /> resonator.io/builder/demo-survey
        </div>
        <Settings size={14} />
      </div>

      <div className="landing-flow-wrapper">
        <ReactFlow
          nodes={previewNodes}
          edges={previewEdges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={true}
          nodesConnectable={false}
          zoomOnScroll={false}
          panOnScroll={true}
          preventScrolling={true}
        >
          <Background color="var(--text-muted)" gap={16} size={1} />
        </ReactFlow>

        {/* Interactive affordance label */}
        <div className="landing-flow-affordance">
          <GitFork size={10} /> Interactive preview (Try dragging cards)
        </div>
      </div>
    </>
  );
};
