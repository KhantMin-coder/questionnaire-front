import React from 'react';
import { Trash2 } from 'lucide-react';
import type { ExtendedEdge, CustomNode } from '../../types/builder';
import type { EdgeRule } from '../../utils/graphLogic';
import type { Edge } from '@xyflow/react';

interface EdgeConditionEditorProps {
  selectedEdge: ExtendedEdge;
  updateSelectedEdgeRules: (rules: EdgeRule[]) => void;
  nodes: CustomNode[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setSelectedEdge: (edge: ExtendedEdge | null) => void;
  setIsSidebarOpen: (open: boolean) => void;
}

export const EdgeConditionEditor: React.FC<EdgeConditionEditorProps> = ({
  selectedEdge,
  updateSelectedEdgeRules,
  nodes,
  setEdges,
  setSelectedEdge,
  setIsSidebarOpen
}) => {
  const questionNodes = nodes.filter((n) => n.type === 'question');

  return (
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

            <div className="form-group margin-bottom-xs">
              <label className="form-label" htmlFor={`rule-field-${i}`}>Evaluate Question</label>
              <select
                id={`rule-field-${i}`}
                className="form-input sidebar-form-input-sm"
                value={rule.field || selectedEdge.source}
                onChange={(e) => {
                  const newRules = [...(selectedEdge.rules || [])];
                  newRules[i] = { ...newRules[i], field: e.target.value, value: '' };
                  updateSelectedEdgeRules(newRules);
                }}
              >
                {questionNodes.map((qNode) => (
                  <option key={qNode.id} value={qNode.id}>
                    Q{qNode.id}: {qNode.data?.label || 'Untitled Question'}
                  </option>
                ))}
              </select>
            </div>

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
                <option value="<=">Less Than or Equal (&le;)</option>
                <option value=">">Greater Than (&gt;)</option>
                <option value=">=">Greater Than or Equal (&ge;)</option>
                <option value="contains">Contains</option>
              </select>
            </div>

            <div className="form-group margin-bottom-xs">
              <label className="form-label" htmlFor={`rule-value-${i}`}>Match Value</label>
              {(() => {
                const targetNode = nodes.find(n => n.id === (rule.field || selectedEdge.source));
                const isChoiceQuestion = targetNode?.data?.questionType === 'single' || targetNode?.data?.questionType === 'multi';
                const options = targetNode?.data?.options || [];

                if (isChoiceQuestion && (options.length > 0 || targetNode?.data?.allowOther)) {
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
                      {targetNode?.data?.allowOther && (
                        <option value="Other">Other</option>
                      )}
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
          setIsSidebarOpen(false);
        }}
        className="btn btn-secondary sidebar-delete-btn"
      >
        <Trash2 size={16} /> Delete Connection
      </button>
    </div>
  );
};
