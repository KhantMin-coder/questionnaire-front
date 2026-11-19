import React, { useEffect, useState } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LandingHero } from './landing/LandingHero';
import { LandingTimeline } from './landing/LandingTimeline';
import { LandingBentoFeatures } from './landing/LandingBentoFeatures';
import { LandingSimulator } from './landing/LandingSimulator';
import { LandingFooter } from './landing/LandingFooter';
import './Landing.css';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { scrollYProgress } = useScroll();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
          }}
          className="landing-loader-container"
        >
          <div className="landing-loader-content">
            {/* Spinning/pulsing logo outer ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.08, 1],
                opacity: 1,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="landing-loader-logo-ring"
            >
              {/* Inner Logo icon */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="landing-loader-logo-icon"
              >
                R
              </motion.div>
            </motion.div>

            {/* Glowing Spreading Text */}
            <motion.h2
              initial={{ letterSpacing: '0.1em', opacity: 0 }}
              animate={{ letterSpacing: '0.3em', opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="landing-loader-title"
            >
              RESONATOR
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 1] }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="landing-loader-subtitle"
            >
              Initializing Survey Logic Engine...
            </motion.p>

            {/* Progress Bar Track */}
            <div className="landing-loader-progress-track">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
                className="landing-loader-progress-fill"
              />
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="landing-page"
        >
          {/* Scroll Progress Indicator Bar */}
          <motion.div
            className="scroll-progress-bar"
            style={{
              scaleX: scrollYProgress
            }}
          />

          {/* 1. Hero Section */}
          <LandingHero textLineVariants={textLineVariants} />

          {/* 2. How It Works Timeline Section */}
          <LandingTimeline
            sectionVariants={sectionVariants}
            bentoCardVariants={bentoCardVariants}
          />

          {/* 3. Features Bento Grid Section */}
          <LandingBentoFeatures
            sectionVariants={sectionVariants}
            bentoCardVariants={bentoCardVariants}
          />

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
          <LandingFooter />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
