/**
 * Graph logic utility functions for Questionnaire Builder (Resonator).
 */

export interface EdgeRule {
  operator: '==' | '!=' | '<' | '>' | '<=' | '>=' | 'contains';
  value: string;
  field: string; // question ID
  combinator?: 'AND' | 'OR';
}

export interface NodeData {
  id: string;
  type: 'question' | 'delay' | 'terminal';
  label: string;
  helperText?: string;
  // Specific node details
  questionType?: 'single' | 'multi' | 'input';
  inputType?: 'text' | 'number' | 'date' | 'textarea';
  options?: string[];
  delayDuration?: string;
  targetQuestionnaireId?: string;
  targetQuestionnaireName?: string;
  terminalMessage?: string;
  isDisqualification?: boolean;
  allowOther?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  rules?: EdgeRule[];
  data?: {
    rules?: EdgeRule[];
  };
}

/**
 * Detect cycles in the directed graph of nodes and edges using DFS.
 * Returns true if a cycle is detected, false otherwise.
 */
export function detectCycle(nodes: { id: string }[], edges: { source: string; target: string }[]): boolean {
  const adjList: Map<string, string[]> = new Map();
  
  nodes.forEach(node => adjList.set(node.id, []));
  edges.forEach(edge => {
    if (adjList.has(edge.source)) {
      adjList.get(edge.source)!.push(edge.target);
    }
  });

  const visited: Set<string> = new Set();
  const recStack: Set<string> = new Set();

  function dfs(nodeId: string): boolean {
    if (recStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    recStack.add(nodeId);

    const neighbors = adjList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) return true;
    }

    recStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (dfs(node.id)) return true;
  }

  return false;
}

/**
 * Validates follow-up chain depth starting from a root node.
 * Must not exceed 3 levels of DelayNodes.
 */
export function validateFollowUpDepth(
  nodes: { id: string; type?: string; data?: { nodeType?: string; [key: string]: unknown } }[],
  edges: { source: string; target: string }[]
): { valid: boolean; depth: number } {
  // Construct adjacency list
  const adjList: Map<string, string[]> = new Map();
  nodes.forEach(node => adjList.set(node.id, []));
  edges.forEach(edge => {
    if (adjList.has(edge.source)) {
      adjList.get(edge.source)!.push(edge.target);
    }
  });

  // Identify DelayNode IDs
  const delayNodeIds = new Set(
    nodes.filter(n => n.type === 'delay' || n.data?.nodeType === 'delay').map(n => n.id)
  );

  let maxDelayDepth = 0;
  const memo: Map<string, number> = new Map();

  function getDelayDepth(nodeId: string, visited: Set<string>): number {
    if (visited.has(nodeId)) return 0; // Prevent cycle loops from crashing
    if (memo.has(nodeId)) return memo.get(nodeId)!;

    visited.add(nodeId);
    const neighbors = adjList.get(nodeId) || [];
    let childMaxDepth = 0;

    for (const neighbor of neighbors) {
      childMaxDepth = Math.max(childMaxDepth, getDelayDepth(neighbor, new Set(visited)));
    }

    const currentCost = delayNodeIds.has(nodeId) ? 1 : 0;
    const totalDepth = currentCost + childMaxDepth;
    
    memo.set(nodeId, totalDepth);
    return totalDepth;
  }

  for (const node of nodes) {
    maxDelayDepth = Math.max(maxDelayDepth, getDelayDepth(node.id, new Set()));
  }

  return {
    valid: maxDelayDepth <= 3,
    depth: maxDelayDepth
  };
}

/**
 * Evaluate single conditional operator.
 */
export function evaluateOperator(
  answer: string | number | string[] | null | undefined, 
  operator: string, 
  value: string
): boolean {
  if (answer === undefined || answer === null) return false;

  const strValue = String(value).trim().toLowerCase();

  const matchesSingleValue = (item: string | number): boolean => {
    const normalizedItem = String(item).trim().toLowerCase();
    if (strValue === 'other' && normalizedItem.startsWith('other:')) {
      return true;
    }
    return normalizedItem === strValue;
  };

  if (Array.isArray(answer)) {
    const normalizedList = answer.map((a) => String(a).trim().toLowerCase());
    switch (operator) {
      case '==':
      case 'contains':
        return (
          answer.some((item) => matchesSingleValue(item)) ||
          normalizedList.some((item) => item.includes(strValue))
        );
      case '!=':
        return !answer.some((item) => matchesSingleValue(item));
      default:
        return false;
    }
  }

  const strAnswer = String(answer).trim().toLowerCase();

  const numAnswer = Number(answer);
  const numValue = Number(value);
  const isAnswerNumeric = strAnswer !== '' && !Number.isNaN(numAnswer);
  const isValueNumeric = strValue !== '' && !Number.isNaN(numValue);

  switch (operator) {
    case '==':
      return matchesSingleValue(answer);
    case '!=':
      return !matchesSingleValue(answer);
    case '<':
      return isAnswerNumeric && isValueNumeric ? numAnswer < numValue : false;
    case '>':
      return isAnswerNumeric && isValueNumeric ? numAnswer > numValue : false;
    case '<=':
      return isAnswerNumeric && isValueNumeric ? numAnswer <= numValue : false;
    case '>=':
      return isAnswerNumeric && isValueNumeric ? numAnswer >= numValue : false;
    case 'contains':
      return strAnswer.includes(strValue);
    default:
      return false;
  }
}

/**
 * Evaluate compound edge conditions against respondent answers.
 */
export function evaluateEdgeConditions(
  answers: Record<string, string | number | string[] | null | undefined>, 
  rules?: EdgeRule[]
): boolean {
  if (!rules || rules.length === 0) return true; // Default branch with no condition evaluates to true

  // For multi-rule systems (AND / OR)
  // Let's assume standard behavior: rules are combined by their sequential combinator
  let result = evaluateOperator(answers[rules[0].field], rules[0].operator, rules[0].value);

  for (let i = 1; i < rules.length; i++) {
    const rule = rules[i];
    const match = evaluateOperator(answers[rule.field], rule.operator, rule.value);
    
    if (rule.combinator === 'OR') {
      result = result || match;
    } else {
      result = result && match; // default to AND
    }
  }

  return result;
}
