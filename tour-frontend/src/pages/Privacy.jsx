import React from 'react';
import './Privacy.css';

function Privacy() {
  return (
    <div className="privacy-page">
      <div className="privacy-hero">
        <div className="container">
          <h1>Privacy Policy</h1>
          <p className="subtitle">How we collect, use, and protect your personal information</p>
        </div>
      </div>

      <div className="container">
        <div className="privacy-content">
          <section className="privacy-section">
            <h2>1. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Name and contact information</li>
              <li>Payment and billing information</li>
              <li>Travel preferences and requirements</li>
              <li>Passport and identification details</li>
              <li>Communication preferences</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information for:</p>
            <ul>
              <li>Processing your bookings and payments</li>
              <li>Providing customer support</li>
              <li>Sending booking confirmations and updates</li>
              <li>Improving our services</li>
              <li>Marketing communications (with your consent)</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>3. Information Sharing</h2>
            <p>We may share your information with:</p>
            <ul>
              <li>Travel service providers (hotels, airlines, etc.)</li>
              <li>Payment processors</li>
              <li>Legal authorities when required by law</li>
              <li>Third-party service providers who assist our operations</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>4. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information, including:</p>
            <ul>
              <li>Encryption of sensitive data</li>
              <li>Secure servers and networks</li>
              <li>Regular security assessments</li>
              <li>Limited access to personal information</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>5. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Remember your preferences</li>
              <li>Analyze website usage</li>
              <li>Improve user experience</li>
              <li>Provide personalized content</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>7. Data Retention</h2>
            <p>We retain your personal information for as long as necessary to:</p>
            <ul>
              <li>Fulfill the purposes outlined in this policy</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes</li>
              <li>Enforce our agreements</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>8. International Data Transfers</h2>
            <p>Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.</p>
          </section>

          <section className="privacy-section">
            <h2>9. Children's Privacy</h2>
            <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
          </section>

          <section className="privacy-section">
            <h2>10. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.</p>
          </section>

          <div className="privacy-footer">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>If you have any questions about this Privacy Policy, please contact us.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Privacy; 