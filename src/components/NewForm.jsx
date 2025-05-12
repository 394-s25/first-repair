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
  const [stepError, setStepError] = useState('');

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

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setStepError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setStepError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStepError('Please enter a valid email address');
      return false;
    }
    setStepError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.stage) {
      setStepError('Please select a stage of reparations initiative');
      return false;
    }
    if (formData.topics.length === 0) {
      setStepError('Please select at least one topic of interest');
      return false;
    }
    setStepError('');
    return true;
  };

  const nextStep = () => {
    let isValid = true;
    
    switch (formStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setFormStep((prevStep) => prevStep + 1);
    }
  };

  const prevStep = () => {
    setStepError('');
    setFormStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = () => {
    switch (formStep) {
      case 0:
        return (
          <section>
            <h2>Welcome to FirstRepair Consulting Request Form</h2>
            <p>This form will help us understand your needs better</p>
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
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: 3,
        border: '1px solid #ccc',
        borderRadius: '8px',
        maxWidth: '500px',
        margin: '20px auto'
      }}
    >
      {renderStepContent()}
      
      {stepError && (
        <p style={{ color: 'red', marginTop: '10px', fontSize: '16px' }}>
          {stepError}
        </p>
      )}
      
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