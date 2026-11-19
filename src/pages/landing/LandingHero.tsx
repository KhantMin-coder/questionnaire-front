import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LandingHeroFlow } from './LandingHeroFlow';

interface LandingHeroProps {
  textLineVariants: Variants;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ textLineVariants }) => {
  const navigate = useNavigate();

  return (
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
  );
};
