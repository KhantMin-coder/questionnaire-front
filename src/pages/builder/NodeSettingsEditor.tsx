import React, { useMemo } from 'react';
import { Trash2, Copy } from 'lucide-react';
import type { CustomNode, SurveyItem } from '../../types/builder';
import type { Edge } from '@xyflow/react';

interface NodeSettingsEditorProps {
  currentSurveyId?: string;
  selectedNode: CustomNode;
  updateSelectedNodeData: (updates: Partial<CustomNode['data']>) => void;
  duplicateSelectedNode: () => void;
  propagateOptionRename: (nodeId: string, oldVal: string, newVal: string) => void;
  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setSelectedNode: (node: CustomNode | null) => void;
  setIsSidebarOpen: (open: boolean) => void;
}

export const NodeSettingsEditor: React.FC<NodeSettingsEditorProps> = ({
  currentSurveyId,
  selectedNode,
  updateSelectedNodeData,
  duplicateSelectedNode,
  propagateOptionRename,
  setNodes,
  setEdges,
  setSelectedNode,
  setIsSidebarOpen
}) => {
  const availableSurveys = useMemo<SurveyItem[]>(() => {
    try {
      const saved = localStorage.getItem('resonator_surveys');
      if (!saved) return [];
      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return (parsed as SurveyItem[]).filter((s) => s.id !== currentSurveyId);
    } catch {
      return [];
    }
  }, [currentSurveyId]);

  return (
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
            <label className="form-label" htmlFor="node-helper-text">Helper Text (Optional)</label>
            <input
              id="node-helper-text"
              className="form-input"
              placeholder="e.g. Select the option that best applies"
              value={selectedNode.data.helperText || ''}
              onChange={(e) => updateSelectedNodeData({ helperText: e.target.value })}
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
                  updates.inputType = selectedNode.data.inputType || 'text';
                } else if (!selectedNode.data.options || selectedNode.data.options.length === 0) {
                  updates.options = ['Option 1', 'Option 2'];
                }
                updateSelectedNodeData(updates);
              }}
            >
              <option value="single">Single Choice (Radio)</option>
              <option value="multi">Multiple Choice (Checkbox)</option>
              <option value="input">Input Element (Text / Number / Date / Textarea)</option>
            </select>
          </div>

          {selectedNode.data.questionType === 'input' && (
            <div className="form-group">
              <label className="form-label" htmlFor="input-subtype-select">Input Element Subtype</label>
              <select
                id="input-subtype-select"
                className="form-input"
                value={selectedNode.data.inputType || 'text'}
                onChange={(e) => {
                  const newSubtype = e.target.value as 'text' | 'number' | 'date' | 'textarea';
                  updateSelectedNodeData({ inputType: newSubtype });
                }}
              >
                <option value="text">Text (Single Line)</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="textarea">Textarea (Multi-line)</option>
              </select>
            </div>
          )}

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
                      const oldVal = newOpts[i];
                      const newVal = e.target.value;
                      newOpts[i] = newVal;
                      updateSelectedNodeData({ options: newOpts });
                      propagateOptionRename(selectedNode.id, oldVal, newVal);
                    }}
                  />
                  <button
                    onClick={() => {
                      const newOpts = (selectedNode.data.options || []).filter((_: string, idx: number) => idx !== i);
                      updateSelectedNodeData({ options: newOpts });
                    }}
                    className="btn btn-secondary sidebar-remove-option-btn"
                    aria-label={`Remove option ${i + 1}`}
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

              <div className="sidebar-allow-other-wrapper">
                <input
                  id="allow-other-checkbox"
                  type="checkbox"
                  checked={selectedNode.data.allowOther === true}
                  onChange={(e) => updateSelectedNodeData({ allowOther: e.target.checked })}
                />
                <label className="form-label margin-bottom-0" htmlFor="allow-other-checkbox">
                  Allow "Other" (Open Text)
                </label>
              </div>
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
              placeholder="e.g. 2 hours, 3 days"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="target-q-select">Target Follow-Up Questionnaire</label>
            <select
              id="target-q-select"
              className="form-input"
              value={selectedNode.data.targetQuestionnaireId || selectedNode.data.targetQuestionnaireName || ''}
              onChange={(e) => {
                const selectedVal = e.target.value;
                const matched = availableSurveys.find((s) => s.id === selectedVal);
                if (matched) {
                  updateSelectedNodeData({
                    targetQuestionnaireId: matched.id,
                    targetQuestionnaireName: matched.title
                  });
                } else {
                  updateSelectedNodeData({
                    targetQuestionnaireId: selectedVal,
                    targetQuestionnaireName: selectedVal || 'Follow-up survey'
                  });
                }
              }}
            >
              <option value="">-- Select Target Questionnaire --</option>
              {availableSurveys.map((survey) => (
                <option key={survey.id} value={survey.id}>
                  {survey.title}
                </option>
              ))}
              <option value="Deep React cohort">Deep React cohort</option>
              <option value="Vue Scheduler survey">Vue Scheduler survey</option>
              <option value="Svelte cohort Q">Svelte cohort Q</option>
            </select>
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
        onClick={duplicateSelectedNode}
        className="btn btn-secondary sidebar-duplicate-btn"
      >
        <Copy size={16} /> Duplicate Node
      </button>

      <button
        onClick={() => {
          setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
          setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
          setSelectedNode(null);
          setIsSidebarOpen(false);
        }}
        className="btn btn-secondary sidebar-delete-btn"
      >
        <Trash2 size={16} /> Delete Node
      </button>
    </div>
  );
};
