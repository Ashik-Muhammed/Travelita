import React from 'react';
import './Terms.css';

function Terms() {
  return (
    <div className="terms-page">
      <div className="terms-hero">
        <div className="container">
          <h1>Terms & Conditions</h1>
          <p className="subtitle">Please read these terms carefully before using our services</p>
        </div>
      </div>

      <div className="container">
        <div className="terms-content">
          <section className="terms-section">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using our website and services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section className="terms-section">
            <h2>2. Booking and Reservations</h2>
            <p>All bookings are subject to availability and confirmation. We reserve the right to refuse any booking at our discretion. Bookings are not confirmed until you receive a confirmation email from us.</p>
            <ul>
              <li>All prices are subject to change without notice</li>
              <li>Special requests are subject to availability</li>
              <li>Group bookings may have different terms and conditions</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>3. Payment Terms</h2>
            <p>Payment terms vary depending on the type of booking and the time until departure. Generally:</p>
            <ul>
              <li>A deposit is required to secure your booking</li>
              <li>Full payment is due 30 days before departure</li>
              <li>Late payments may result in cancellation of your booking</li>
              <li>All prices are in the currency specified at the time of booking</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>4. Cancellation Policy</h2>
            <p>Our cancellation policy is as follows:</p>
            <ul>
              <li>Cancellations made 30+ days before departure: Full refund minus processing fees</li>
              <li>Cancellations made 15-29 days before departure: 50% refund</li>
              <li>Cancellations made less than 15 days before departure: No refund</li>
              <li>Some packages may have different cancellation terms</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>5. Travel Insurance</h2>
            <p>We strongly recommend purchasing comprehensive travel insurance to cover:</p>
            <ul>
              <li>Trip cancellation and interruption</li>
              <li>Medical expenses and emergency evacuation</li>
              <li>Lost or delayed baggage</li>
              <li>Other travel-related incidents</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>6. Changes to Itinerary</h2>
            <p>We reserve the right to modify itineraries due to:</p>
            <ul>
              <li>Weather conditions</li>
              <li>Safety concerns</li>
              <li>Force majeure events</li>
              <li>Other circumstances beyond our control</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>7. Customer Responsibilities</h2>
            <p>Customers are responsible for:</p>
            <ul>
              <li>Providing accurate personal information</li>
              <li>Obtaining necessary travel documents</li>
              <li>Following local laws and customs</li>
              <li>Maintaining appropriate behavior during the tour</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>8. Limitation of Liability</h2>
            <p>Our liability is limited to the cost of the tour package. We are not liable for:</p>
            <ul>
              <li>Personal injury or death</li>
              <li>Loss or damage to personal belongings</li>
              <li>Delays or cancellations due to force majeure</li>
              <li>Acts of third parties</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>9. Privacy Policy</h2>
            <p>We collect and process personal information in accordance with our Privacy Policy. By using our services, you consent to such processing.</p>
          </section>

          <section className="terms-section">
            <h2>10. Governing Law</h2>
            <p>These terms are governed by the laws of [Your Country/State]. Any disputes shall be subject to the exclusive jurisdiction of the courts in [Your City].</p>
          </section>

          <div className="terms-footer">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>For any questions regarding these terms, please contact us.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Terms; 