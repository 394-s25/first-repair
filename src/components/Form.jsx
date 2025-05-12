import Box from '@mui/material/Box';
import React, { useState } from 'react';
import { addConsultationRequest } from '../api/consultationService.js';
import FormTextField from './FormTextField.jsx';
import LocationAutocomplete from './LocationAutocomplete.jsx'; // Import the new component
import MultiSelectDropdown from './MultiSelectDropdown.jsx';
import SingleSelectDropdown from './SingleSelectDropdown.jsx';
import SubmitButton from './SubmitButton.jsx';

const Form = () => {
  const initialFormData = {
    name: '',
    organization: '',
    email: '',
    phone: '',
    stage: '',
    otherStageDetail: '', // Added field for 'Other' stage elaboration
    topics: [],
    additionalContext: '',
    location: null, // Add new field for location data
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
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
      location: selectedLocation, // This will be the structured location data object
    }));
    // You can log to see the detailed object:
    // console.log("Selected Location:", selectedLocation);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Add validation for location if it's required
    if (!formData.name || !formData.email || !formData.stage || formData.topics.length === 0  || !formData.location ) {
      setSubmitMessage('Please fill in all required fields: Name, Email, Location, Stage, Topics' /* and Location if required */);

      return;
    }

    if (formData.stage === 'Other' && !formData.otherStageDetail.trim()) {
      setSubmitMessage('Please elaborate on the stage of your reparations initiative.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // formData.location will contain the structured location data
      // (address, placeId, coordinates, city, state, country, zipCode)
      // This will be saved to Firestore as an object.
      const result = await addConsultationRequest(formData);

      if (result.success) {
        setSubmitMessage(`Request submitted successfully! Request ID: ${result.id}`);
        setFormData(initialFormData); // Reset form
        setFormKey(prevKey => prevKey + 1); // Change key to reset LocationAutocomplete
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
      <p style={{ color: "black", fontSize: "1.5em", fontWeight: "bold" }}>
        FirstRepair Consultation Request
      </p>

      <FormTextField
        label="Name"
        variant="outlined"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      {/* ... other FormTextFields for organization, email, phone ... */}
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
      
      {/* Location Autocomplete Field */}
      {/* <label htmlFor="location-autocomplete" style={{ alignSelf: 'flex-start', marginLeft: '8px', marginBottom: '-8px', fontSize: '0.9rem', color: 'rgba(0, 0, 0, 0.6)' }}>
        Location (City/Address):
      </label> */}
      <LocationAutocomplete
        key={formKey} // Used to reset the component when the form resets
        onPlaceSelected={handleLocationSelect}
      />

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
      <SubmitButton disabled={isSubmitting} />
      {submitMessage && (
        <p style={{ color: submitMessage.startsWith('Error:') ? 'red' : 'green', marginTop: '10px' }}>
          {submitMessage}
        </p>
      )}
    </Box>
  );
};

export default Form;
