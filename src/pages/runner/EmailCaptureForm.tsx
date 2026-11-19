import React from 'react';

interface EmailCaptureFormProps {
  emailInput: string;
  setEmailInput: (e: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isRequired: boolean;
}

export const EmailCaptureForm: React.FC<EmailCaptureFormProps> = ({
  emailInput,
  setEmailInput,
  handleSubmit,
  isRequired
}) => {
  return (
    <form onSubmit={handleSubmit} className="runner-email-form">
      <div className="form-group">
        <label className="form-label" htmlFor="email-capture">
          {isRequired ? 'Email address required *' : 'Email address (optional)'}
        </label>
        <p className="runner-email-hint">
          {isRequired
            ? 'We need your email to send the scheduled follow-up survey link.'
            : 'Optionally provide your email for follow-up correlation.'}
        </p>
        <input
          id="email-capture"
          className="form-input"
          type="email"
          placeholder="you@example.com"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          required={isRequired}
        />
      </div>
      <button type="submit" className="btn btn-primary runner-submit-btn">
        {isRequired ? 'Submit Answers & Schedule Follow-ups' : 'Complete Survey'}
      </button>
    </form>
  );
};
