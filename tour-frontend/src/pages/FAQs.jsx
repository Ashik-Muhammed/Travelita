import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FAQs.css';

function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFaqs, setFilteredFaqs] = useState([]);

  const faqs = [
    {
      question: "How do I book a tour package?",
      answer: "Booking a tour package is easy! Simply browse our available packages, select your preferred dates, and click the 'Book Now' button. Follow the booking process, provide the required information, and complete the payment. You'll receive a confirmation email with all the details of your booking."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including credit/debit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our encrypted payment system."
    },
    {
      question: "Can I cancel or modify my booking?",
      answer: "Yes, you can cancel or modify your booking. Please refer to our cancellation policy for specific details. Generally, cancellations made 30 days before the tour date are eligible for a full refund, while cancellations made closer to the tour date may be subject to partial refunds or fees."
    },
    {
      question: "What is included in the tour package price?",
      answer: "Our tour packages typically include accommodation, transportation between destinations, guided tours, some meals, and entrance fees to attractions. Each package's specific inclusions are listed in the package details. Additional expenses like personal shopping, optional activities, and some meals may not be included."
    },
    {
      question: "Do I need travel insurance?",
      answer: "While not mandatory, we strongly recommend purchasing travel insurance. It provides coverage for unexpected events such as trip cancellations, medical emergencies, lost luggage, and other travel-related issues. We can help you arrange travel insurance during the booking process."
    },
    {
      question: "What should I pack for my trip?",
      answer: "Packing requirements vary depending on your destination and the time of year. We provide a detailed packing list in your booking confirmation. Generally, we recommend packing comfortable clothing, appropriate footwear, essential toiletries, necessary medications, and any specific items required for your chosen activities."
    },
    {
      question: "Are the tours suitable for children?",
      answer: "Many of our tours are family-friendly and suitable for children. However, some tours may have age restrictions or may not be suitable for very young children. Please check the specific tour details or contact us for recommendations based on your children's ages."
    },
    {
      question: "What happens if there's bad weather?",
      answer: "In case of bad weather, we have contingency plans to ensure your safety and comfort. We may modify the itinerary, reschedule activities, or provide alternative indoor options. Our team monitors weather conditions and will communicate any changes to you in advance."
    },
    {
      question: "How do I get to the starting point of the tour?",
      answer: "Tour starting points and meeting locations are clearly specified in your booking confirmation. We provide detailed directions and transportation options. For some tours, we offer pickup services from designated locations, while others may require you to meet at a specific point."
    },
    {
      question: "What if I have special dietary requirements?",
      answer: "We accommodate various dietary requirements including vegetarian, vegan, gluten-free, and other special diets. Please inform us of your dietary needs during the booking process, and we'll ensure your requirements are met throughout the tour."
    }
  ];

  useEffect(() => {
    // Filter FAQs based on search term
    if (searchTerm.trim() === '') {
      setFilteredFaqs(faqs);
    } else {
      const filtered = faqs.filter(
        faq => 
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFaqs(filtered);
    }
  }, [searchTerm]);

  // Initialize filtered FAQs with all FAQs
  useEffect(() => {
    setFilteredFaqs(faqs);
  }, []);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="faqs-page">
      <div className="faqs-hero">
        <div className="container">
          <h1>Frequently Asked Questions</h1>
          <p className="subtitle">Find answers to common questions about our tour packages and services</p>
        </div>
      </div>
      
      <div className="container">
        <div className="faqs-search-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
        </div>

        <div className="faqs-container">
          {filteredFaqs.length === 0 ? (
            <div className="no-results">
              <svg className="no-results-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <h3>No matching FAQs found</h3>
              <p>Try different keywords or browse all our FAQs below</p>
              <button className="reset-search" onClick={() => setSearchTerm('')}>Show All FAQs</button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${openIndex === index ? 'open' : ''}`}
              >
                <button 
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={openIndex === index}
                >
                  <span>{faq.question}</span>
                  <svg 
                    className="faq-icon" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </button>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="faqs-contact">
          <h2>Still have questions?</h2>
          <p>Can't find the answer you're looking for? Please chat with our friendly team.</p>
          <Link to="/contact" className="contact-button">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}

export default FAQs;