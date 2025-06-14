// File: src/pages/DashboardPage.jsx
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; // Added
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog'; // Added
import DialogActions from '@mui/material/DialogActions'; // Added
import DialogContent from '@mui/material/DialogContent'; // Added
import DialogContentText from '@mui/material/DialogContentText'; // Added
import DialogTitle from '@mui/material/DialogTitle'; // Added
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField'; // Added
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { differenceInBusinessDays } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteAllConsultationRequests, getAllConsultationRequests, updateConsultationRequestStatus } from '../api/consultationService'; // Added deleteAllConsultationRequests
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
const STATUS_ORDER = ['New', 'NearlyDue', 'Overdue', 'Resolved'];

// Add a mapping for status display names
const STATUS_DISPLAY_NAMES = {
  New: 'New',
  NearlyDue: 'Nearly Due',
  Overdue: 'Overdue',
  Resolved: 'Resolved'
};

const SIDEBAR_WIDTH = 260;

const DashboardPage = () => {
  const [allRequests, setAllRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [latestRequestData, setLatestRequestData] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isTestMode, setIsTestMode] = useState(false); // Added test mode - set to false for production
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [openRegions, setOpenRegions] = useState({});

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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

  useEffect(() => {
    if (allRequests.length > 0) {
      let mostRecentRequest = null;
      let maxTimestamp = null;

      allRequests.forEach(req => {
        let currentTimestamp;
        if (req.createdAt && typeof req.createdAt.toDate === 'function') {
          currentTimestamp = req.createdAt.toDate();
        } else if (req.createdAt instanceof Date) {
          currentTimestamp = req.createdAt;
        } else {
          return; // Skip if no valid createdAt
        }

        if (!maxTimestamp || currentTimestamp > maxTimestamp) {
          maxTimestamp = currentTimestamp;
          mostRecentRequest = req;
        }
      });

      if (mostRecentRequest) {
        const now = new Date();
        let dynamicStatus = 'New'; // Default
        let businessDays = null;
        let displayStatusColor = 'info.main'; // Default for New

        if (mostRecentRequest.status !== 'pending') {
          dynamicStatus = 'Resolved';
          displayStatusColor = 'success.main';
        } else {
          let createdAtDate;
          if (mostRecentRequest.createdAt && typeof mostRecentRequest.createdAt.toDate === 'function') {
            createdAtDate = mostRecentRequest.createdAt.toDate();
          } else if (mostRecentRequest.createdAt instanceof Date) {
            createdAtDate = mostRecentRequest.createdAt;
          }

          if (createdAtDate) {
            const startDate = createdAtDate < now ? createdAtDate : now;
            const endDate = createdAtDate < now ? now : createdAtDate;
            businessDays = differenceInBusinessDays(endDate, startDate);

            if (businessDays <= 5) {
              dynamicStatus = 'New';
              displayStatusColor = 'info.main';
            } else if (businessDays <= 10) {
              dynamicStatus = 'NearlyDue';
              displayStatusColor = 'warning.main';
            } else {
              dynamicStatus = 'Overdue';
              displayStatusColor = 'error.main';
            }
          }
        }
        setLatestRequestData({
          ...mostRecentRequest,
          dynamicDisplayStatus: dynamicStatus,
          businessDaysPassed: businessDays,
          displayStatusColor: displayStatusColor,
        });
      } else {
        setLatestRequestData(null);
      }
    } else {
      setLatestRequestData(null);
    }
  }, [allRequests]);

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

  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeleteConfirmText('');
  };

  const handleConfirmDeleteAll = async () => {
    if (deleteConfirmText === "Delete All") {
      setIsLoading(true);
      
      if (isTestMode) {
        // Test mode: simulate deletion without actually calling the backend
        console.log('TEST MODE: Simulating deletion of all requests');
        console.log('Requests that would be deleted:', allRequests);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate successful deletion
        setAllRequests([]); 
        setLatestRequestData(null);
        alert('TEST MODE: All requests deleted successfully (simulated).');
      } else {
        // Production mode: actually delete the data
        const result = await deleteAllConsultationRequests();
        if (result.success) {
          setAllRequests([]); 
          setLatestRequestData(null);
          await fetchRequests(); // Refetch to confirm empty state
          alert('All requests deleted successfully.');
        } else {
          alert(`Failed to delete all requests: ${result.error?.message || 'Unknown error'}`);
        }
      }
      
      setIsLoading(false);
      handleCloseDeleteDialog();
    } else {
      alert("Confirmation text does not match. Deletion cancelled.");
    }
  };

  const categorizeRequestsByRegionAndStatus = () => {
    const categorized = {};
    REGION_ORDER.forEach(regionName => {
      categorized[regionName] = { New: [], NearlyDue: [], Overdue: [], Resolved: [] };
    });

    const now = new Date();
    allRequests.forEach(request => {
      const region = request.region || 'Unknown';
      const requestWithTimeline = { ...request };

      if (!categorized[region]) {
        categorized[region] = { New: [], NearlyDue: [], Overdue: [], Resolved: [] };
      }

      if (requestWithTimeline.status !== 'pending') {
        categorized[region].Resolved.push(requestWithTimeline);
      } else {
        let createdAtDate;
        if (requestWithTimeline.createdAt && typeof requestWithTimeline.createdAt.toDate === 'function') {
          createdAtDate = requestWithTimeline.createdAt.toDate();
        } else if (requestWithTimeline.createdAt instanceof Date) {
          createdAtDate = requestWithTimeline.createdAt;
        }

        if (createdAtDate) {
          const startDate = createdAtDate < now ? createdAtDate : now;
          const endDate = createdAtDate < now ? now : createdAtDate;
          const businessDaysPassed = differenceInBusinessDays(endDate, startDate);
          requestWithTimeline.businessDaysPassed = businessDaysPassed;

          if (businessDaysPassed <= 5) categorized[region].New.push(requestWithTimeline);
          else if (businessDaysPassed <= 10) categorized[region].NearlyDue.push(requestWithTimeline);
          else categorized[region].Overdue.push(requestWithTimeline);
        } else {
          requestWithTimeline.businessDaysPassed = null;
          categorized[region].New.push(requestWithTimeline);
        }
      }
    });
    return categorized;
  };

  const handleScrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRegionClick = (regionName) => {
    setOpenRegions(prev => ({
      ...prev,
      [regionName]: !prev[regionName]
    }));
  };

  const getTotalCountsByStatus = () => {
    const totals = { New: 0, NearlyDue: 0, Overdue: 0, Resolved: 0 };
    const now = new Date();

    allRequests.forEach(request => {
      if (request.status === 'resolved') {
        totals.Resolved++;
      } else if (request.status === 'pending') {
        let createdAtDate;
        if (request.createdAt && typeof request.createdAt.toDate === 'function') {
          createdAtDate = request.createdAt.toDate();
        } else if (request.createdAt instanceof Date) {
          createdAtDate = request.createdAt;
        }

        if (createdAtDate) {
          const startDate = createdAtDate < now ? createdAtDate : now;
          const endDate = createdAtDate < now ? now : createdAtDate;
          const businessDaysPassed = differenceInBusinessDays(endDate, startDate);

          if (businessDaysPassed <= 5) totals.New++;
          else if (businessDaysPassed <= 10) totals.NearlyDue++;
          else totals.Overdue++;
        } else {
          totals.New++; // If no date, treat as new
        }
      }
    });
    return totals;
  };

  if (isLoading && allRequests.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress /> <Typography sx={{ ml: 2 }}>Loading requests...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Box sx={{ textAlign: 'center', mt: 4 }}><Typography color="error">Error: {error}</Typography></Box>;
  }

  const categorizedRequests = categorizeRequestsByRegionAndStatus();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
      {/* Sidebar */}
      
      <Box  
        component="nav"
        sx={{
          width: isSidebarOpen ? SIDEBAR_WIDTH : 0,
          flexShrink: 0,
          position: 'sticky',
          top: (theme) => theme.spacing(2),
          alignSelf: 'flex-start',
          maxHeight: (theme) => `calc(100vh - ${theme.spacing(4)})`,
          overflowY: 'auto',
          overflowX: 'hidden',
          borderRight: isSidebarOpen ? (theme) => `1px solid ${theme.palette.divider}` : 'none',
          visibility: isSidebarOpen ? 'visible' : 'hidden',
          opacity: isSidebarOpen ? 1 : 0,
          transition: (theme) => theme.transitions.create(['width', 'padding', 'opacity', 'visibility', 'border'], {
            easing: theme.transitions.easing.sharp,
            duration: isSidebarOpen ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
          }),
          pt: isSidebarOpen ? 0 : 0,
          pb: isSidebarOpen ? 2 : 0,
        }}
      >
        {isSidebarOpen && (
          <>
            <Typography variant="h6" sx={{ p: 2, pt: 0, fontWeight: 'bold', whiteSpace: 'nowrap' }}>Regions</Typography>
            <List dense>
              {/* Latest Request Sidebar Item */}
              {latestRequestData && (
                <ListItemButton
                  onClick={() => handleScrollToSection('latest-request-section')}
                  sx={{ pl: 2, '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <ListItemText
                    primaryTypographyProps={{ fontWeight: 'bold', whiteSpace: 'nowrap', color: 'primary.main' }}
                    primary="Latest Request"
                  />
                </ListItemButton>
              )}
              {/* Divider if latest request and regions are both present */}
              {latestRequestData && REGION_ORDER.some(regionName => {
                const regionData = categorizedRequests[regionName];
                return regionData && STATUS_ORDER.reduce((acc, status) => acc + regionData[status].length, 0) > 0;
              }) && <Divider sx={{ my: 1 }} />}

              {REGION_ORDER.map(regionName => {
                const regionData = categorizedRequests[regionName];
                const totalRequestsInRegion = regionData ? STATUS_ORDER.reduce((acc, status) => acc + regionData[status].length, 0) : 0;

                if (totalRequestsInRegion > 0 || (regionName === 'Unknown' && totalRequestsInRegion > 0)) {
                  return (
                    <React.Fragment key={`sidebar-region-${regionName}`}>
                      <ListItemButton
                        onClick={() => handleRegionClick(regionName)}
                        sx={{ pl: 2, '&:hover': { backgroundColor: 'action.hover' } }}
                      >
                        <ListItemText
                          primaryTypographyProps={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}
                          primary={`${REGIONS_CONFIG[regionName]?.name || regionName} (${totalRequestsInRegion})`}
                        />
                        {openRegions[regionName] ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>
                      <Collapse in={openRegions[regionName]} timeout="auto" unmountOnExit>
                        <List dense disablePadding sx={{ pl: 3 }}>
                          {STATUS_ORDER.map(statusKey => {
                            if (regionData && regionData[statusKey] && regionData[statusKey].length > 0) {
                              let statusColor = 'text.primary';
                              if (statusKey === 'New') statusColor = 'info.main';
                              else if (statusKey === 'NearlyDue') statusColor = 'warning.main';
                              else if (statusKey === 'Overdue') statusColor = 'error.main';
                              else if (statusKey === 'Resolved') statusColor = 'success.main';

                              return (
                                <ListItemButton
                                  key={`sidebar-status-${regionName}-${statusKey}`}
                                  onClick={() => handleScrollToSection(`status-${regionName}-${statusKey}`)}
                                  sx={{ 
                                    pl: 2, 
                                    '&:hover': { backgroundColor: 'action.hover' },
                                    color: statusColor
                                  }}
                                >
                                  <ListItemText 
                                    primaryTypographyProps={{
                                      whiteSpace: 'nowrap',
                                      color: statusColor
                                    }} 
                                    primary={`${STATUS_DISPLAY_NAMES[statusKey]} (${regionData[statusKey].length})`} 
                                  />
                                </ListItemButton>
                              );
                            }
                            return null;
                          })}
                        </List>
                      </Collapse>
                    </React.Fragment>
                  );
                }
                return null;
              })}
            </List>
          </>
        )}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 3,
          px:3,
          transition: (theme) => theme.transitions.create(['margin-left', 'width'], { // Transition for main content if needed
            easing: theme.transitions.easing.sharp,
            duration: isSidebarOpen ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
          }),
          // maxWidth will be 100% of its container, which adjusts due to sidebar
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={toggleSidebar}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h4" component="h1" noWrap>Admin Dashboard</Typography>
            {/* Test mode indicator */}
            {isTestMode && (
              <Box sx={{ ml: 2, px: 1, py: 0.5, bgcolor: 'warning.light', color: 'warning.contrastText', borderRadius: 1 }}>
                <Typography variant="caption" fontWeight="bold">TEST MODE</Typography>
              </Box>
            )}
          </Box>
          <Box>
            <Button variant="contained" color="primary" startIcon={<FileDownloadIcon />} onClick={handleExport} disabled={isExporting} sx={{ mr: 1 }}>
              {isExporting ? 'Exporting...' : 'Export to CSV'}
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              startIcon={<DeleteForeverIcon />} 
              onClick={handleOpenDeleteDialog} 
              sx={{ mr: 1 }} 
              disabled={isLoading || allRequests.length === 0}
            >
              {isTestMode ? 'Test Delete All' : 'Delete All Requests'}
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>
          </Box>
        </Box>

        {/* Summary Section */}
        <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Summary</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {STATUS_ORDER.map(statusKey => {
              const totalCount = getTotalCountsByStatus()[statusKey];
              let statusColor = 'text.primary';
              if (statusKey === 'New') statusColor = 'info.main';
              else if (statusKey === 'NearlyDue') statusColor = 'warning.main';
              else if (statusKey === 'Overdue') statusColor = 'error.main';
              else if (statusKey === 'Resolved') statusColor = 'success.main';

              return (
                <Paper
                  key={statusKey}
                  elevation={1}
                  sx={{
                    p: 1.5,
                    minWidth: 120,
                    borderLeft: 3,
                    borderColor: statusColor,
                    bgcolor: 'background.paper'
                  }}
                >
                  <Typography variant="h5" sx={{ color: statusColor, fontWeight: 'bold' }}>
                    {totalCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {STATUS_DISPLAY_NAMES[statusKey]}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        </Paper>

        {/* Latest Request Section */}
        {latestRequestData && (
          <Box sx={{ mb: 4 }} id="latest-request-section"> {/* Added id here */}
            <Typography variant="h5" component="h2" sx={{ mt: 3, mb: 2, borderBottom: '2px solid #ccc', pb: 1 }}>
              Latest Request
            </Typography>
            <Paper elevation={1}>
              <List>
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    latestRequestData.status === 'pending' ? (
                      <Tooltip title="Mark as Resolved">
                        <IconButton edge="end" aria-label="resolve" onClick={() => handleResolveRequest(latestRequestData.id, 'resolved')}>
                          <CheckCircleOutlineIcon color="success" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Mark as Pending">
                        <IconButton edge="end" aria-label="mark-pending" onClick={() => handleResolveRequest(latestRequestData.id, 'pending')}>
                          <ArrowUpwardIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                >
                  <ListItemText
                    primary={<Typography variant="subtitle1" sx={{fontWeight: 'bold'}}>{latestRequestData.name} - {latestRequestData.organization || 'N/A'}</Typography>}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.secondary">
                          Email: {latestRequestData.email} | Phone: {latestRequestData.phone || 'N/A'}
                        </Typography>
                        <br />
                        {latestRequestData.location?.address && <>Location: {latestRequestData.location.address} ({latestRequestData.region})<br /></>}
                        Stage: {latestRequestData.stage === 'Other' ? `Other: ${latestRequestData.otherStageDetail}` : latestRequestData.stage}
                        <br />
                        Status: <Typography component="span" sx={{ color: latestRequestData.status === 'pending' ? latestRequestData.displayStatusColor : 'success.dark', fontWeight: 'bold'}}>
                                  {latestRequestData.status === 'pending' ? STATUS_DISPLAY_NAMES[latestRequestData.dynamicDisplayStatus] : STATUS_DISPLAY_NAMES.Resolved}
                                </Typography>
                        <br />
                        Topics: {Array.isArray(latestRequestData.topics) ? latestRequestData.topics.join(', ') : latestRequestData.topics}
                        <br />
                        Context: {latestRequestData.additionalContext}
                        <br />
                        Submitted: {latestRequestData.createdAt instanceof Date ? latestRequestData.createdAt.toLocaleString() : (latestRequestData.createdAt?.toDate ? latestRequestData.createdAt.toDate().toLocaleString() : 'N/A')}
                        {latestRequestData.status === 'pending' && typeof latestRequestData.businessDaysPassed === 'number' && (
                          <Typography component="span" variant="caption" sx={{ color: latestRequestData.displayStatusColor, ml: 0.5 }}>
                            ({latestRequestData.businessDaysPassed} business day{latestRequestData.businessDaysPassed === 1 ? '' : 's'} since submission)
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Box>
        )}

        {isLoading && <CircularProgress size={24} sx={{ mb: 2 }} />}
        {!isLoading && allRequests.length === 0 && !error && !latestRequestData && (<Typography>No requests found.</Typography>)}

        {REGION_ORDER.map(regionName => {
          const regionData = categorizedRequests[regionName];
          if (!regionData) return null;
          const totalRequestsInRegion = STATUS_ORDER.reduce((acc, status) => acc + regionData[status].length, 0);
          if (totalRequestsInRegion === 0 && regionName !== 'Unknown') return null;

          return (
            <Box key={regionName} sx={{ mb: 4 }} >
              <Typography variant="h5" component="h2" id={`region-${regionName}`} sx={{ mt: 3, mb: 2, borderBottom: '2px solid #ccc', pb: 1, scrollMarginTop: '70px' }}>
                {REGIONS_CONFIG[regionName]?.name || regionName} ({totalRequestsInRegion})
              </Typography>

              {STATUS_ORDER.map(statusKey => {
                const requestsInStatus = regionData[statusKey];
                if (!requestsInStatus || requestsInStatus.length === 0) return null;

                let statusColor = 'text.primary';
                if (statusKey === 'New') statusColor = 'info.main';
                else if (statusKey === 'NearlyDue') statusColor = 'warning.main';
                else if (statusKey === 'Overdue') statusColor = 'error.main';
                else if (statusKey === 'Resolved') statusColor = 'success.main';

                return (
                  <Box key={statusKey} sx={{ mb:3 }} >
                    <Typography variant="h6" id={`status-${regionName}-${statusKey}`} sx={{ color: statusColor, mb: 1, scrollMarginTop: '70px'  }}>
                      {STATUS_DISPLAY_NAMES[statusKey]} ({requestsInStatus.length})
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
                                    {request.status === 'pending' && typeof request.businessDaysPassed === 'number' && (
                                      <Typography component="span" variant="caption" sx={{ color: statusColor, ml: 0.5 }}>
                                        ({request.businessDaysPassed} business day{request.businessDaysPassed === 1 ? '' : 's'} since submission)
                                      </Typography>
                                    )}
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
      
      {/* Delete All Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>
          {isTestMode ? 'Test Delete All Requests' : 'Confirm Delete All Requests'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isTestMode ? (
              <>
                <strong>TEST MODE:</strong> This will simulate deleting all consultation requests without actually removing them from the database.
                To confirm the test, please type "Delete All" in the box below.
              </>
            ) : (
              <>
                This action will permanently delete all consultation requests. This cannot be undone.
                To confirm, please type "Delete All" in the box below.
              </>
            )}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="delete-confirm-text"
            label="Type 'Delete All'"
            type="text"
            fullWidth
            variant="standard"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button 
            onClick={handleConfirmDeleteAll} 
            color="error"
            disabled={deleteConfirmText !== "Delete All"}
          >
            {isTestMode ? 'Test Delete All' : 'Delete All'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardPage;