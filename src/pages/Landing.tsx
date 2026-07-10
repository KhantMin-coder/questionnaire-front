import React, { useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import {
  GitFork,
  Clock,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LandingHeroFlow } from './landing/LandingHeroFlow';
import { LandingSimulator } from './landing/LandingSimulator';
import './Landing.css';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
          <LandingHeroFlow />
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
          <LandingSimulator />
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
