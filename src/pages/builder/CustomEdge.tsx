import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import type { Position } from '@xyflow/react';
import type { EdgeRule } from '../../utils/graphLogic';

interface CustomEdgeProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  markerEnd?: string;
  selected?: boolean;
  data?: {
    rules?: EdgeRule[];
    onSelect?: () => void;
  };
}

export const CustomEdge: React.FC<CustomEdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  selected,
  data
}) => {
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

  const edgeStateClass = selected
    ? 'custom-edge-path--selected'
    : rules.length > 0
      ? 'custom-edge-path--rules'
      : 'custom-edge-path--default';

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        className={`custom-edge-path ${edgeStateClass}`}
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
            className={`edge-label-badge ${selected
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
