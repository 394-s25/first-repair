import Button from '@mui/material/Button';
import * as React from 'react';

const SubmitButton = ({ disabled, sx = {} }) => { // Add sx prop for additional styles
  return (
    <Button
      type="submit"
      variant="contained"
      disabled={disabled}
      color="success"
      sx={{
        borderRadius: 5,
        px: 4, // Match padding with Previous button
        fontWeight: 'bold',
        textTransform: 'none',
        width: '150px', // Explicitly set width to match Previous button
        ...sx, // Allow additional styles to be passed
      }}
    >
      {disabled ? "Submitting..." : "Submit"}
    </Button>
  );
};

export default SubmitButton;