import React from 'react';
import './Cookies.css';

function Cookies() {
  return (
    <div className="cookies-page">
      <div className="cookies-hero">
        <div className="container">
          <h1>Cookies Policy</h1>
          <p className="subtitle">How we use cookies and similar technologies to enhance your experience</p>
        </div>
      </div>

      <div className="container">
        <div className="cookies-content">
          <section className="cookies-section">
            <h2>What Are Cookies</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
              They help us make your visit to our site better and provide you with a more personalized experience.
            </p>
          </section>

          <section className="cookies-section">
            <h2>Types of Cookies We Use</h2>
            <div className="cookies-grid">
              <div className="cookie-type">
                <h3>Essential Cookies</h3>
                <p>
                  These cookies are necessary for the website to function properly. They enable basic functions like 
                  page navigation and access to secure areas of the website.
                </p>
              </div>
              <div className="cookie-type">
                <h3>Analytics Cookies</h3>
                <p>
                  We use these cookies to understand how visitors interact with our website. They help us improve 
                  our website's performance and user experience.
                </p>
              </div>
              <div className="cookie-type">
                <h3>Functionality Cookies</h3>
                <p>
                  These cookies allow the website to remember choices you make and provide enhanced, more 
                  personal features.
                </p>
              </div>
              <div className="cookie-type">
                <h3>Marketing Cookies</h3>
                <p>
                  These cookies are used to track visitors across websites. The intention is to display ads that 
                  are relevant and engaging for individual users.
                </p>
              </div>
            </div>
          </section>

          <section className="cookies-section">
            <h2>How We Use Cookies</h2>
            <ul className="cookies-list">
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our website</li>
              <li>Improve our website's performance</li>
              <li>Provide personalized content and recommendations</li>
              <li>Analyze website traffic and usage patterns</li>
              <li>Enable social media features</li>
            </ul>
          </section>

          <section className="cookies-section">
            <h2>Third-Party Cookies</h2>
            <p>
              Some cookies are placed by third-party services that appear on our pages. We use trusted third-party 
              services that track this information on our behalf.
            </p>
            <div className="third-party-cookies">
              <div className="third-party-item">
                <h3>Analytics Providers</h3>
                <p>Google Analytics and similar tools to understand website usage</p>
              </div>
              <div className="third-party-item">
                <h3>Advertising Networks</h3>
                <p>To deliver relevant advertisements</p>
              </div>
              <div className="third-party-item">
                <h3>Social Media Platforms</h3>
                <p>To enable social sharing and interaction</p>
              </div>
              <div className="third-party-item">
                <h3>Payment Processors</h3>
                <p>To facilitate secure online payments</p>
              </div>
            </div>
          </section>

          <section className="cookies-section">
            <h2>Managing Cookies</h2>
            <p>
              You can control and/or delete cookies as you wish. You can delete all cookies that are already on 
              your computer and you can set most browsers to prevent them from being placed.
            </p>
            <div className="browser-settings">
              <h3>Browser Settings</h3>
              <p>
                Most web browsers allow you to control cookies through their settings preferences. However, 
                limiting cookies may impact your experience using our website.
              </p>
              <ul>
                <li>Chrome: Settings → Privacy and security → Cookies and other site data</li>
                <li>Firefox: Options → Privacy & Security → Cookies and Site Data</li>
                <li>Safari: Preferences → Privacy → Cookies and website data</li>
                <li>Edge: Settings → Cookies and site permissions → Cookies</li>
              </ul>
            </div>
          </section>

          <section className="cookies-section">
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Cookies Policy from time to time. Any changes will be posted on this page with 
              an updated revision date.
            </p>
          </section>

          <section className="cookies-section">
            <h2>Contact Us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <div className="contact-info">
              <p>Email: privacy@travelita.com</p>
              <p>Phone: +1 (555) 123-4567</p>
            </div>
          </section>

          <div className="last-updated">
            <p>Last updated: March 15, 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cookies; 