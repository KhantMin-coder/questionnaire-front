import type { Edge, Node } from '@xyflow/react';
import type { EdgeRule } from '../utils/graphLogic';

export interface SurveyKPI {
  label: string;
  value: string;
  change: string;
  icon: string;
}

export interface QuestionStatOption {
  name: string;
  count: number;
  percentage: number;
}

export interface QuestionBreakdown {
  id: string;
  number: number;
  type: 'input' | 'single' | 'multi';
  text: string;
  responses: number;
  stats?: string;
  options?: QuestionStatOption[];
}

export interface FollowUpLog {
  email: string;
  original: string;
  followUp: string;
  status: string;
}

export interface SurveyItem {
  id: string;
  title: string;
  status: 'published' | 'draft' | 'archived';
  lastModified: string;
  kpis: SurveyKPI[];
  timeline: Array<{ date: string; completed: number; pending: number; disqualified: number }>;
  dropOff: Array<{ name: string; completed: number; dropOff: number }>;
  pie: Array<{ name: string; value: number; color: string }>;
  questions: QuestionBreakdown[];
  logs: FollowUpLog[];
}

export interface CustomNode extends Node {
  data: {
    label?: string;
    helperText?: string;
    questionType?: 'single' | 'multi' | 'input';
    inputType?: 'text' | 'number' | 'date' | 'textarea';
    options?: string[];
    delayDuration?: string;
    targetQuestionnaireId?: string;
    targetQuestionnaireName?: string;
    isDisqualification?: boolean;
    terminalMessage?: string;
    allowOther?: boolean;
    warnings?: string[];
    onFocusWarning?: () => void;
    [key: string]: unknown;
  };
}

export interface ExtendedEdge extends Edge {
  rules?: EdgeRule[];
  data?: {
    rules?: EdgeRule[];
    onSelect?: () => void;
    [key: string]: unknown;
  };
}

export interface ValidationWarning {
  message: string;
  nodeId?: string;
  isError?: boolean;
}
