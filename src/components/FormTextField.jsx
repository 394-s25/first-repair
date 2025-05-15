import TextField from '@mui/material/TextField';

const FormTextField = ({
  label,
  placeholder,
  variant,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  multiline = false,
  rows = 1,
  sx = {},
}) => {
  return (
    <TextField
      id={`outlined-${name}`}
      placeholder={placeholder}
      label={label}
      variant={variant}
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      required={required}
      multiline={multiline}
      rows={rows}
      fullWidth
      InputProps={{
        sx: {
          '& .MuiInputBase-input::placeholder': {
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            overflow: 'visible',
            lineHeight: 1.5,
          }
        }
      }}
      sx={sx}
    />
  );
}

export default FormTextField;