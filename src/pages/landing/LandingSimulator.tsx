import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLandingSimulator } from './useLandingSimulator';
import '../Landing.css';

export const LandingSimulator: React.FC = () => {
  const {
    demoCurrentNode,
    demoAnswers,
    setDemoAnswers,
    demoHistory,
    demoTraversedDelay,
    demoEmail,
    setDemoEmail,
    demoIsSubmitted,
    setDemoIsSubmitted,
    demoError,
    handleDemoNext,
    handleDemoBack,
    handleDemoSubmit,
    resetDemo
  } = useLandingSimulator();

  return (
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
                        className={`landing-phone-option-btn ${
                          isSelected ? 'landing-phone-option-btn--selected' : 'landing-phone-option-btn--unselected'
                        }`}
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
  );
};
