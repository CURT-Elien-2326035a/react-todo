// Format date from DD/MM/YYYY to YYYY-MM-DD for HTML date input
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  const parts = dateString.split('/');
  if (parts.length !== 3) return '';
  
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

// Format date from YYYY-MM-DD (HTML input) to DD/MM/YYYY (app format)
export const formatDateFromInput = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

// Format date from DD/MM/YYYY to Date object for JS
export const formatDateForJS = (dateString) => {
  if (!dateString) return null;
  
  const parts = dateString.split('/');
  if (parts.length !== 3) return dateString;
  
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

// Helper function to compare dates in DD/MM/YYYY format
export const compareDates = (dateA, dateB) => {
  if (!dateA) return 1; // Null dates go to end
  if (!dateB) return -1;
  
  const partsA = dateA.split('/').map(Number);
  const partsB = dateB.split('/').map(Number);
  
  // Convert to YYYY-MM-DD for proper comparison
  const dateObjA = new Date(partsA[2], partsA[1] - 1, partsA[0]);
  const dateObjB = new Date(partsB[2], partsB[1] - 1, partsB[0]);
  
  return dateObjA - dateObjB;
};
