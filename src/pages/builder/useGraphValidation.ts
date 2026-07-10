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

    // 1. Empty Flow Check (Blocking)
    if (nodes.length === 0) {
      warningList.push({
        message: 'A questionnaire cannot be empty. Please add at least one node to the canvas before publishing.',
        isError: true
      });
      setValidationResult({
        status: 'error',
        message: 'Validation failed. The canvas is empty.',
        warnings: warningList
      });
      return false;
    }

    // 2. Cycle Detection (Blocking)
    const hasCycle = detectCycle(nodes, edges);
    if (hasCycle) {
      warningList.push({
        message: 'Graph contains infinite routing loops (cycles detected). Cannot publish.',
        isError: true
      });
    }

    // 3. Chain Depth Enforcement (Blocking)
    const depthVal = validateFollowUpDepth(nodes, edges);
    if (!depthVal.valid) {
      warningList.push({
        message: `Maximum follow-up chain depth exceeded. Limit: 3 levels (Found: ${depthVal.depth}).`,
        isError: true
      });
    }

    // 4. Missing Terminal Node Check (Blocking)
    const hasTerminalNode = nodes.some(n => n.type === 'terminal');
    if (!hasTerminalNode) {
      warningList.push({
        message: 'The survey flow must contain at least one Terminal Node (Completion or Disqualification) so respondents can complete the survey.',
        isError: true
      });
    }

    // Determine start/incoming connections mapping
    const incomingCounts: Record<string, number> = {};
    nodes.forEach(n => { incomingCounts[n.id] = 0; });
    allEdges.forEach(e => {
      if (incomingCounts[e.target] !== undefined) {
        incomingCounts[e.target]++;
      }
    });

    const startNodes = nodes.filter(n => incomingCounts[n.id] === 0);
    const mainStartNode = startNodes[0];

    // 5. Unreachable & Disconnected Nodes Traversal (Warning)
    const visited = new Set<string>();
    if (mainStartNode) {
      const queue: string[] = [mainStartNode.id];
      visited.add(mainStartNode.id);

      while (queue.length > 0) {
        const currId = queue.shift()!;
        const outgoing = allEdges.filter(e => e.source === currId);
        outgoing.forEach(edge => {
          if (!visited.has(edge.target)) {
            visited.add(edge.target);
            queue.push(edge.target);
          }
        });
      }
    }

    nodes.forEach(node => {
      // Orphaned: no incoming connection (except main start node)
      if (node.id !== mainStartNode?.id && incomingCounts[node.id] === 0) {
        warningList.push({
          message: `${node.type === 'delay' ? 'Delay' : node.type === 'terminal' ? 'Terminal' : 'Question'} "Q${node.id}: ${node.data?.label || 'Untitled'}" is orphaned with no incoming paths.`,
          nodeId: node.id
        });
      } 
      // Disconnected: has incoming connections but unreachable from start node
      else if (mainStartNode && !visited.has(node.id)) {
        warningList.push({
          message: `${node.type === 'delay' ? 'Delay' : node.type === 'terminal' ? 'Terminal' : 'Question'} "Q${node.id}: ${node.data?.label || 'Untitled'}" is unreachable from the survey starting node.`,
          nodeId: node.id
        });
      }
    });

    // 6. Dead End Fan-out checks (Warning)
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

    // 7. Question Condition Evaluations (Blocking & Warning checks)
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

        // Duplicate and stale rules check
        const optionUsage: Record<string, string[]> = {};
        conditionalEdges.forEach(edge => {
          const rules = edge.rules || [];
          rules.forEach((rule: EdgeRule) => {
            // Rule 3: Invalid Field Reference check (Blocking)
            const referencedNode = nodes.find(n => n.id === rule.field);
            if (!referencedNode) {
              warningList.push({
                message: `Routing connection from Q${node.id} references a deleted or non-existent question field (ID: ${rule.field}).`,
                isError: true,
                nodeId: node.id
              });
              return;
            }

            // Rule 1: Stale Choice Conditions check (Blocking)
            if (referencedNode.type === 'question' && (referencedNode.data?.questionType === 'single' || referencedNode.data?.questionType === 'multi')) {
              const options = referencedNode.data?.options || [];
              const isOtherVal = rule.value === 'Other' || rule.value.startsWith('Other:');
              const isValidOther = isOtherVal && referencedNode.data?.allowOther;

              if (rule.operator === '==' || rule.operator === '!=') {
                const valueExists = options.includes(rule.value);
                if (!valueExists && !isValidOther) {
                  warningList.push({
                    message: `Routing rule on path from Q${node.id} references option "${rule.value}" which is no longer configured in the question options list for Q${referencedNode.id}.`,
                    isError: true,
                    nodeId: node.id
                  });
                }
              }
            }

            // Rule 6: Type Mismatch conditions check (Warning)
            const isNumericOp = ['<', '>', '<=', '>='].includes(rule.operator);
            if (isNumericOp && referencedNode.type === 'question' && referencedNode.data?.questionType !== 'input') {
              warningList.push({
                message: `Numeric condition "${rule.operator} ${rule.value}" is configured on choice selection question Q${referencedNode.id}. Numeric checks should only be applied to input fields.`,
                nodeId: node.id
              });
            }

            // Record choice equals values to catch duplicates
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

    // Update nodes state with local warnings
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
