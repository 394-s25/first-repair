// File: src/pages/DashboardPage.jsx
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Import an icon
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton'; // Import IconButton
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip'; // For better UX on the button
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useState } from 'react'; // Add useCallback
import { getAllConsultationRequests, updateConsultationRequestStatus } from '../api/consultationService'; // Import updateConsultationRequestStatus
import { exportToSpreadsheet } from '../api/spreadsheetService';


const DashboardPage = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Wrap fetchRequests in useCallback to ensure it has a stable identity
  // if used in dependencies of other hooks, though not strictly necessary here
  // as it's only called in useEffect with an empty dependency array.
  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError('');
    const result = await getAllConsultationRequests();
    if (result.success) {
      setPendingRequests(result.data);
    } else {
      setError(result.error?.message || 'Failed to fetch pending requests.');
    }
    setIsLoading(false);
  }, []); // No dependencies, so it's stable

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]); // fetchRequests is now a dependency

  const handleResolveRequest = async (requestId, newStatus = "resolved") => {

    const result = await updateConsultationRequestStatus(requestId, newStatus);
    if (result.success) {
      fetchRequests();
    } else {
      alert(`Failed to update request: ${result.error?.message || 'Unknown error'}`);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportToSpreadsheet();
      if (!result.success) {
        alert('Failed to export data. Please try again.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('An error occurred while exporting the data.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading && pendingRequests.length === 0) { // Show loading only if there are no requests yet
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading pending requests...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '800px', margin: 'auto', padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileDownloadIcon />}
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export to CSV'}
        </Button>
      </Box>
      {isLoading && <CircularProgress size={24} sx={{ mb: 2 }} />}
      {!isLoading && pendingRequests.length === 0 && !error && (
        <Typography>No requests found.</Typography>
      )}
      {pendingRequests.length > 0 && (
        <>
          {/* Pending Section */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
            Pending Requests
          </Typography>
          <Paper elevation={3} sx={{ mb: 4 }}>
            <List>
              {pendingRequests
                .filter(req => req.status === 'pending')
                .map((request, index, arr) => (
                  <React.Fragment key={request.id}>
                    <ListItem
                      alignItems="flex-start"
                      secondaryAction={
                        <Tooltip title="Mark as Resolved">
                          <IconButton
                            edge="end"
                            aria-label="resolve"
                            onClick={() => handleResolveRequest(request.id)}
                          >
                            <CheckCircleOutlineIcon color="success" />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemText
                        primary={<Typography variant="h6">{request.name} - {request.organization || 'N/A'}</Typography>}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              Email: {request.email} | Phone: {request.phone || 'N/A'}
                            </Typography>
                            <br />
                            {request.location?.address && <>Location: {request.location.address}<br /></>}
                            Stage: {request.stage === 'Other' ? `Other: ${request.otherStageDetail}` : request.stage}
                            <br />
                            Status: {request.status}
                            <br />
                            Topics: {Array.isArray(request.topics) ? request.topics.join(', ') : request.topics}
                            <br />
                            Context: {request.additionalContext}
                            <br />
                            Submitted: {request.createdAt?.toDate().toLocaleString()}
                          </>
                        }
                      />
                    </ListItem>
                    {index < arr.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
            </List>
          </Paper>

          {/* Other (Resolved, etc.) Section */}
          <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
            Resolved Requests
          </Typography>
          <Paper elevation={1}>
            <List>
              {pendingRequests
                .filter(req => req.status !== 'pending')
                .map((request, index, arr) => (
                  <React.Fragment key={request.id}>
                    <ListItem alignItems="flex-start"
                    secondaryAction={
                      <Tooltip title="Mark as Pending">
                        <IconButton
                          edge="end"
                          aria-label="mark-pending"
                          onClick={() => handleResolveRequest(request.id, 'pending')}
                        >
                          <CheckCircleOutlineIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                    }>
                    <ListItemText
                      primary={<Typography variant="h6">{request.name} - {request.organization || 'N/A'}</Typography>}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            Email: {request.email} | Phone: {request.phone || 'N/A'}
                          </Typography>
                          <br />
                          {request.location?.address && <>Location: {request.location.address}<br /></>}
                          Stage: {request.stage === 'Other' ? `Other: ${request.otherStageDetail}` : request.stage}
                          <br />
                          Status: {request.status}
                          <br />
                          Topics: {Array.isArray(request.topics) ? request.topics.join(', ') : request.topics}
                          <br />
                          Context: {request.additionalContext}
                          <br />
                          Submitted: {request.createdAt?.toDate().toLocaleString()}
                        </>
                      }
                    />
                  </ListItem>
                  {index < arr.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
          </List>
        </Paper>
      </>
    )}
  </Box>
);
};

export default DashboardPage;