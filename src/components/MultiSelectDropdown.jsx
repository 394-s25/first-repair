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

function getStyles(name, selectedValues, theme) {
  return {
    fontWeight: selectedValues.indexOf(name) === -1
      ? theme.typography.fontWeightRegular
      : theme.typography.fontWeightMedium,
  };
}

const MultiSelectDropdown = ({
  label,
  name,
  value, // This will be an array
  onChange,
  options,
  required = false,
  sx = {},
}) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleChange = (event) => {
    const {
      target: { value: selected },
    } = event;
    const newValue = typeof selected === 'string' ? selected.split(',') : selected;

    if (newValue.length <= 3) {
      onChange(event);
      if (newValue.length === 3) {
        setOpen(false); // Automatically close the dropdown when 3 items are selected
      }
    } else {
      alert('You can only select up to 3 topics.');
    }
  };

  return (
    <div>
      <FormControl sx={{ width: 300, ...sx }} required={required}>
        <InputLabel id={`${name}-multiple-chip-label`}>{label}</InputLabel>
        <Select
          labelId={`${name}-multiple-chip-label`}
          id={`${name}-multiple-chip`}
          multiple
          sx={sx}
          name={name}
          value={value}
          onChange={handleChange}
          input={<OutlinedInput id={`select-${name}-multiple-chip`} label={label} />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((itemValue) => (
                <Chip key={itemValue} label={itemValue} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
        >
          {options.map((optionName) => (
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
};

export default MultiSelectDropdown;