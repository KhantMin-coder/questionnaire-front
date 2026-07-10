import React from 'react';
import { Users, Percent, Clock, CheckCircle } from 'lucide-react';
import type { SurveyItem } from '../../types/builder';

export const mockSurveys: SurveyItem[] = [
  {
    id: 'survey_1',
    title: 'Developer Framework Satisfaction',
    status: 'published',
    lastModified: '2 hours ago',
    kpis: [
      { label: 'Total Responses', value: '1,248', change: '+12%', icon: 'Users' },
      { label: 'Completion Rate', value: '78.5%', change: '+2.4%', icon: 'Percent' },
      { label: 'Avg. Finish Time', value: '2m 14s', change: '-12s', icon: 'Clock' },
      { label: 'Follow-ups Triggered', value: '412', change: '33% email rate', icon: 'CheckCircle' }
    ],
    timeline: [
      { date: 'Jul 04', completed: 120, pending: 45, disqualified: 15 },
      { date: 'Jul 05', completed: 150, pending: 50, disqualified: 20 },
      { date: 'Jul 06', completed: 180, pending: 55, disqualified: 18 },
      { date: 'Jul 07', completed: 210, pending: 62, disqualified: 25 },
      { date: 'Jul 08', completed: 195, pending: 58, disqualified: 22 },
      { date: 'Jul 09', completed: 225, pending: 68, disqualified: 30 },
      { date: 'Jul 10', completed: 168, pending: 74, disqualified: 28 }
    ],
    dropOff: [
      { name: 'Q1: Age limit', completed: 1248, dropOff: 12 },
      { name: 'Q2: Framework pref', completed: 1180, dropOff: 56 },
      { name: 'Q3: Delay wait', completed: 980, dropOff: 200 },
      { name: 'Q4: Survey complete', completed: 980, dropOff: 0 }
    ],
    pie: [
      { name: 'React Path', value: 768, color: 'var(--primary-color)' },
      { name: 'Vue Path', value: 280, color: '#f59e0b' },
      { name: 'Svelte Path', value: 200, color: '#ef4444' }
    ],
    questions: [
      { id: '1', number: 1, type: 'input', text: 'How old are you?', responses: 1248, stats: 'Median age: 26.5 years' },
      { id: '2', number: 2, type: 'single', text: 'Which framework do you prefer?', responses: 1180, options: [
        { name: 'React', count: 768, percentage: 65 },
        { name: 'Vue', count: 280, percentage: 24 },
        { name: 'Svelte', count: 132, percentage: 11 }
      ] }
    ],
    logs: [
      { email: 'dev_alicia@github.io', original: 'Developer Survey', followUp: 'Deep React cohort', status: 'Response Linked' },
      { email: 'sam@vercel.com', original: 'Developer Survey', followUp: 'Vue Scheduler survey', status: 'Response Linked' },
      { email: 'jordan@svelte.dev', original: 'Developer Survey', followUp: 'Svelte cohort Q', status: 'Awaiting dispatch (14h)' }
    ]
  }
];

export const mockDeviceData: Record<string, Array<{ name: string; value: number; color: string }>> = {
  survey_1: [
    { name: 'Desktop', value: 842, color: 'var(--primary-color)' },
    { name: 'Mobile', value: 312, color: '#f59e0b' },
    { name: 'Tablet', value: 94, color: '#ef4444' }
  ]
};

export const mockResponses: Record<string, Array<{ id: string; timestamp: string; device: string; path: string; status: string; answers: Record<string, string> }>> = {
  survey_1: [
    { id: 'resp_01', timestamp: '2026-07-10 14:23', device: 'Desktop', path: 'Q1 → Q2 (React) → Complete', status: 'Completed', answers: { Q1: '24', Q2: 'React' } },
    { id: 'resp_02', timestamp: '2026-07-10 14:26', device: 'Mobile', path: 'Q1 → Disqualified', status: 'Disqualified', answers: { Q1: '16' } },
    { id: 'resp_03', timestamp: '2026-07-10 14:30', device: 'Desktop', path: 'Q1 → Q2 (Vue) → Delay → Complete', status: 'Completed', answers: { Q1: '32', Q2: 'Vue' } }
  ]
};

export const getKpiIcon = (iconName: string) => {
  if (typeof iconName !== 'string') return null;
  switch (iconName.toLowerCase()) {
    case 'users':
      return React.createElement(Users, { size: 18, color: 'var(--primary-color)' });
    case 'percent':
      return React.createElement(Percent, { size: 18, color: 'var(--primary-color)' });
    case 'clock':
      return React.createElement(Clock, { size: 18, color: 'var(--primary-color)' });
    case 'checkcircle':
    case 'check-circle':
      return React.createElement(CheckCircle, { size: 18, color: 'var(--primary-color)' });
    default:
      return null;
  }
};
