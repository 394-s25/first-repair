import * as React from 'react';
import MultiSelectDropdown from './MultiSelectDropdown.jsx'
import FormTextField from './FormTextField.jsx'
import SubmitButton from './SubmitButton.jsx';
import SingleSelectDropdown from './SingleSelectDropdown.jsx';



const Form = () => {

  const reparationsStages = [
    "Planning",
    "In Progress",
    "Implemented",
    "Completed",
    "Paused"
  ];

  const infoCategories = [
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

  

  return (
    <div>
      <p style={{ text: "black" }}> First Repair</p>
      <FormTextField label="Name" variant="outlined"/>
      <FormTextField label="Organization" variant="outlined"/>
      <FormTextField label="Email" variant="outlined"/>
      <FormTextField label="Phone Number" variant="outlined"/>
      <SingleSelectDropdown/>
      <MultiSelectDropdown/>
      <FormTextField label="Additional Information" variant="standard"/>
      <SubmitButton/>
    </div>
  );
}

export default Form;
