import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';
import type { CustomNode } from '../../types/builder';

export const DelayNode: React.FC<NodeProps<CustomNode>> = ({ data }) => {
  return (
    <div className="glass-panel delay-node">
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
