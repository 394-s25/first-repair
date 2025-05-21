import GooglePlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete';

const LocationAutocomplete = ({ value, onPlaceSelected }) => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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
      minHeight: '56px',
      padding: '0 8px',
      borderColor: state.isFocused ? 'rgba(0, 0, 0, 0.87)' : 'rgba(0, 0, 0, 0.23)',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(0, 0, 0, 0.87)' : null,
      '&:hover': {
        borderColor: 'rgba(0, 0, 0, 0.87)',
      },
      borderRadius: '4px',
      fontSize: '1rem',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      textAlign: 'left',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '2px 0px',
    }),
    input: (provided) => ({
      ...provided,
      paddingLeft: '0px',
      marginLeft: '0px',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1rem',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'rgba(0, 0, 0, 0.54)',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1rem',
      marginLeft: '2px',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'rgba(0, 0, 0, 0.87)',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1rem',
      marginLeft: '2px',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'white',
      zIndex: 2,
      border: '1px solid rgba(0, 0, 0, 0.23)',
      borderRadius: '4px',
      boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
    }),
    option: (provided, state) => ({
      ...provided,
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: '1rem',
      backgroundColor: state.isSelected ? 'rgba(25, 118, 210, 0.08)' : state.isFocused ? 'rgba(0, 0, 0, 0.04)' : 'white',
      color: state.isSelected ? '#1976d2' : 'rgba(0, 0, 0, 0.87)',
      '&:active': {
        backgroundColor: 'rgba(25, 118, 210, 0.12)',
      },
    }),
  };

  return (
    <div style={{ width: '100%', margin: '8px 0' }}>
      <GooglePlacesAutocomplete
        apiKey={googleMapsApiKey}
        selectProps={{
          value: value ? { label: value.address, value: value } : null,
          onChange: handleSelect,
          placeholder: 'Location of your reparations initiative *',
          isClearable: true,
          styles: customSelectStyles,
        }}
        autocompletionRequest={{
          componentRestrictions: { country: 'us' },
          language: 'en',
        }}
        debounce={300}
      />
    </div>
  );
};

export default LocationAutocomplete;