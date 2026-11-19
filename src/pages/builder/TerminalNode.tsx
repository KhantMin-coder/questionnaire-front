import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { CustomNode } from '../../types/builder';

export const TerminalNode: React.FC<NodeProps<CustomNode>> = ({ data }) => {
  const isDisqualify = data.isDisqualification === true;
  return (
    <div className={`glass-panel terminal-node ${isDisqualify ? 'terminal-node--disqualify' : 'terminal-node--complete'}`}>
      {data.warnings && data.warnings.length > 0 && (
        <div 
          className="node-warning-badge" 
          title={data.warnings.join('\n')}
          onClick={(e) => {
            e.stopPropagation();
            if (data.onFocusWarning) data.onFocusWarning();
          }}
        >
          ⚠️
        </div>
      )}
      <Handle type="target" position={Position.Left} className="handle--muted" />
      <div className="node-type-header">
        <span className={`terminal-dot ${isDisqualify ? 'terminal-dot--disqualify' : 'terminal-dot--complete'}`} />
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
