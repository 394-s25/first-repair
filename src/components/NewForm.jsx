import Box from '@mui/material/Box'; // For overall form layout
import React, { useState } from 'react'; // Import useState
import { addConsultationRequest } from '../api/consultationService.js'; // Import your service
import FormTextField from './FormTextField.jsx';
import MultiSelectDropdown from './MultiSelectDropdown.jsx';
import SingleSelectDropdown from './SingleSelectDropdown.jsx';
import SubmitButton from './SubmitButton.jsx';
import Button from '@mui/material/Button';

const Form = () => {
  const initialFormData = {
    name: '',
    organization: '',
    email: '',
    phone: '',
    location: '',
    stage: '', // For SingleSelectDropdown
    topics: [], // For MultiSelectDropdown, initialize as array
    additionalContext: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [formStep, setFormStep] = useState(0);

  const reparationsStagesOptions = [
    "Just getting started / Exploring",
    "Building community support",
    "Researching harm and forms of repair",
    "Developing proposals / advocacy",
    "Implementing initiatives",
    "Other"
  ];

  const consultationTopicsOptions = [
    'Communications',
    'Community Engagement',
    'Reparations Education',
    'Legislative Strategy',
    'Reparations Forms',
    'Harm Report Consultation',
    'Legal Strategy',
    'Funding Repair',
    'Leadership Coaching',
    'General / Just Getting Started',
    'How to be an Ally (Including Interfaith and Other Justice Movement Communities)',
    'Movement and Well-being',
    'Fundraising (The Work)',
    'Arts and Culture',
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    if (!formData.name || !formData.email || !formData.stage || formData.topics.length === 0) {
      setSubmitMessage('Please fill in all required fields: Name, Email, Stage, and at least one Topic.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const result = await addConsultationRequest(formData);

      if (result.success) {
        setSubmitMessage(`Request submitted successfully! Request ID: ${result.id}`);
        setFormData(initialFormData); // Reset form
        setFormStep(3); // Move to confirmation step
      } else {
        setSubmitMessage(`Error: ${result.error?.message || 'Failed to submit request.'}`);
      }
    } catch (error) {
      setSubmitMessage(`Error: ${error.message || 'An unexpected error occurred.'}`);
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setFormStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => {
    setFormStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = () => {
    switch (formStep) {
      case 0:
        return (
          <section>
            <h2>Welcome to FirstRepair Consultation Request</h2>
            <p>Thank you for your interest in our consultation services. This form will help us understand your needs better.</p>
            <p>Please take a moment to fill out the following information. We'll guide you through the process step by step.</p>
          </section>
        );
      case 1:
        return (
          <section>
            <h2>Personal Information</h2>
            <FormTextField
              label="Name"
              variant="outlined"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <FormTextField
              label="Organization"
              variant="outlined"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
            />
            <FormTextField
              label="Email"
              variant="outlined"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <FormTextField
              label="Phone Number"
              variant="outlined"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />
            <FormTextField
              label="Location"
              variant="outlined"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </section>
        );
      case 2:
        return (
          <section>
            <h2>Reparations Information</h2>
            <SingleSelectDropdown
              label="Stage of Reparations Initiative"
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              options={reparationsStagesOptions}
              required
            />
            <MultiSelectDropdown
              label="Topics of Interest"
              name="topics"
              value={formData.topics}
              onChange={handleChange}
              options={consultationTopicsOptions}
              required
            />
            <FormTextField
              label="Additional Context (2-3 sentences)"
              variant="outlined"
              name="additionalContext"
              value={formData.additionalContext}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </section>
        );
      case 3:
        return (
          <section>
            <h2>Thank You!</h2>
            <p>Your consultation request has been submitted successfully.</p>
            {submitMessage && (
              <p style={{ color: submitMessage.startsWith('Error:') ? 'red' : 'green', marginTop: '10px' }}>
                {submitMessage}
              </p>
            )}
          </section>
        );
      default:
        return null;
    }
  };

  return (
    // Use Box for better layout control with MUI components
    <Box
      component="form" // This Box is now the form
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center form items
        gap: 2, // Spacing between items
        padding: 3,
        border: '1px solid #ccc',
        borderRadius: '8px',
        maxWidth: '500px', // Max width for the form
        margin: '20px auto' // Center form on the page
      }}
    >
      {renderStepContent()}
      
      <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
        {formStep > 0 && (
          <Button
            variant="outlined"
            onClick={prevStep}
            disabled={isSubmitting}
          >
            Previous
          </Button>
        )}
        
        {formStep < 2 && (
          <Button
            variant="contained"
            onClick={nextStep}
            disabled={isSubmitting}
          >
            Next
          </Button>
        )}
        
        {formStep === 2 && (
          <SubmitButton disabled={isSubmitting} />
        )}
      </Box>
    </Box>
  );
}

export default Form;