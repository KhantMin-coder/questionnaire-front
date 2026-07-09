import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import {
  GitFork,
  Clock,
  BarChart3,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  Sparkles,
  Layers,
  ArrowLeft,
  Mail,
  Eye,
  Settings
} from 'lucide-react';
import { ReactFlow, Background, Position, Handle } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './Landing.css';
// useAuth import removed
import { evaluateEdgeConditions } from '../utils/graphLogic';
import type { NodeData, GraphEdge } from '../utils/graphLogic';

// Sample mock nodes & edges for the React Flow preview in Hero
const previewNodes = [
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

const previewEdges = [
  { id: 'e1-2', source: 'n1', target: 'n2', label: 'age >= 18', animated: true, style: { stroke: 'var(--primary-color)' } },
  { id: 'e1-5', source: 'n1', target: 'n5', label: 'age < 18', style: { stroke: '#ef4444', strokeDasharray: '4,4' } },
  { id: 'e2-3', source: 'n2', target: 'n3', label: 'Vue / Svelte', animated: true, style: { stroke: 'var(--primary-color)' } },
  { id: 'e2-4', source: 'n2', target: 'n4', label: 'React', style: { stroke: 'var(--primary-color)' } },
  { id: 'e3-4', source: 'n3', target: 'n4', label: 'default', style: { stroke: 'var(--primary-color)' } }
];

// Custom node components for the landing page React Flow preview
const PreviewQuestionNode = ({ data }: { data: { label: string } }) => {
  return (
    <div className="glass-panel preview-node preview-node--question">
      <Handle type="target" position={Position.Left} className="handle--muted" />
      <div className="preview-node-header">
        <HelpCircle size={10} />
        <span>QUESTION</span>
      </div>
      <div className="preview-node-title">{data.label}</div>
      <Handle type="source" position={Position.Right} className="handle--primary" />
    </div>
  );
};

const PreviewDelayNode = ({ data }: { data: { label: string; delayDuration?: string } }) => {
  return (
    <div className="glass-panel preview-node preview-node--delay">
      <Handle type="target" position={Position.Left} className="handle--muted" />
      <div className="preview-node-header">
        <Clock size={10} />
        <span>DELAY SCHEDULE</span>
      </div>
      <div className="preview-node-title">{data.label}</div>
      <div className="preview-node-delay-sub">Wait {data.delayDuration}</div>
      <Handle type="source" position={Position.Right} className="handle--primary" />
    </div>
  );
};

const PreviewTerminalNode = ({ data }: { data: { label: string; isDisqualification?: boolean } }) => {
  const isDis = data.isDisqualification;
  return (
    <div className={`glass-panel preview-node ${isDis ? 'preview-node--terminal-danger' : 'preview-node--terminal-success'}`}>
      <Handle type="target" position={Position.Left} className="handle--muted" />
      <div className="preview-node-header">
        {isDis ? <ShieldAlert size={10} /> : <CheckCircle size={10} />}
        <span>{isDis ? 'DISQUALIFY' : 'COMPLETE'}</span>
      </div>
      <div className="preview-node-title">{data.label}</div>
    </div>
  );
};

const nodeTypes = {
  question: PreviewQuestionNode,
  delay: PreviewDelayNode,
  terminal: PreviewTerminalNode
};

// Demo Survey Runner nodes and edges
const demoNodes: NodeData[] = [
  { id: '1', type: 'question', label: 'How old are you?', questionType: 'input' },
  { id: '2', type: 'question', label: 'Which framework do you prefer?', questionType: 'single', options: ['React', 'Vue', 'Svelte'] },
  { id: '3', type: 'delay', label: 'Follow-up Scheduled', delayDuration: '2 days' },
  { id: '4', type: 'terminal', label: 'Completed', terminalMessage: 'Survey Completed! Thank you for participating. In a real scenario, Questionnaire B would be sent to you in 2 days.' },
  { id: '5', type: 'terminal', label: 'Disqualified', terminalMessage: 'Survey ended. We require participants to be 18 or older.' }
];

const demoEdges: GraphEdge[] = [
  { id: 'de1-5', source: '1', target: '5', rules: [{ field: '1', operator: '<', value: '18' }] },
  { id: 'de1-2', source: '1', target: '2', rules: [{ field: '1', operator: '>=', value: '18' }] },
  { id: 'de2-3', source: '2', target: '3', rules: [{ field: '2', operator: '!=', value: 'React' }] },
  { id: 'de2-4', source: '2', target: '4', rules: [{ field: '2', operator: '==', value: 'React' }] },
  { id: 'de3-4', source: '3', target: '4', rules: [] }
];

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Demo Runner State
  const [demoCurrentNode, setDemoCurrentNode] = useState<NodeData | null>(demoNodes[0]);
  const [demoAnswers, setDemoAnswers] = useState<Record<string, any>>({});
  const [demoHistory, setDemoHistory] = useState<string[]>([]);
  const [demoTraversedDelay, setDemoTraversedDelay] = useState(false);
  const [demoEmail, setDemoEmail] = useState('');
  const [demoIsSubmitted, setDemoIsSubmitted] = useState(false);
  const [demoError, setDemoError] = useState('');

  // handleAuthSubmit removed (authentication handled via /login page)

  // Demo Runner Handlers
  const handleDemoNext = () => {
    if (!demoCurrentNode) return;
    setDemoError('');

    const answer = demoAnswers[demoCurrentNode.id];
    if (demoCurrentNode.type === 'question' && (answer === undefined || answer === '')) {
      setDemoError('Please provide an answer before continuing.');
      return;
    }

    if (demoCurrentNode.type === 'question' && demoCurrentNode.questionType === 'input' && isNaN(Number(answer))) {
      setDemoError('Please enter a valid age (number).');
      return;
    }

    setDemoHistory(prev => [...prev, demoCurrentNode.id]);

    if (demoCurrentNode.type === 'delay') {
      setDemoTraversedDelay(true);
    }

    // Evaluate outgoing branches
    const outgoing = demoEdges.filter(e => e.source === demoCurrentNode.id);
    let nextId: string | null = null;

    // Check rules
    for (const edge of outgoing) {
      if (edge.rules && edge.rules.length > 0) {
        if (evaluateEdgeConditions(demoAnswers, edge.rules)) {
          nextId = edge.target;
          break;
        }
      }
    }

    // Default route
    if (!nextId) {
      const defEdge = outgoing.find(e => !e.rules || e.rules.length === 0);
      if (defEdge) {
        nextId = defEdge.target;
      }
    }

    if (nextId) {
      const nextNode = demoNodes.find(n => n.id === nextId);
      if (nextNode) {
        if (nextNode.type === 'delay') {
          setDemoTraversedDelay(true);
          // Auto traverse delay node to the next step
          const delayOutgoing = demoEdges.filter(e => e.source === nextNode.id);
          const nextNextId = delayOutgoing.length > 0 ? delayOutgoing[0].target : null;
          if (nextNextId) {
            const nextNextNode = demoNodes.find(n => n.id === nextNextId);
            if (nextNextNode) {
              setDemoCurrentNode(nextNextNode);
              return;
            }
          }
        }
        setDemoCurrentNode(nextNode);
      }
    }
  };

  const handleDemoBack = () => {
    if (demoHistory.length === 0) return;
    const prevHistory = [...demoHistory];
    const prevId = prevHistory.pop();
    setDemoHistory(prevHistory);
    setDemoError('');

    const prevNode = demoNodes.find(n => n.id === prevId);
    if (prevNode) {
      setDemoCurrentNode(prevNode);
    }
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (demoTraversedDelay && !demoEmail) {
      setDemoError('Email address is required for follow-up scheduling.');
      return;
    }
    setDemoIsSubmitted(true);
  };

  const resetDemo = () => {
    setDemoCurrentNode(demoNodes[0]);
    setDemoAnswers({});
    setDemoHistory([]);
    setDemoTraversedDelay(false);
    setDemoEmail('');
    setDemoIsSubmitted(false);
    setDemoError('');
  };

  // Scroll animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as any } }
  };

  const textLineVariants = {
    hidden: { y: '100%', opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any } }
  };

  const bentoCardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  return (
    <div className="landing-page">
      {/* Scroll Progress Indicator Bar */}
      <motion.div
        className="scroll-progress-bar"
        style={{
          scaleX: scrollYProgress
        }}
      />

      {/* 1. Hero Section */}
      <section className="landing-hero">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="landing-hero-content"
        >
          <div className="landing-badge">
            <Sparkles size={12} className="landing-badge-icon" /> DYNAMIC RESEARCH PLATFORM
          </div>

          <h1 className="landing-hero-title">
            <div className="landing-title-row">
              <motion.span
                initial="hidden"
                animate="visible"
                variants={textLineVariants}
                className="display-inline-block"
              >
                Map respondent journeys
              </motion.span>
            </div>
            <div className="landing-title-row">
              <motion.span
                initial="hidden"
                animate="visible"
                variants={textLineVariants}
                className="display-inline-block"
                transition={{ delay: 0.15 }}
              >
                <span className="landing-title-cursive">
                  visually.
                </span>
              </motion.span>
            </div>
          </h1>

          <p className="landing-hero-desc">
            Build visual survey trees with an intuitive drag-and-drop canvas.
            Automate branching paths and time-delayed follow-up questionnaires without writing single lines of code.
          </p>

          <div className="landing-hero-actions">
            <button
              onClick={() => navigate('/login', { state: { register: true } })}
              className="btn btn-primary"
            >
              Start Building Free <ArrowRight size={18} />
            </button>
            <a
              href="#live-demo"
              className="btn btn-secondary"
            >
              Test Prototype
            </a>
          </div>

          <div className="landing-hero-stats">
            <div>
              <div className="landing-stat-value">3 Levels</div>
              <div className="landing-stat-label">Follow-up Depth Limit</div>
            </div>
            <div className="landing-stat-divider" />
            <div>
              <div className="landing-stat-value">Cycle Safe</div>
              <div className="landing-stat-label">Loop Detection Built-in</div>
            </div>
            <div className="landing-stat-divider" />
            <div>
              <div className="landing-stat-value">100% Secure</div>
              <div className="landing-stat-label">Signed JWT Survey Links</div>
            </div>
          </div>
        </motion.div>

        {/* Interactive React Flow Canvas right inside the Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
          className="glass-panel landing-flow-preview"
        >
          {/* Mock Browser Header */}
          <div className="landing-flow-chrome">
            <div className="landing-flow-dots">
              <div className="landing-flow-dot landing-flow-dot--red" />
              <div className="landing-flow-dot landing-flow-dot--yellow" />
              <div className="landing-flow-dot landing-flow-dot--green" />
            </div>
            <div className="landing-flow-url">
              <Eye size={10} /> resonator.io/builder/demo-survey
            </div>
            <Settings size={14} />
          </div>

          <div className="landing-flow-wrapper">
            <ReactFlow
              nodes={previewNodes}
              edges={previewEdges}
              nodeTypes={nodeTypes}
              fitView
              nodesDraggable={true}
              nodesConnectable={false}
              zoomOnScroll={false}
              panOnScroll={true}
              preventScrolling={true}
            >
              <Background color="var(--text-muted)" gap={16} size={1} />
            </ReactFlow>

            {/* Interactive afforadance label */}
            <div className="landing-flow-affordance">
              <GitFork size={10} /> Interactive preview (Try dragging cards)
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. How It Works Timeline Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionVariants}
        className="landing-section landing-section-padding-sm"
      >
        <div className="landing-section-header">
          <h2 className="landing-section-title">
            Unrivaled Simplicity, Engineered for Teams
          </h2>
          <p className="landing-section-desc">
            Standard survey forms are outdated. Resonator handles complex cohort routing logic in three basic steps.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12
              }
            }
          }}
          className="landing-timeline-grid"
        >
          {[
            {
              step: '01',
              title: 'Draw the logic tree',
              desc: 'Drag cards and connect transition arrows to direct respondents depending on their inputs. Set thresholds and loop checks easily.'
            },
            {
              step: '02',
              title: 'Share securely',
              desc: 'Distribute personalized survey access codes or embed paths directly. Each connection links securely back to their profile.'
            },
            {
              step: '03',
              title: 'Automate follow-ups',
              desc: 'Place Delay nodes on the canvas. Resonator schedules secondary forms to dispatch after set delays automatically.'
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={bentoCardVariants}
              whileHover={{ y: -6, scale: 1.01, boxShadow: 'var(--shadow-lg)' }}
              className="glass-panel landing-bento-card"
            >
              <span className="landing-step-num">
                {item.step}
              </span>
              <h3 className="landing-bento-card-title">
                {item.title}
              </h3>
              <p className="landing-bento-card-desc">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* 3. Features Bento Grid Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionVariants}
        className="landing-section landing-section-padding"
      >
        <div className="landing-hero-content">
          <div className="landing-section-header">
            <h2 className="landing-section-title">
              Powerful capabilities under the hood
            </h2>
            <p className="landing-section-desc">
              Designed to be robust, secure, and intuitive.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.12
                }
              }
            }}
            className="landing-bento-grid"
          >
            {/* Box 1: Visual builder - span 2 */}
            <motion.div
              variants={bentoCardVariants}
              whileHover={{ y: -6, scale: 1.005, boxShadow: 'var(--shadow-lg)' }}
              className="glass-panel landing-feature-card landing-feature-card--span2"
            >
              <div>
                <div className="landing-icon-wrapper">
                  <GitFork size={20} />
                </div>
                <h3 className="landing-feature-title">Infinite Canvas Designer</h3>
                <p className="landing-feature-desc">
                  Build respondent paths by connecting question cards, delay nodes, and terminal points. Connect logic rules directly onto the transition lines for real-time visual logic routing.
                </p>
              </div>

              {/* Mini Interactive Flow Mock */}
              <div className="landing-flow-mini">
                <div className="glass-panel landing-mini-node landing-mini-node--question">
                  <div className="landing-mini-dot" />
                  Question Node
                </div>
                <ArrowRight size={14} />
                <div className="glass-panel landing-mini-node landing-mini-node--delay">
                  <Clock size={12} />
                  Delay (2 Days)
                </div>
                <ArrowRight size={14} />
                <div className="glass-panel landing-mini-node landing-mini-node--complete">
                  <CheckCircle size={12} />
                  Complete Node
                </div>
              </div>
            </motion.div>

            {/* Box 2: Branching - span 1 */}
            <motion.div
              variants={bentoCardVariants}
              whileHover={{ y: -6, scale: 1.01, boxShadow: 'var(--shadow-lg)' }}
              className="glass-panel landing-feature-card landing-feature-card--small"
            >
              <div>
                <div className="landing-icon-wrapper">
                  <Sparkles size={20} />
                </div>
                <h3 className="landing-feature-title">Conditional Branches</h3>
                <p className="landing-feature-desc">
                  Direct respondents dynamically depending on inputs using rules (like equals, unequal, contains, less/greater than) with logical AND/OR filters.
                </p>
              </div>
              <div className="landing-badge-expression">
                IF (Age &lt; 18) THEN Disqualify
              </div>
            </motion.div>

            {/* Box 3: Automated scheduling - span 1 */}
            <motion.div
              variants={bentoCardVariants}
              whileHover={{ y: -6, scale: 1.01, boxShadow: 'var(--shadow-lg)' }}
              className="glass-panel landing-feature-card landing-feature-card--small"
            >
              <div>
                <div className="landing-icon-wrapper">
                  <Clock size={20} />
                </div>
                <h3 className="landing-feature-title">Delayed Follow-ups</h3>
                <p className="landing-feature-desc">
                  Automate secondary email surveys based on paths traversed during session. Background schedulers handle the dispatch queue flawlessly.
                </p>
              </div>
              <span className="landing-card-footer-info">
                <Clock size={12} /> Scheduled via BullMQ queue
              </span>
            </motion.div>

            {/* Box 4: Safety checking - span 2 */}
            <motion.div
              variants={bentoCardVariants}
              whileHover={{ y: -6, scale: 1.005, boxShadow: 'var(--shadow-lg)' }}
              className="glass-panel landing-feature-card landing-feature-card--span2"
            >
              <div>
                <div className="landing-icon-wrapper">
                  <Layers size={20} />
                </div>
                <h3 className="landing-feature-title">Cycle Detection & Safeguards</h3>
                <p className="landing-feature-desc">
                  Never get stuck in infinite routing loops. The platform automatically executes DFS loop checks upon save and enforces a maximum chain depth of 3 levels to maintain respondent quality.
                </p>
              </div>

              <div className="landing-safeguard-row">
                <span className="landing-safeguard-badge">
                  <CheckCircle size={12} /> Cycle check passed
                </span>
                <span className="landing-safeguard-badge">
                  <CheckCircle size={12} /> Depth: 2/3 (Valid)
                </span>
              </div>
            </motion.div>

            {/* Box 5: Analytics - span 3 */}
            <motion.div
              variants={bentoCardVariants}
              whileHover={{ y: -6, scale: 1.005, boxShadow: 'var(--shadow-lg)' }}
              className="glass-panel landing-feature-card landing-feature-card--span3"
            >
              <div className="landing-feature-card-main">
                <div className="landing-icon-wrapper">
                  <BarChart3 size={20} />
                </div>
                <h3 className="landing-feature-title">Real-time Drop-off Insights</h3>
                <p className="landing-feature-desc">
                  Track completion times, participant drop-off nodes, and response rates dynamically. Correlate delayed surveys directly back to parent entries in cross-questionnaire dashboards.
                </p>
              </div>

              {/* Animated Mock Chart */}
              <div className="landing-chart-mini">
                <div className="landing-chart-header">
                  <span>Question drop-off rates</span>
                  <span>Avg Completion: 1m 45s</span>
                </div>

                {/* Bar 1 */}
                <div className="landing-chart-bar-group">
                  <div className="landing-chart-bar-info">
                    <span>Q1: Age input</span>
                    <span>98% completed</span>
                  </div>
                  <div className="landing-chart-bar-track">
                    <div className="landing-chart-bar-fill landing-bar-98" />
                  </div>
                </div>

                {/* Bar 2 */}
                <div className="landing-chart-bar-group">
                  <div className="landing-chart-bar-info">
                    <span>Q2: Framework Choice</span>
                    <span>82% completed</span>
                  </div>
                  <div className="landing-chart-bar-track">
                    <div className="landing-chart-bar-fill landing-bar-82" />
                  </div>
                </div>

                {/* Bar 3 */}
                <div className="landing-chart-bar-group">
                  <div className="landing-chart-bar-info">
                    <span>Q3: Follow-up survey</span>
                    <span>45% completed</span>
                  </div>
                  <div className="landing-chart-bar-track">
                    <div className="landing-chart-bar-fill landing-bar-45" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* 4. Interactive Survey Runner Demo Section */}
      <motion.section
        id="live-demo"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionVariants}
        className="landing-section landing-section-padding"
      >
        <div className="landing-demo-layout">
          <div>
            <div className="landing-badge margin-bottom-md">
              LIVE ENGINE WIZARD
            </div>
            <h2 className="landing-section-title margin-bottom-lg">
              Test the branching engine in real time
            </h2>
            <p className="landing-demo-desc">
              Interact with the active survey simulator on the right.
              Fill in your age, select a development framework, and see how the platform dynamically directs you:
            </p>
            <ul className="landing-demo-list">
              <li className="landing-demo-list-item">
                <div className="landing-demo-list-dot" />
                <span>Entering an age under 18 immediately redirects to the <strong>Disqualification</strong> screen.</span>
              </li>
              <li className="landing-demo-list-item">
                <div className="landing-demo-list-dot" />
                <span>Selecting <strong>Vue</strong> or <strong>Svelte</strong> schedules a 2-day follow-up.</span>
              </li>
              <li className="landing-demo-list-item">
                <div className="landing-demo-list-dot" />
                <span>Selecting <strong>React</strong> skips the follow-up and lands directly on Completion.</span>
              </li>
            </ul>
          </div>

          {/* Simulated Device Frame for the Runner Demo */}
          <div className="glass-panel landing-phone-chrome">
            {/* Phone/Tablet top chrome bar */}
            <div className="landing-phone-header">
              <span>Respondent Simulator</span>
              <div className="landing-phone-status">
                <div className="landing-phone-status-dot" />
                <span>Active Session</span>
              </div>
            </div>

            <div className="landing-phone-content">
              <AnimatePresence mode="wait">
                {demoIsSubmitted ? (
                  <motion.div
                    key="submitted"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="landing-success-card"
                  >
                    <div className="landing-success-badge">
                      <CheckCircle size={28} />
                    </div>
                    <h3 className="landing-success-title">Submission Successful!</h3>
                    <p className="landing-success-desc">
                      {demoTraversedDelay
                        ? `Follow-up survey scheduled! A secure link will be sent to ${demoEmail} in 2 days.`
                        : 'Survey submitted successfully! No follow-up delay nodes were triggered.'}
                    </p>
                    <button onClick={resetDemo} className="btn btn-secondary margin-top-sm">
                      Restart Simulator
                    </button>
                  </motion.div>
                ) : demoCurrentNode ? (
                  <motion.div
                    key={demoCurrentNode.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="landing-hero-content flex-gap-md"
                  >
                    <div className="landing-phone-meta">
                      <span className="landing-phone-node-num">
                        Node {demoCurrentNode.id} of 5
                      </span>
                      {demoTraversedDelay && (
                        <span className="landing-phone-pending-badge">
                          Follow-up pending
                        </span>
                      )}
                    </div>

                    <h3 className="landing-phone-qtitle">
                      {demoCurrentNode.label}
                    </h3>

                    {demoError && (
                      <div className="landing-phone-error">
                        {demoError}
                      </div>
                    )}

                    {/* Input rendering */}
                    {demoCurrentNode.type === 'question' && demoCurrentNode.questionType === 'input' && (
                      <div className="form-group landing-phone-form-group">
                        <label className="form-label" htmlFor="demo-age-input">Your Age</label>
                        <input
                          id="demo-age-input"
                          type="text"
                          className="form-input"
                          placeholder="e.g. 21"
                          value={demoAnswers[demoCurrentNode.id] || ''}
                          onChange={(e) => setDemoAnswers({ ...demoAnswers, [demoCurrentNode.id]: e.target.value })}
                        />
                      </div>
                    )}

                    {demoCurrentNode.type === 'question' && demoCurrentNode.questionType === 'single' && (
                      <div className="landing-phone-options">
                        {demoCurrentNode.options?.map((opt, i) => {
                          const isSelected = demoAnswers[demoCurrentNode.id] === opt;
                          return (
                            <button
                              key={i}
                              onClick={() => setDemoAnswers({ ...demoAnswers, [demoCurrentNode.id]: opt })}
                              className={`landing-phone-option-btn ${isSelected ? 'landing-phone-option-btn--selected' : 'landing-phone-option-btn--unselected'}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {demoCurrentNode.type === 'terminal' && (
                      <div className="landing-hero-content flex-gap-md">
                        <p className="landing-phone-para">
                          {demoCurrentNode.terminalMessage}
                        </p>

                        {demoTraversedDelay ? (
                          <form onSubmit={handleDemoSubmit} className="landing-phone-email-form">
                            <div className="form-group landing-phone-form-group">
                              <label className="form-label" htmlFor="demo-email-input">Provide Email to schedule follow-up</label>
                              <div className="landing-phone-email-wrapper">
                                <Mail size={14} className="landing-phone-email-icon" />
                                <input
                                  id="demo-email-input"
                                  type="email"
                                  className="form-input landing-phone-email-input"
                                  placeholder="researcher@university.edu"
                                  value={demoEmail}
                                  onChange={(e) => setDemoEmail(e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                            <button type="submit" className="btn btn-primary width-full">
                              Submit & Schedule
                            </button>
                          </form>
                        ) : (
                          <button onClick={() => setDemoIsSubmitted(true)} className="btn btn-primary width-full">
                            Complete Survey
                          </button>
                        )}
                      </div>
                    )}

                    {/* Navigation buttons */}
                    {demoCurrentNode.type !== 'terminal' && (
                      <div className="landing-phone-nav-row">
                        <button
                          onClick={handleDemoBack}
                          disabled={demoHistory.length === 0}
                          className="btn btn-secondary landing-phone-back-btn"
                          style={{ opacity: demoHistory.length === 0 ? 0.4 : 1 }}
                        >
                          <ArrowLeft size={14} /> Back
                        </button>
                        <button onClick={handleDemoNext} className="btn btn-primary landing-phone-next-btn">
                          Next <ArrowRight size={14} />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 5. Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-container">
          <div>
            <strong>Resonator Research Flow Platform</strong>. Build smarter branching respondent paths.
          </div>
          <div>
            © {new Date().getFullYear()} Resonator. Designed with Forest Sage palette.
          </div>
        </div>
      </footer>
    </div>
  );
};
