import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import * as React from 'react';

const FormTextField = ({
  label,
  variant,
  name, // Add name prop
  value, // Add value prop
  onChange, // Add onChange prop
  type = "text", // Add type prop, default to text
  required = false // Add required prop
}) => {
  return (
    <Box
      // component="form" // Remove this, the parent Form.jsx will be the form
      sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
      noValidate
      autoComplete="off"
    >
      <TextField
        id={`outlined-${name}`} // Use name for a unique id
        label={label}
        variant={variant}
        name={name} // Pass name to TextField
        value={value} // Pass value
        onChange={onChange} // Pass onChange
        type={type} // Pass type
        required={required} // Pass required
        fullWidth // Make text fields take full width of their container
      />
    </Box>
  );
}

export default FormTextField;