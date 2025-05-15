import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import * as React from 'react';

// const options = ['Planning', 'In Progress', 'Implemented', 'Completed', 'Paused']; // Moved to Form.jsx

const SingleSelectDropdown = ({
  label,
  name,
  value,
  onChange,
  options, // Add options prop
  required = false
}) => {
  // const [selected, setSelected] = React.useState(''); // State will be managed by parent

  // const handleChange = (event) => { // onChange will be passed from parent
  //   setSelected(event.target.value);
  // };

  return (
      <FormControl fullWidth required={required}>
        <InputLabel id={`${name}-single-select-label`}>{label}</InputLabel>
        <Select
          labelId={`${name}-single-select-label`}
          id={`${name}-single-select`}
          name={name} // Add name prop to Select
          value={value}
          label={label} // Keep label prop for Select accessibility
          onChange={onChange}
        >
          <MenuItem value="">
            <em>-- Select {label} --</em>
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
  );
};

export default SingleSelectDropdown;