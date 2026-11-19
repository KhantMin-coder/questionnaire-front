import React from 'react';
import { motion, type Variants } from 'framer-motion';

interface LandingTimelineProps {
  sectionVariants: Variants;
  bentoCardVariants: Variants;
}

export const LandingTimeline: React.FC<LandingTimelineProps> = ({
  sectionVariants,
  bentoCardVariants
}) => {
  return (
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
  );
};
