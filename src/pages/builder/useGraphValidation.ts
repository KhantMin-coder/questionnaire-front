import { useCallback } from 'react';
import type { Edge } from '@xyflow/react';
import type { CustomNode, ExtendedEdge, ValidationWarning } from '../../types/builder';
import type { EdgeRule } from '../../utils/graphLogic';
import { detectCycle, validateFollowUpDepth } from '../../utils/graphLogic';

export const useGraphValidation = (
  nodes: CustomNode[],
  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>,
  edges: Edge[],
  focusNode: (nodeId: string) => void,
  setIsSidebarOpen: (open: boolean) => void,
  setActiveSidebarTab: (tab: 'properties' | 'issues') => void,
  setValidationResult: React.Dispatch<React.SetStateAction<{
    status: 'idle' | 'success' | 'warning' | 'error';
    message: string;
    warnings?: ValidationWarning[];
  }>>
) => {
  const validateGraph = useCallback((silent: boolean = false) => {
    const warningList: ValidationWarning[] = [];
    const allEdges = edges as ExtendedEdge[];

    const hasCycle = detectCycle(nodes, edges);
    if (hasCycle) {
      warningList.push({
        message: 'Graph contains infinite routing loops (cycles detected). Cannot publish.',
        isError: true
      });
    }

    const depthVal = validateFollowUpDepth(nodes, edges);
    if (!depthVal.valid) {
      warningList.push({
        message: `Maximum follow-up chain depth exceeded. Limit: 3 levels (Found: ${depthVal.depth}).`,
        isError: true
      });
    }

    const nonTerminalNodes = nodes.filter(n => n.type === 'question' || n.type === 'delay');
    nonTerminalNodes.forEach(node => {
      const outgoing = allEdges.filter(e => e.source === node.id);
      if (outgoing.length === 0) {
        const typeLabel = node.type === 'delay' ? 'Delay/Follow-up' : 'Question';
        warningList.push({
          message: `${typeLabel} "Q${node.id}: ${node.data?.label || 'Untitled'}" is a dead end. It has no outgoing connections and does not lead to a Completed or Terminate node.`,
          nodeId: node.id
        });
      }
    });

    const delayNodes = nodes.filter(n => n.type === 'delay');
    delayNodes.forEach(node => {
      const outgoing = allEdges.filter(e => e.source === node.id);
      if (outgoing.length > 1) {
        warningList.push({
          message: `Delay Node "Q${node.id}: ${node.data?.label || 'Untitled'}" has ${outgoing.length} outgoing paths. Delay nodes should only have a single outgoing path.`,
          nodeId: node.id
        });
      }
    });

    const questionNodes = nodes.filter(n => n.type === 'question');
    questionNodes.forEach(node => {
      const outgoing = allEdges.filter(e => e.source === node.id);
      if (outgoing.length > 0) {
        const conditionalEdges = outgoing.filter(e => e.rules && e.rules.length > 0);
        const defaultEdges = outgoing.filter(e => !e.rules || e.rules.length === 0);

        if (conditionalEdges.length > 0 && defaultEdges.length === 0) {
          warningList.push({
            message: `Question "Q${node.id}: ${node.data?.label || 'Untitled'}" has conditional paths but no fallback flow. If a respondent's answer matches none of the rules, the survey will end abruptly.`,
            nodeId: node.id
          });
        }

        if (defaultEdges.length > 1) {
          warningList.push({
            message: `Question "Q${node.id}: ${node.data?.label || 'Untitled'}" has ${defaultEdges.length} default (unconditional) paths. A question should have at most one default flow.`,
            nodeId: node.id
          });
        }

        const optionUsage: Record<string, string[]> = {};
        conditionalEdges.forEach(edge => {
          const rules = edge.rules || [];
          rules.forEach((rule: EdgeRule) => {
            if (rule.operator === '==') {
              const key = `${rule.field}_${rule.value.toLowerCase().trim()}`;
              if (!optionUsage[key]) optionUsage[key] = [];
              optionUsage[key].push(edge.id);
            }
          });
        });

        Object.entries(optionUsage).forEach(([key, edgeIds]) => {
          if (edgeIds.length > 1) {
            const [, val] = key.split('_');
            warningList.push({
              message: `Question "Q${node.id}: ${node.data?.label || 'Untitled'}" has duplicate equals rules for value "${val}" on multiple paths. The router will default to the first matching connection.`,
              nodeId: node.id
            });
          }
        });
      }
    });

    let hasChanged = false;
    const nextNodes = nodes.map((node) => {
      const nodeWarnings = warningList.filter((w) => w.nodeId === node.id).map((w) => w.message);
      const currentWarnings = node.data?.warnings || [];
      const isDifferent =
        nodeWarnings.length !== currentWarnings.length ||
        nodeWarnings.some((w, idx) => w !== currentWarnings[idx]);

      if (isDifferent) {
        hasChanged = true;
        return {
          ...node,
          data: {
            ...node.data,
            warnings: nodeWarnings,
            onFocusWarning: () => focusNode(node.id)
          }
        };
      }
      if (!node.data?.onFocusWarning) {
        return {
          ...node,
          data: {
            ...node.data,
            onFocusWarning: () => focusNode(node.id)
          }
        };
      }
      return node;
    });

    if (hasChanged) setNodes(nextNodes);

    const hasErrors = warningList.some(w => w.isError);
    if (!silent) {
      setIsSidebarOpen(true);
      setActiveSidebarTab('issues');
      if (hasErrors) {
        setValidationResult({
          status: 'error',
          message: 'Validation failed. Please resolve blocking errors listed in the Issues tab.',
          warnings: warningList
        });
      } else if (warningList.length > 0) {
        setValidationResult({
          status: 'warning',
          message: `Validation passed with ${warningList.length} warning(s).`,
          warnings: warningList
        });
      } else {
        setValidationResult({
          status: 'success',
          message: 'Validation passed successfully. No issues found.',
          warnings: []
        });
      }
    } else {
      setValidationResult(prev => ({
        ...prev,
        warnings: warningList
      }));
    }

    return !hasErrors;
  }, [edges, nodes, setNodes, focusNode, setIsSidebarOpen, setActiveSidebarTab, setValidationResult]);

  return { validateGraph };
};
