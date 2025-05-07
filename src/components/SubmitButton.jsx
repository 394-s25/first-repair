import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import * as React from 'react';

const SubmitButton = ({ disabled }) => { // Add disabled prop
  return (
    <Stack spacing={2} direction="row" sx={{ m: 1, justifyContent: 'center' }}> {/* Added margin and centering */}
      <Button type="submit" variant="contained" disabled={disabled}> {/* Set type to submit and pass disabled */}
        {disabled ? "Submitting..." : "Submit"}
      </Button>
    </Stack>
  );
}

export default SubmitButton;