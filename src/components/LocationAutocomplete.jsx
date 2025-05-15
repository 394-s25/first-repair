import React from 'react';
import GooglePlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete';
// Optional: If you want to use MUI theme for consistent styling
// import { useTheme } from '@mui/material/styles';

const LocationAutocomplete = ({ onPlaceSelected }) => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  // const theme = useTheme(); // Optional: For MUI theme access

  if (!googleMapsApiKey) {
    console.error("Google Maps API Key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.");
    return (
      <div style={{ color: 'red', padding: '10px', border: '1px solid red', margin: '8px 0' }}>
        Location search is unavailable: API key missing.
      </div>
    );
  }

  const handleSelect = async (place) => {
    if (onPlaceSelected && place && place.value) {
      try {
        const results = await geocodeByAddress(place.label);
        const latLng = await getLatLng(results[0]);
        
        const addressComponents = results[0].address_components;
        const getAddressComponent = (type) => {
          const component = addressComponents.find(c => c.types.includes(type));
          return component ? component.long_name : '';
        };

        const selectedLocationData = {
          address: place.label,
          placeId: place.value.place_id,
          coordinates: latLng,
          city: getAddressComponent('locality') || getAddressComponent('sublocality_level_1'),
          state: getAddressComponent('administrative_area_level_1'),
          country: getAddressComponent('country'),
          zipCode: getAddressComponent('postal_code'),
        };
        onPlaceSelected(selectedLocationData);
      } catch (error) {
        console.error("Error processing place selection:", error);
        onPlaceSelected({ address: place.label, placeId: place.value?.place_id });
      }
    } else {
      onPlaceSelected(null);
    }
  };

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '56px', // Approximate MUI TextField height for variant="outlined"
      padding: '0 8px', // Adjust padding to align text better
      borderColor: state.isFocused ? 'rgba(0, 0, 0, 0.87)' : 'rgba(0, 0, 0, 0.23)', // Mimic MUI border
      boxShadow: state.isFocused ? '0 0 0 1px rgba(0, 0, 0, 0.87)' : null, // Mimic MUI focus ring (simplified)
      '&:hover': {
        borderColor: 'rgba(0, 0, 0, 0.87)',
      },
      borderRadius: '4px', // MUI default border radius
      fontSize: '1rem', // MUI default font size
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // MUI default font family
      // Ensure the input field itself is left-aligned if it wasn't by default
      textAlign: 'left',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '2px 0px', // Adjust to vertically center text if needed
    }),
    input: (provided) => ({
      ...provided,
      paddingLeft: '0px', // Ensure text starts from the left
      marginLeft: '0px',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1rem',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'rgba(0, 0, 0, 0.54)', // MUI placeholder color
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1rem',
      marginLeft: '2px', // Align with input text
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'rgba(0, 0, 0, 0.87)', // MUI input text color
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1rem',
      marginLeft: '2px',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'white', // Make dropdown menu background opaque white
      // backgroundColor: theme.palette.background.paper, // Optional: Use MUI theme
      zIndex: 2, // Ensure menu is above other elements if needed
      border: '1px solid rgba(0, 0, 0, 0.23)',
      borderRadius: '4px',
      boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)', // MUI Paper elevation 8
    }),
    option: (provided, state) => ({
      ...provided,
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1rem',
      backgroundColor: state.isSelected ? 'rgba(25, 118, 210, 0.08)' : state.isFocused ? 'rgba(0, 0, 0, 0.04)' : 'white', // Mimic MUI selection/hover
      color: state.isSelected ? '#1976d2' : 'rgba(0, 0, 0, 0.87)',
      '&:active': { // Mimic MUI active state
        backgroundColor: 'rgba(25, 118, 210, 0.12)',
      },
    }),
    // Add other parts you want to style: dropdownIndicator, clearIndicator, etc.
  };

  return (
    // The div wrapper helps control the overall width and alignment within the form
    // Your Form.jsx has alignItems: 'center' and this div has maxWidth: '25ch',
    // which should center it and give it a similar width to other fields.
    // If you want it to be strictly left-aligned within a wider column,
    // the parent form's alignItems might need to be 'stretch' or this div's styling adjusted.
    <div style={{ width: '100%', margin: '8px 0' }}>
      <GooglePlacesAutocomplete
        apiKey={googleMapsApiKey}
        selectProps={{
          onChange: handleSelect,
          placeholder: 'Location *', // Changed from "Type location..."
          isClearable: true,
          styles: customSelectStyles, // Apply custom styles here
          // To make it look more like an MUI TextField, you might need to adjust the 'inputId'
          // or other props if you were trying to link it with an external MUI Label.
          // For now, the placeholder acts as the label.
        }}
        autocompletionRequest={{
          componentRestrictions: { country: 'us' }
        }}
        debounce={300}
      />
    </div>
  );
};

export default LocationAutocomplete;