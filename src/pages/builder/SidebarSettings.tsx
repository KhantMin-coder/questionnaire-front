import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import type { CustomNode, ExtendedEdge, ValidationWarning } from '../../types/builder';
import type { EdgeRule } from '../../utils/graphLogic';
import type { Edge } from '@xyflow/react';
import { NodeSettingsEditor } from './NodeSettingsEditor';
import { EdgeConditionEditor } from './EdgeConditionEditor';

interface SidebarSettingsProps {
  isSidebarOpen: boolean;
  activeSidebarTab: 'properties' | 'issues';
  setActiveSidebarTab: (tab: 'properties' | 'issues') => void;
  selectedNode: CustomNode | null;
  setSelectedNode: (node: CustomNode | null) => void;
  selectedEdge: ExtendedEdge | null;
  setSelectedEdge: (edge: ExtendedEdge | null) => void;
  setIsSidebarOpen: (open: boolean) => void;
  updateSelectedNodeData: (updates: Partial<CustomNode['data']>) => void;
  propagateOptionRename: (nodeId: string, oldVal: string, newVal: string) => void;
  updateSelectedEdgeRules: (rules: EdgeRule[]) => void;
  nodes: CustomNode[];
  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  validationResult: { status: string; message: string; warnings?: ValidationWarning[] };
  focusNode: (nodeId: string) => void;
}

export const SidebarSettings: React.FC<SidebarSettingsProps> = ({
  isSidebarOpen,
  activeSidebarTab,
  setActiveSidebarTab,
  selectedNode,
  setSelectedNode,
  selectedEdge,
  setSelectedEdge,
  setIsSidebarOpen,
  updateSelectedNodeData,
  propagateOptionRename,
  updateSelectedEdgeRules,
  nodes,
  setNodes,
  setEdges,
  validationResult,
  focusNode
}) => {
  return (
    <>
      {isSidebarOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="glass-panel builder-sidebar"
        >
          {/* Sidebar Tabs */}
          <div className="sidebar-tabs">
            <button
              className={`sidebar-tab-btn ${activeSidebarTab === 'properties' ? 'sidebar-tab-btn--active' : ''}`}
              onClick={() => setActiveSidebarTab('properties')}
              disabled={!selectedNode && !selectedEdge}
            >
              Editor
            </button>
            <button
              className={`sidebar-tab-btn ${activeSidebarTab === 'issues' ? 'sidebar-tab-btn--active' : ''}`}
              onClick={() => setActiveSidebarTab('issues')}
            >
              Issues ({validationResult.warnings?.length || 0})
            </button>
          </div>

          {/* Header info */}
          <div className="sidebar-header">
            <h3 className="sidebar-title">
              {activeSidebarTab === 'properties' ? (
                selectedNode ? 'Node Settings' : 'Branch Settings'
              ) : (
                'Validation Issues'
              )}
            </h3>
            <button
              onClick={() => {
                setIsSidebarOpen(false);
                setSelectedNode(null);
                setSelectedEdge(null);
              }}
              className="sidebar-close-btn"
            >
              ✕
            </button>
          </div>

          {/* Dynamic properties tab content */}
          {activeSidebarTab === 'properties' && (
            <>
              {selectedNode ? (
                <NodeSettingsEditor
                  selectedNode={selectedNode}
                  updateSelectedNodeData={updateSelectedNodeData}
                  propagateOptionRename={propagateOptionRename}
                  setNodes={setNodes}
                  setEdges={setEdges}
                  setSelectedNode={setSelectedNode}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              ) : selectedEdge ? (
                <EdgeConditionEditor
                  selectedEdge={selectedEdge}
                  updateSelectedEdgeRules={updateSelectedEdgeRules}
                  nodes={nodes}
                  setEdges={setEdges}
                  setSelectedEdge={setSelectedEdge}
                  setIsSidebarOpen={setIsSidebarOpen}
                />
              ) : (
                <div className="sidebar-content">
                  <p className="sidebar-section-desc">Select a question node or connection line to configure details.</p>
                </div>
              )}
            </>
          )}

          {/* Validation Issues tab content */}
          {activeSidebarTab === 'issues' && (
            <div className="sidebar-content">
              <div className="sidebar-section-header margin-bottom-0">
                <label className="form-label">Active Diagnostics</label>
                <p className="sidebar-section-desc">
                  Select any diagnostic issue below to locate it on the canvas:
                </p>
              </div>

              {validationResult.warnings && validationResult.warnings.length > 0 ? (
                <ul className="sidebar-issues-list">
                  {validationResult.warnings.map((w, idx) => (
                    <li 
                      key={idx} 
                      className={`sidebar-issue-card ${w.nodeId ? 'validation-warning-item--clickable' : ''}`}
                      onClick={() => w.nodeId && focusNode(w.nodeId)}
                    >
                      <div className="sidebar-issue-content">
                        <div className={`sidebar-issue-type ${w.isError ? 'sidebar-issue-type--error' : 'sidebar-issue-type--warning'}`}>
                          {w.isError ? '🛑 Error' : '⚠️ Warning'}
                        </div>
                        <div className="sidebar-issue-msg">
                          {w.message}
                        </div>
                      </div>
                      {w.nodeId && <span className="validation-warning-focus-badge">Focus</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="sidebar-issues-clean-card">
                  <CheckCircle2 size={32} className="sidebar-issues-clean-icon" />
                  <div className="sidebar-issues-clean-title">No Issues Found</div>
                  <p className="sidebar-issues-clean-desc">
                    Your questionnaire flow is clean, logical, and ready to publish.
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </>
  );
};
