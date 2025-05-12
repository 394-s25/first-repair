// File: src/pages/DashboardPage.jsx
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Import an icon
import Box from '@mui/material/Box';
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
import { getPendingConsultationRequests, updateConsultationRequestStatus } from '../api/consultationService'; // Import updateConsultationRequestStatus

const DashboardPage = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Wrap fetchRequests in useCallback to ensure it has a stable identity
  // if used in dependencies of other hooks, though not strictly necessary here
  // as it's only called in useEffect with an empty dependency array.
  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError('');
    const result = await getPendingConsultationRequests();
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

  const handleResolveRequest = async (requestId) => {
    // Optionally, add a confirmation dialog here
    // if (!confirm("Are you sure you want to mark this request as resolved?")) {
    //   return;
    // }

    const result = await updateConsultationRequestStatus(requestId, "resolved");
    if (result.success) {
      // Refresh the list of pending requests to reflect the change
      // Alternatively, filter out the resolved request from the local state:
      // setPendingRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
      // Fetching again ensures data consistency if other admins are working.
      fetchRequests();
    } else {
      // Handle error (e.g., show a notification to the admin)
      alert(`Failed to resolve request: ${result.error?.message || 'Unknown error'}`);
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
      <Typography variant="h4" gutterBottom component="h1">
        Admin Dashboard - Pending Consultation Requests
      </Typography>
      {isLoading && <CircularProgress size={24} sx={{ mb: 2 }} />}
      {!isLoading && pendingRequests.length === 0 && !error && (
        <Typography>No pending requests at the moment.</Typography>
      )}
      {pendingRequests.length > 0 && (
        <Paper elevation={3}>
          <List>
            {pendingRequests.map((request, index) => (
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
                        {/* Display Location Data */}
                        {request.location && request.location.address && (
                          <>
                            Location: {request.location.address}
                            <br />
                          </>
                        )}
                        {/* You can add more location details if needed, e.g., city, state */}
                        {/* {request.location && request.location.city && request.location.state && (
                          <>
                            City/State: {request.location.city}, {request.location.state}
                            <br />
                          </>
                        )} */}
                        Stage: {request.stage}
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
                {index < pendingRequests.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default DashboardPage;