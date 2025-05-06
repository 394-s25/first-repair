import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

const SubmitButton = () => {
  return (
    <Stack spacing={2} direction="row">
      <Button variant="contained">Submit</Button>
    </Stack>
  );
}

export default SubmitButton;
