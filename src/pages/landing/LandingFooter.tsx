import React from 'react';

export const LandingFooter: React.FC = () => {
  return (
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
  );
};
