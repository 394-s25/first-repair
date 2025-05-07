// /src/components/MultiSelectDropdown.jsx
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// const categories = [ ... ]; // Moved to Form.jsx


function getStyles(name, personName, theme) {
  return {
    fontWeight: personName.indexOf(name) === -1 // Corrected condition
      ? theme.typography.fontWeightRegular
      : theme.typography.fontWeightMedium,
  };
}

const MultiSelectDropdown = ({
  label,
  name,
  value, // This will be an array
  onChange,
  options, // Add options prop (renamed from categories for consistency)
  required = false
}) => {
  const theme = useTheme();
  // const [personName, setPersonName] = React.useState([]); // State managed by parent

  // const handleChange = (event) => { // onChange passed from parent
  //   const {
  //     target: { value },
  //   } = event;
  //   setPersonName(
  //     typeof value === 'string' ? value.split(',') : value,
  //   );
  // };

  return (
    <div>
      <FormControl sx={{ m: 1, width: 300 }} required={required}> {/* Consistent margin */}
        <InputLabel id={`${name}-multiple-chip-label`}>{label}</InputLabel>
        <Select
          labelId={`${name}-multiple-chip-label`}
          id={`${name}-multiple-chip`}
          multiple
          name={name} // Add name prop
          value={value} // Use value prop
          onChange={onChange} // Use onChange prop
          input={<OutlinedInput id={`select-${name}-multiple-chip`} label={label} />} // Pass label to OutlinedInput
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((itemValue) => ( // Renamed to itemValue to avoid conflict
                <Chip key={itemValue} label={itemValue} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {options.map((optionName) => ( // Renamed to optionName
            <MenuItem
              key={optionName}
              value={optionName}
              style={getStyles(optionName, value, theme)}
            >
              {optionName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default MultiSelectDropdown;