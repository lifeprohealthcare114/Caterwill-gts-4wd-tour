import React from 'react';
import './Support.css';

const Support = () => {
  return (
    <div className="support-page">
      <h1 className="page-title">Support Center</h1>
      
      <div className="faq-section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        
        <div className="faq-item">
          <h3 className="faq-question">How do I charge the wheelchair?</h3>
          <p className="faq-answer">
            Use the provided charger with a standard 220V outlet. Full charge takes 6-8 hours.
          </p>
        </div>
        
        <div className="faq-item">
          <h3 className="faq-question">What maintenance is required?</h3>
          <p className="faq-answer">
            Regular cleaning and professional servicing every 6 months is recommended.
          </p>
        </div>
      </div>
      
      <div className="contact-section">
        <h2 className="section-title">Contact Us</h2>
        <ul className="contact-list">
          <li>Email: info@lifeprohealthcare.com</li>
          <li>Address: Vadodara – 390001, Gujarat, INDIA</li>
        </ul>
      </div>
    </div>
  );
};

export default Support;