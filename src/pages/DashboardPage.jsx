// File: src/pages/DashboardPage.jsx
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { differenceInBusinessDays } from 'date-fns'; // Import from date-fns-business
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllConsultationRequests, updateConsultationRequestStatus } from '../api/consultationService';
import { exportToSpreadsheet } from '../api/spreadsheetService';
import { useAuth } from '../contexts/AuthContext';
import { getRegionByState, MIDWEST_STATES, NORTHEAST_STATES, SOUTH_STATES, WEST_STATES } from '../utils/regionMapping';

const REGIONS_CONFIG = {
  Northeast: { name: 'Northeast', states: NORTHEAST_STATES },
  Midwest: { name: 'Midwest', states: MIDWEST_STATES },
  South: { name: 'South', states: SOUTH_STATES },
  West: { name: 'West', states: WEST_STATES },
  Unknown: { name: 'Unknown Region', states: [] }
};

const REGION_ORDER = ['Northeast', 'Midwest', 'South', 'West', 'Unknown'];

const DashboardPage = () => {
  const [allRequests, setAllRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError('');
    const result = await getAllConsultationRequests();
    if (result.success) {
      const processedRequests = result.data.map(req => ({
        ...req,
        region: req.location?.region || getRegionByState(req.location?.state) || 'Unknown'
      }));
      setAllRequests(processedRequests);
    } else {
      setError(result.error?.message || 'Failed to fetch requests.');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleResolveRequest = async (requestId, newStatus) => {
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
    } catch (exportError) {
      console.error('Export error:', exportError);
      alert('An error occurred while exporting the data.');
    } finally {
      setIsExporting(false);
    }
  };

  const categorizeRequestsByRegionAndStatus = () => {
    const categorized = {};
    REGION_ORDER.forEach(regionName => {
      categorized[regionName] = {
        New: [],
        NearlyDue: [],
        Overdue: [],
        Resolved: [],
      };
    });

    const now = new Date();
    allRequests.forEach(request => {
      const region = request.region || 'Unknown';
      if (!categorized[region]) {
        categorized[region] = { New: [], NearlyDue: [], Overdue: [], Resolved: [] };
      }

      if (request.status !== 'pending') {
        categorized[region].Resolved.push(request);
      } else {
        let createdAtDate;
        if (request.createdAt && typeof request.createdAt.toDate === 'function') { // Firestore Timestamp
          createdAtDate = request.createdAt.toDate();
        } else if (request.createdAt instanceof Date) { // Already a JS Date
          createdAtDate = request.createdAt;
        }

        if (createdAtDate) {
          // Ensure 'now' is always later than 'createdAtDate' for differenceInBusinessDays
          const startDate = createdAtDate < now ? createdAtDate : now;
          const endDate = createdAtDate < now ? now : createdAtDate;
          const businessDaysPassed = differenceInBusinessDays(endDate, startDate);

          if (businessDaysPassed <= 5) {
            categorized[region].New.push(request);
          } else if (businessDaysPassed <= 10) {
            categorized[region].NearlyDue.push(request);
          } else {
            categorized[region].Overdue.push(request);
          }
        } else {
          // Fallback for unexpected createdAt format
          categorized[region].New.push(request);
        }
      }
    });
    return categorized;
  };

  if (isLoading && allRequests.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading requests...</Typography>
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

  const categorizedRequests = categorizeRequestsByRegionAndStatus();

  return (
    <Box sx={{ maxWidth: '900px', margin: 'auto', padding: 3 }}>
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
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {isLoading && <CircularProgress size={24} sx={{ mb: 2 }} />}
      {!isLoading && allRequests.length === 0 && !error && (
        <Typography>No requests found.</Typography>
      )}

      {REGION_ORDER.map(regionName => {
        const regionData = categorizedRequests[regionName];
        if (!regionData) return null;

        const totalRequestsInRegion = regionData.New.length + regionData.NearlyDue.length + regionData.Overdue.length + regionData.Resolved.length;
        if (totalRequestsInRegion === 0 && regionName !== 'Unknown') return null;

        return (
          <Box key={regionName} sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ mt: 3, mb: 2, borderBottom: '2px solid #ccc', pb: 1 }}>
              {REGIONS_CONFIG[regionName]?.name || regionName} ({totalRequestsInRegion})
            </Typography>

            {Object.entries(regionData).map(([statusKey, requestsInStatus]) => {
              if (requestsInStatus.length === 0) return null;

              let statusColor = 'text.primary';
              if (statusKey === 'New') statusColor = 'info.main';
              else if (statusKey === 'NearlyDue') statusColor = 'warning.main';
              else if (statusKey === 'Overdue') statusColor = 'error.main';
              else if (statusKey === 'Resolved') statusColor = 'success.main';

              return (
                <Box key={statusKey} sx={{ mb:3 }}>
                  <Typography variant="h6" sx={{ color: statusColor, mb: 1 }}>
                    {statusKey} ({requestsInStatus.length})
                  </Typography>
                  <Paper elevation={1}>
                    <List>
                      {requestsInStatus.map((request, index, arr) => (
                        <React.Fragment key={request.id}>
                          <ListItem
                            alignItems="flex-start"
                            secondaryAction={
                              request.status === 'pending' ? (
                                <Tooltip title="Mark as Resolved">
                                  <IconButton edge="end" aria-label="resolve" onClick={() => handleResolveRequest(request.id, 'resolved')}>
                                    <CheckCircleOutlineIcon color="success" />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Mark as Pending">
                                  <IconButton edge="end" aria-label="mark-pending" onClick={() => handleResolveRequest(request.id, 'pending')}>
                                    <ArrowUpwardIcon color="primary" />
                                  </IconButton>
                                </Tooltip>
                              )
                            }
                          >
                            <ListItemText
                              primary={<Typography variant="subtitle1" sx={{fontWeight: 'bold'}}>{request.name} - {request.organization || 'N/A'}</Typography>}
                              secondary={
                                <>
                                  <Typography component="span" variant="body2" color="text.secondary">
                                    Email: {request.email} | Phone: {request.phone || 'N/A'}
                                  </Typography>
                                  <br />
                                  {request.location?.address && <>Location: {request.location.address} ({request.region})<br /></>}
                                  Stage: {request.stage === 'Other' ? `Other: ${request.otherStageDetail}` : request.stage}
                                  <br />
                                  Status: <Typography component="span" sx={{ color: request.status === 'pending' ? statusColor : 'success.dark', fontWeight: 'bold'}}>{request.status}</Typography>
                                  <br />
                                  Topics: {Array.isArray(request.topics) ? request.topics.join(', ') : request.topics}
                                  <br />
                                  Context: {request.additionalContext}
                                  <br />
                                  Submitted: {request.createdAt instanceof Date ? request.createdAt.toLocaleString() : (request.createdAt?.toDate ? request.createdAt.toDate().toLocaleString() : 'N/A')}
                                </>
                              }
                            />
                          </ListItem>
                          {index < arr.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
};

export default DashboardPage;