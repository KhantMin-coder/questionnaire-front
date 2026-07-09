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
  style?: React.CSSProperties;
  markerEnd?: string;
  selected?: boolean;
  data?: {
    rules?: EdgeRule[];
    onSelect?: () => void;
  };
}

export const CustomEdge = ({
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
