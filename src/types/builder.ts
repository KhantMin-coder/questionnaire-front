import type { Edge, Node } from '@xyflow/react';
import type { EdgeRule } from '../utils/graphLogic';

export interface SurveyItem {
  id: string;
  title: string;
  status: 'published' | 'draft';
  lastModified: string;
  kpis?: Array<{
    label: string;
    value: string;
    change: string;
    icon: string;
  }>;
  timeline?: any[];
  dropOff?: any[];
  pie?: any[];
  questions?: any[];
  logs?: any[];
}

export interface CustomNode extends Node {
  data: {
    label?: string;
    questionType?: 'single' | 'multi' | 'input';
    options?: string[];
    delayDuration?: string;
    targetQuestionnaireId?: string;
    targetQuestionnaireName?: string;
    isDisqualification?: boolean;
    terminalMessage?: string;
    allowOther?: boolean;
    warnings?: string[];
    onFocusWarning?: () => void;
    [key: string]: any;
  };
}

export interface ExtendedEdge extends Edge {
  rules?: EdgeRule[];
  data?: {
    rules?: EdgeRule[];
    onSelect?: () => void;
    [key: string]: any;
  };
}

export interface ValidationWarning {
  message: string;
  nodeId?: string;
  isError?: boolean;
}
