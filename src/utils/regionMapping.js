// filepath: /Users/RayChen/Desktop/CS394/first-repair/src/utils/regionMapping.js
export const NORTHEAST_STATES = ["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA"];
export const MIDWEST_STATES = ["OH", "IN", "IL", "MI", "WI", "MN", "IA", "MO", "ND", "SD", "NE", "KS"];
export const SOUTH_STATES = ["DE", "MD", "DC", "VA", "WV", "KY", "NC", "SC", "GA", "FL", "AL", "MS", "TN", "AR", "LA", "OK", "TX"];
export const WEST_STATES = ["MT", "WY", "CO", "NM", "ID", "UT", "AZ", "NV", "WA", "OR", "CA", "AK", "HI"];

export const getRegionByState = (stateCode) => {
  if (!stateCode) return 'Unknown';
  const upperCaseStateCode = stateCode.toUpperCase();
  if (NORTHEAST_STATES.includes(upperCaseStateCode)) return 'Northeast';
  if (MIDWEST_STATES.includes(upperCaseStateCode)) return 'Midwest';
  if (SOUTH_STATES.includes(upperCaseStateCode)) return 'South';
  if (WEST_STATES.includes(upperCaseStateCode)) return 'West';
  return 'Unknown'; // Or handle as per your needs for international/unmatched
};