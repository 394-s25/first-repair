import Box from '@mui/material/Box';
import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { addConsultationRequest } from '../api/consultationService.js';
import FormTextField from './FormTextField.jsx';
import MultiSelectDropdown from './MultiSelectDropdown.jsx';
import SingleSelectDropdown from './SingleSelectDropdown.jsx';
import SubmitButton from './SubmitButton.jsx';
import LocationAutocomplete from './LocationAutocomplete.jsx';

const Form = () => {
  const initialFormData = {
    name: '',
    organization: '',
    email: '',
    phone: '',
    stage: '',
    otherStageDetail: '',
    topics: [],
    additionalContext: '',
    location: null,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [formStep, setFormStep] = useState(0);
  const [stepError, setStepError] = useState('');
  const [formKey, setFormKey] = useState(0);

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
        setFormKey(prevKey => prevKey + 1);
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
    if (isValid) setFormStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStepError('');
    setFormStep(prev => prev - 1);
  };

  const renderStepContent = () => {
    switch (formStep) {
      case 0:
        return (
          <Box>
            <Typography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>Step 1/4</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Welcome to FirstRepair Consulting Request Form</Typography>
            <Typography variant="body2" color="text.secondary">This form will help us understand your needs better</Typography>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>Step 2/4</Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '2rem' }}>About You</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Please fill out the following information to help us understand your needs better.</Typography>

            <FormTextField label="Name" variant="outlined" name="name" value={formData.name} onChange={handleChange} required sx={{ borderRadius: 2, backgroundColor: '#f8f9fa' }} />
            <FormTextField label="Organization" variant="outlined" name="organization" value={formData.organization} onChange={handleChange} sx={{ borderRadius: 2, backgroundColor: '#f8f9fa' }} />
            <FormTextField label="Email" variant="outlined" name="email" type="email" value={formData.email} onChange={handleChange} required sx={{ borderRadius: 2, backgroundColor: '#f8f9fa' }} />
            <FormTextField label="Phone Number" variant="outlined" name="phone" type="tel" value={formData.phone} onChange={handleChange} sx={{ borderRadius: 2, backgroundColor: '#f8f9fa' }} />
            <LocationAutocomplete key={formKey} onPlaceSelected={handleLocationSelect} />
            <SingleSelectDropdown label="Stage of Reparations Initiative" name="stage" value={formData.stage} onChange={handleChange} options={reparationsStagesOptions} required />
            {formData.stage === 'Other' && (
              <FormTextField label="Please elaborate on the stage of your initiative" variant="outlined" name="otherStageDetail" value={formData.otherStageDetail} onChange={handleChange} required multiline rows={2} />
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>Step 3/4</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>About your Question</Typography>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: '100%' }}>
                <MultiSelectDropdown 
                  label="I need help with the following topics" 
                  name="topics" 
                  value={formData.topics} 
                  onChange={handleChange} 
                  options={consultationTopicsOptions} 
                  required 
                  sx={{ 
                    width: '100%',
                  }} 
                />
              </Box>
              <Box sx={{ width: '100%' }}>
              <FormTextField 
                label="Additional Context (2-3 sentences)" 
                variant="outlined" 
                name="additionalContext" 
                value={formData.additionalContext} 
                onChange={handleChange} 
                multiline 
                rows={6}
                sx={{ 
                  width: '100%', 
                  '& .MuiOutlinedInput-root': {
                    minHeight: '150px',
                    textAlign: 'left',
                    width: '100%', 
                  }
                
                }}
              />
              </Box>
            </Box>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Thank You!</Typography>
            <Typography variant="body1">Request submitted successfully!</Typography>
            {submitMessage && (
              <Typography color={submitMessage.startsWith('Error:') ? 'error' : 'success.main'} sx={{ mt: 2 }}>{submitMessage}</Typography>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <img 
          src="../public/firstrepair-logo.png" 
          alt="FirstRepair Logo"
          style={{
            maxWidth: '400px',
            height: 'auto'
          }}
        />
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 2, 
        padding: 4, 
        borderRadius: '12px', 
        boxShadow: 3, 
        maxWidth: '600px', 
        margin: '40px auto', 
        backgroundColor: 'white',
        width: '100%'
      }}>
        {formStep < 3 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2, width: '100%' }}>
            {[0, 1, 2, 3].map((_, idx) => (
              <Box key={idx} sx={{ width: 40, height: 4, borderRadius: 2, backgroundColor: formStep >= idx ? 'success.main' : '#e0e0e0', transition: 'background-color 0.3s ease' }} />
            ))}
          </Box>
        )}

        <Box sx={{ width: '100%', maxWidth: '500px' }}>
          {renderStepContent()}
        </Box>

        {stepError && <Typography color="error" sx={{ mt: 2 }}>{stepError}</Typography>}

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          {formStep > 0 && formStep < 3 && (
            <Button variant="outlined" onClick={prevStep} disabled={isSubmitting} sx={{ borderRadius: 5 }}>Previous</Button>
          )}
          {formStep < 2 && (
            <Button variant="contained" onClick={nextStep} disabled={isSubmitting} color="success" sx={{ borderRadius: 5, px: 4, fontWeight: 'bold', textTransform: 'none' }}>Next Step</Button>
          )}
          {formStep === 2 && <SubmitButton disabled={isSubmitting} />}
        </Box>
      </Box>
    </Box>
  );
};

export default Form;
