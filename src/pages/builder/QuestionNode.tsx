import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { HelpCircle as QuestionIcon } from 'lucide-react';
import type { CustomNode } from '../../types/builder';

export const QuestionNode: React.FC<NodeProps<CustomNode>> = ({ data }) => {
  const qType = data.questionType || 'single';
  const typeDisplay = qType === 'input' && data.inputType ? `input: ${data.inputType}` : qType;
  return (
    <div className="glass-panel-glow question-node">
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
        <div className="node-icon-badge node-icon-badge--primary">
          <QuestionIcon size={16} />
        </div>
        <span className="node-type-label">
          Question Node ({typeDisplay})
        </span>
      </div>
      <div className="node-title">
        {data.label || 'Enter question...'}
      </div>
      {data.helperText && (
        <div className="node-subtitle">
          {data.helperText}
        </div>
      )}
      {((data.options && Array.isArray(data.options) && data.options.length > 0) || data.allowOther) && (
        <div className="node-options-list">
          {data.options?.map((opt: string, i: number) => (
            <div key={i} className="node-option-chip">
              {opt}
            </div>
          ))}
          {data.allowOther && (
            <div className="node-option-chip node-option-chip--other">
              Other (Open text)
            </div>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="handle--primary" />
    </div>
  );
};
