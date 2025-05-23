import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
// geocodeByAddress and getLatLng are no longer directly used from this library's exports
// as we are using window.google.maps.Geocoder for more control.
import { getRegionByState } from '../utils/regionMapping';

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
        // Use direct geocoder call to specify language and component restrictions
        const geocoder = new window.google.maps.Geocoder();
        const geocodeResult = await new Promise((resolve, reject) => {
          geocoder.geocode(
            // Requesting English and restricting to US should help with consistency
            { placeId: place.value.place_id, language: 'en', region: 'US' },
            (results, status) => {
              if (status === 'OK' && results && results[0]) {
                resolve(results[0]);
              } else {
                reject(new Error('Geocode was not successful for the following reason: ' + status));
              }
            }
          );
        });

        const latLng = {
          lat: geocodeResult.geometry.location.lat(),
          lng: geocodeResult.geometry.location.lng(),
        };
        const addressComponents = geocodeResult.address_components;

        const getAddressComp = (components, type, nameType = 'long_name') => {
          const component = components.find(c => c.types.includes(type));
          return component ? component[nameType] : '';
        };

        const stateCode = getAddressComp(addressComponents, 'administrative_area_level_1', 'short_name');
        const region = getRegionByState(stateCode); // Get region using the state code

        const selectedLocationData = {
          address: geocodeResult.formatted_address, // Use formatted_address from geocoder for consistency
          placeId: place.value.place_id,
          coordinates: latLng,
          city: getAddressComp(addressComponents, 'locality', 'long_name') || getAddressComp(addressComponents, 'sublocality_level_1', 'long_name'),
          state: stateCode, // This will be the state code e.g., "NY"
          country: getAddressComp(addressComponents, 'country', 'short_name'), // This will be "US"
          zipCode: getAddressComp(addressComponents, 'postal_code', 'long_name'),
          region: region,
        };
        onPlaceSelected(selectedLocationData);
      } catch (error) {
        console.error("Error processing place selection:", error);
        // Fallback if geocoding fails
        onPlaceSelected({
          address: place.label, // Use the initially selected label as a fallback
          placeId: place.value?.place_id,
          region: 'Unknown',
          city: '', state: '', country: '', zipCode: '', coordinates: null
        });
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
        apiKey={googleMapsApiKey} // Ensure this is correctly passed
        selectProps={{
          value: value ? { label: value.address, value: value } : null,
          onChange: handleSelect,
          placeholder: 'Location of your reparations initiative *',
          isClearable: true,
          styles: customSelectStyles,
        }}
        autocompletionRequest={{
          // These restrictions help ensure the suggestions are US-based and in English
          componentRestrictions: { country: 'us' },
          language: 'en',
        }}
        debounce={300}
      />
    </div>
  );
};

export default LocationAutocomplete;