import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase_ini';

export const exportToSpreadsheet = async () => {
  let url = null;
  try {

    const requestsCollection = collection(db, "consultationRequests");
    const querySnapshot = await getDocs(requestsCollection);
    const requests = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        name: data.name || '',
        organization: data.organization || '',
        email: data.email || '',
        phone: data.phone || '',
        stage: data.stage || '',
        otherStageDetail: data.otherStageDetail || '',
        topics: Array.isArray(data.topics) ? data.topics.join(', ') : '',
        additionalContext: data.additionalContext || '',
        location: data.location?.address || '',
        status: data.status || '',
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' 
                   ? data.createdAt.toDate().toLocaleString() 
                   : '',
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
      'Location',
      'Status',
      'Created At'
    ];

    const csvContent = [
      headers.join(','),
      ...requests.map(request => [
        request.id,
        `"${request.name.replace(/"/g, '""')}"`,
        `"${request.organization.replace(/"/g, '""')}"`,
        `"${request.email.replace(/"/g, '""')}"`,
        `"${request.phone.replace(/"/g, '""')}"`,
        `"${request.stage.replace(/"/g, '""')}"`,
        `"${request.otherStageDetail.replace(/"/g, '""')}"`,
        `"${request.topics.replace(/"/g, '""')}"`,
        `"${request.additionalContext.replace(/"/g, '""')}"`,
        `"${request.location.replace(/"/g, '""')}"`,
        `"${request.status.replace(/"/g, '""')}"`,
        `"${request.createdAt}"`
      ].join(','))
    ].join('\n');


    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `consultation_requests_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true };
  } catch (error) {
    console.error('Error exporting to spreadsheet:', error);
    return { success: false, error };
  } finally {
    if (url) {
      URL.revokeObjectURL(url); // Revoke URL in the finally block
    }
  }
}; 