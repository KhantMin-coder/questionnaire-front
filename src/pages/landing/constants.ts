import type { NodeData, GraphEdge } from '../../utils/graphLogic';

// Sample mock nodes & edges for the React Flow preview in Hero
export const previewNodes = [
  {
    id: 'n1',
    type: 'question',
    position: { x: 20, y: 120 },
    data: { label: 'How old are you?', questionType: 'input' }
  },
  {
    id: 'n2',
    type: 'question',
    position: { x: 240, y: 50 },
    data: { label: 'Framework of choice?', questionType: 'single', options: ['React', 'Vue', 'Svelte'] }
  },
  {
    id: 'n3',
    type: 'delay',
    position: { x: 460, y: 150 },
    data: { label: 'Delay Follow-up', delayDuration: '2 days' }
  },
  {
    id: 'n4',
    type: 'terminal',
    position: { x: 670, y: 50 },
    data: { label: 'Success Completion', terminalMessage: 'Thank you for completing the survey!' }
  },
  {
    id: 'n5',
    type: 'terminal',
    position: { x: 240, y: 220 },
    data: { label: 'Disqualification', isDisqualification: true, terminalMessage: 'Survey ended. You must be over 18.' }
  }
];

export const previewEdges = [
  { id: 'e1-2', source: 'n1', target: 'n2', label: 'age >= 18', animated: true, style: { stroke: 'var(--primary-color)' } },
  { id: 'e1-5', source: 'n1', target: 'n5', label: 'age < 18', style: { stroke: '#ef4444', strokeDasharray: '4,4' } },
  { id: 'e2-3', source: 'n2', target: 'n3', label: 'Vue / Svelte', animated: true, style: { stroke: 'var(--primary-color)' } },
  { id: 'e2-4', source: 'n2', target: 'n4', label: 'React', style: { stroke: 'var(--primary-color)' } },
  { id: 'e3-4', source: 'n3', target: 'n4', label: 'default', style: { stroke: 'var(--primary-color)' } }
];

// Demo Survey Runner nodes and edges
export const demoNodes: NodeData[] = [
  { id: '1', type: 'question', label: 'How old are you?', questionType: 'input' },
  { id: '2', type: 'question', label: 'Which framework do you prefer?', questionType: 'single', options: ['React', 'Vue', 'Svelte'] },
  { id: '3', type: 'delay', label: 'Follow-up Scheduled', delayDuration: '2 days' },
  { id: '4', type: 'terminal', label: 'Completed', terminalMessage: 'Survey Completed! Thank you for participating. In a real scenario, Questionnaire B would be sent to you in 2 days.' },
  { id: '5', type: 'terminal', label: 'Disqualified', terminalMessage: 'Survey ended. We require participants to be 18 or older.' }
];

export const demoEdges: GraphEdge[] = [
  { id: 'de1-5', source: '1', target: '5', rules: [{ field: '1', operator: '<', value: '18' }] },
  { id: 'de1-2', source: '1', target: '2', rules: [{ field: '1', operator: '>=', value: '18' }] },
  { id: 'de2-3', source: '2', target: '3', rules: [{ field: '2', operator: '!=', value: 'React' }] },
  { id: 'de2-4', source: '2', target: '4', rules: [{ field: '2', operator: '==', value: 'React' }] },
  { id: 'de3-4', source: '3', target: '4', rules: [] }
];
