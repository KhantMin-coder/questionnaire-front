import React from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  GitFork,
  Clock,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Layers
} from 'lucide-react';

interface LandingBentoFeaturesProps {
  sectionVariants: Variants;
  bentoCardVariants: Variants;
}

export const LandingBentoFeatures: React.FC<LandingBentoFeaturesProps> = ({
  sectionVariants,
  bentoCardVariants
}) => {
  return (
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
  );
};
