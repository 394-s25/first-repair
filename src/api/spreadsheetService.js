// filepath: /Users/RayChen/Desktop/CS394/first-repair/src/api/spreadsheetService.js
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase_ini';
import { getRegionByState } from '../utils/regionMapping'; // Added import

export const exportToSpreadsheet = async () => {
  let url = null;
  try {

    const requestsCollection = collection(db, "consultationRequests");
    const querySnapshot = await getDocs(requestsCollection);
    const requests = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const region = data.location?.region || getRegionByState(data.location?.state) || 'Unknown'; // Determine region
      requests.push({
        id: doc.id,
        name: data.name || '',
        organization: data.organization || '',
        email: data.email || '',
        phone: data.phone || '',
        stage: data.stage || '',
        otherStageDetail: data.otherStageDetail || '',
        topics: Array.isArray(data.topics) ? data.topics.join('; ') : '', // Use semicolon for multi-value
        additionalContext: data.additionalContext || '',
        locationAddress: data.location?.address || '', // Keep original location address
        locationCity: data.location?.city || '',
        locationState: data.location?.state || '',
        locationZipCode: data.location?.zipCode || '',
        locationRegion: region, // Add region
        status: data.status || '',
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
                   ? data.createdAt.toDate().toLocaleString() 
                   : (data.createdAt instanceof Date ? data.createdAt.toLocaleString() : ''),
      });
    });


    const headers = [
      'ID',
      'Name',
      'Organization',
      'Email',
      'Phone',
      'Stage',
      'Other Stage Detail',
      'Topics',
      'Additional Context',
      'Location Address',
      'Location City',
      'Location State',
      'Location Zip Code',
      'Location Region', // Added Region Header
      'Status',
      'Created At'
    ];

    const csvContent = [
      headers.join(','),
      ...requests.map(request => [
        request.id,
        `"${(request.name || '').replace(/"/g, '""')}"`,
        `"${(request.organization || '').replace(/"/g, '""')}"`,
        `"${(request.email || '').replace(/"/g, '""')}"`,
        `"${(request.phone || '').replace(/"/g, '""')}"`,
        `"${(request.stage || '').replace(/"/g, '""')}"`,
        `"${(request.otherStageDetail || '').replace(/"/g, '""')}"`,
        `"${(request.topics || '').replace(/"/g, '""')}"`,
        `"${(request.additionalContext || '').replace(/"/g, '""')}"`,
        `"${(request.locationAddress || '').replace(/"/g, '""')}"`,
        `"${(request.locationCity || '').replace(/"/g, '""')}"`,
        `"${(request.locationState || '').replace(/"/g, '""')}"`,
        `"${(request.locationZipCode || '').replace(/"/g, '""')}"`,
        `"${(request.locationRegion || '').replace(/"/g, '""')}"`, // Added Region Data
        `"${(request.status || '').replace(/"/g, '""')}"`,
// ...existing code...
        `"${(request.createdAt || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    link.setAttribute("download", `consultation_requests_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up

    return { success: true };

  } catch (error) {
    console.error("Error exporting to spreadsheet: ", error);
    if (url) {
      URL.revokeObjectURL(url); // Clean up if error occurs after blob creation
    }
    return { success: false, error: error };
  }
};