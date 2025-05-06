import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const options = ['Planning', 'In Progress', 'Implemented', 'Completed', 'Paused'];

const SingleSelectDropdown = () => {
  const [selected, setSelected] = React.useState('');

  const handleChange = (event) => {
    setSelected(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="single-select-label">Stage</InputLabel>
        <Select
          labelId="single-select-label"
          id="single-select"
          value={selected}
          label="Stage"
          onChange={handleChange}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default SingleSelectDropdown;
