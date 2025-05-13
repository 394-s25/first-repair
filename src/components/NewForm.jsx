import Box from '@mui/material/Box'; // For overall form layout
import React, { useState } from 'react'; // Import useState
import { addConsultationRequest } from '../api/consultationService.js'; // Import your service
import FormTextField from './FormTextField.jsx';
import MultiSelectDropdown from './MultiSelectDropdown.jsx';
import SingleSelectDropdown from './SingleSelectDropdown.jsx';
import SubmitButton from './SubmitButton.jsx';
import Button from '@mui/material/Button';
import LocationAutocomplete from './LocationAutocomplete.jsx';

const Form = () => {
  const initialFormData = {
    name: '',
    organization: '',
    email: '',
    phone: '',
    stage: '', // For SingleSelectDropdown
    otherStageDetail: '', // Added field for 'Other' stage elaboration
    topics: [], // For MultiSelectDropdown, initialize as array
    additionalContext: '',
    location: null, // Changed to null for LocationAutocomplete
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [formStep, setFormStep] = useState(0);
  const [stepError, setStepError] = useState('');
  const [formKey, setFormKey] = useState(0); // Key for resetting LocationAutocomplete

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
      ...(name === 'stage' && value !== 'Other' ? { otherStageDetail: '' } : {})
    }));
  };

  const handleLocationSelect = (selectedLocation) => {
    setFormData(prevState => ({
      ...prevState,
      location: selectedLocation,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name || !formData.email || !formData.stage || formData.topics.length === 0 || !formData.location) {
      setSubmitMessage('Please fill in all required fields: Name, Email, Location, Stage, and at least one Topic.');
      return;
    }

    if (formData.stage === 'Other' && !formData.otherStageDetail.trim()) {
      setSubmitMessage('Please elaborate on the stage of your reparations initiative.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const result = await addConsultationRequest(formData);

      if (result.success) {
        setSubmitMessage("A member of the FirstRepair team will be in touch with you in the next 10 business days.");
        setFormData(initialFormData);
        setFormKey(prevKey => prevKey + 1); // Reset LocationAutocomplete
        setFormStep(3);
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
    if (!formData.location) {
      setStepError('Location is required');
      return false;
    }
    if (!formData.stage) {
      setStepError('Please select a stage of reparations initiative');
      return false;
    }
    if (formData.stage === 'Other' && !formData.otherStageDetail.trim()) {
      setStepError('Please elaborate on the stage of your reparations initiative');
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
            <h2>About You</h2>
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
            <div>
                <LocationAutocomplete
                key={formKey}
                onPlaceSelected={handleLocationSelect}
                />
            </div>
            <SingleSelectDropdown
              label="Stage of Reparations Initiative"
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              options={reparationsStagesOptions}
              required
            />
            {formData.stage === 'Other' && (
              <FormTextField
                label="Please elaborate on the stage of your initiative"
                variant="outlined"
                name="otherStageDetail"
                value={formData.otherStageDetail}
                onChange={handleChange}
                required
                multiline
                rows={2}
              />
            )}
          </section>
        );
      case 2:
        return (
          <section>
            <h2>About your Question</h2>
            <MultiSelectDropdown
              label="I need help with the following topics"
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
              multiline = {true}
              rows={5}
            />
          </section>
        );
      case 3:
        return (
          <section>
            <h2>Thank You!</h2>
            <p>Request submitted successfully!</p>
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
      {formStep < 3 && 
      <p style={{ color: 'gray', marginTop: '10px', fontSize: '16px' }}>
        Step {formStep + 1} of 3
      </p>}

      {renderStepContent()}
      
      {stepError && (
        <p style={{ color: 'red', marginTop: '10px', fontSize: '16px' }}>
          {stepError}
        </p>
      )}
      
      <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
        {formStep > 0 && formStep < 3 && (
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