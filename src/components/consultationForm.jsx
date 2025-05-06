// src/components/consultationForm.jsx

import React, { useState } from 'react';
import { addConsultationRequest } from '../api/consultationService';

const ConsultationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    stage: '',
    topic: '',
    additionalContext: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.topic || !formData.stage) {
      setSubmitMessage('Please fill in all required fields: Name, Email, Stage, and Topic.');
      return;
    }
    setIsSubmitting(true);
    setSubmitMessage('');

    // Ensure addConsultationRequest is correctly imported and points to your client-side Firebase interaction logic
    const result = await addConsultationRequest(formData);

    setIsSubmitting(false);
    if (result.success) {
      setSubmitMessage(`Request submitted successfully! Your request ID is ${result.id}. We will be in touch.`);
      // Reset form
      setFormData({
        name: '',
        organization: '',
        email: '',
        phone: '',
        stage: '',
        topic: '',
        additionalContext: '',
      });
    } else {
      setSubmitMessage(`There was an error submitting your request: ${result.error?.message || 'Please try again.'}`);
      console.error("Submission error:", result.error);
    }
  };

  const consultationTopics = [
    "Communications",
    "Community Engagement",
    "Reparations Education",
    "Legislative Strategy",
    "Reparations Forms",
    "Harm Report Consultation",
    "Legal Strategy",
    "Funding Repair",
    "Leadership Coaching",
    "General / just getting started",
    "How to be an Ally (including Interfaith and other justice movement communities)",
    "Movement and Well Being",
    "Fundraising (The Work)",
    "Arts and Culture"
  ];

  const stagesOfReparations = [
    "Just getting started / Exploring",
    "Building community support",
    "Researching harm and forms of repair",
    "Developing proposals / advocacy",
    "Implementing initiatives",
    "Other"
  ];

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Request a Consultation Session</h2>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="name">Name: *</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="organization">Organization:</label>
        <input type="text" id="organization" name="organization" value={formData.organization} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="email">Email: *</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="phone">Phone Number:</label>
        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="stage">Stage of reparations initiative: *</label>
        <select id="stage" name="stage" value={formData.stage} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
          <option value="">-- Select Stage --</option>
          {stagesOfReparations.map(stage => <option key={stage} value={stage}>{stage}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="topic">I'd like to discuss / I'm looking for assistance with: *</label>
        <select id="topic" name="topic" value={formData.topic} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
          <option value="">-- Select Topic --</option>
          {consultationTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="additionalContext">Additional context (2-3 sentences):</label>
        <textarea id="additionalContext" name="additionalContext" value={formData.additionalContext} onChange={handleChange} rows="3" maxLength="300" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
      </div>

      <button type="submit" disabled={isSubmitting} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        {isSubmitting ? 'Submitting...' : 'Submit Request'}
      </button>

      {submitMessage && <p style={{ marginTop: '15px', color: submitMessage.startsWith('There was an error') ? 'red' : 'green' }}>{submitMessage}</p>}
    </form>
  );
};

export default ConsultationForm;