import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Tabs,
  Tab,
  Grid,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  Inventory,
  Assessment,
  Timeline,
  CheckCircle,
  Warning,
  Error,
  Description,
  Store,
  Numbers,
  Pending,
  Edit as EditIcon,
} from '@mui/icons-material';

const PurchaseRequestDetail = ({ purchaseRequest, onBack }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [statusHistory, setStatusHistory] = useState([]); // Mock history
  const [relatedPart, setRelatedPart] = useState(null); // Fetch related spare part

  useEffect(() => {
    if (purchaseRequest) {
      loadStatusHistory();
      loadRelatedPart();
    }
  }, [purchaseRequest]);

  const loadStatusHistory = () => {
    // Mock status history; in real app, fetch from API
    setStatusHistory([
      {
        date: new Date(purchaseRequest.createdAt),
        status: 'pending',
        note: 'Request submitted',
        user: 'John Doe',
      },
      
    ]);
  };

  const loadRelatedPart = async () => {
    try {
      // Fetch spare part by partNameOrId or partNumber
      const response = await fetch(`/api/spare-parts?search=${purchaseRequest.partNameOrId}`);
      const parts = await response.json();
      const matchedPart = parts.find(part => 
        part.partName.toLowerCase().includes(purchaseRequest.partNameOrId.toLowerCase()) ||
        part.partNumber === purchaseRequest.partNameOrId
      );
      setRelatedPart(matchedPart);
    } catch (error) {
      console.error('Error loading related part:', error);
    }
  };

  const calculateApprovalScore = () => {
    // Simple score based on status and completeness
    let base = 3.0;
    if (purchaseRequest.status === 'approved') base = 5.0;
    if (purchaseRequest.status === 'rejected') base = 1.5;
    if (!purchaseRequest.reason) base -= 0.5; // No reason lowers score
    return Math.max(1, Math.min(5, base));
  };

  const approvalScore = calculateApprovalScore();

  const formatDate = (dateString) => {
    if (!dateString) return 'Not recorded';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusConfig = (status) => {
    const config = {
      pending: { label: 'Pending', color: 'warning', icon: <Pending /> },
      approved: { label: 'Approved', color: 'success', icon: <CheckCircle /> },
      rejected: { label: 'Rejected', color: 'error', icon: <Error /> },
      completed: { label: 'Completed', color: 'default', icon: <CheckCircle /> },
    };
    return (
      config[status] || { label: status, color: 'default', icon: <Pending /> }
    );
  };

  const getStatusChip = (status) => {
    const config = getStatusConfig(status);
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        variant="outlined"
        size="medium"
      />
    );
  };

  if (!purchaseRequest) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" textAlign="center">
              No purchase request selected.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const statusConfig = getStatusConfig(purchaseRequest.status);

  const tabLabels = [
    'General Info',
    `Status History (${statusHistory.length})`,
    'Approval Status',
    'Lifecycle',
  ];

  const DetailField = ({ icon, label, value, color = 'text.primary' }) => (
    <Grid item xs={12} sm={6} md={4}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            {label}
          </Typography>
          <Typography variant="body1" color={color} fontWeight="medium">
            {value || '—'}
          </Typography>
        </Box>
      </Box>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, backgroundColor: 'background.paper' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={onBack}
              color="inherit"
              sx={{ minWidth: 'auto', p: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}
              >
                <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
                  <Inventory sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="h1" fontWeight="bold">
                    Purchase Request {purchaseRequest.id}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      For: {purchaseRequest.partNameOrId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Qty: {purchaseRequest.requiredQuantity}
                    </Typography>
                    {purchaseRequest.preferredVendor && (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          •
                        </Typography>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                          <Store fontSize="small" />
                          <Typography variant="body2">{purchaseRequest.preferredVendor}</Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
                <Box sx={{ ml: 'auto' }}>{getStatusChip(purchaseRequest.status)}</Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
      {/* Tabs */}
      <Card sx={{ backgroundColor: 'background.paper' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 600 },
          }}
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
        <CardContent>
          {/* General Info Tab */}
          {activeTab === 0 && (
            <Grid container spacing={2}>
              <DetailField
                icon={<Description />}
                label="Part Name/ID"
                value={purchaseRequest.partNameOrId}
              />
              <DetailField
                icon={<Numbers />}
                label="Required Quantity"
                value={purchaseRequest.requiredQuantity.toString()}
              />
              <DetailField
                icon={<Store />}
                label="Preferred Vendor"
                value={purchaseRequest.preferredVendor}
              />
              <DetailField
                icon={<Description />}
                label="Reason"
                value={purchaseRequest.reason}
              />
              {relatedPart && (
                <>
                  <DetailField
                    icon={<Inventory />}
                    label="Current Stock"
                    value={`${relatedPart.stock} ${relatedPart.unit}`}
                    color={relatedPart.stock > relatedPart.minimumStock ? 'success.main' : 'error.main'}
                  />
                  <DetailField
                    icon={<Warning />}
                    label="Minimum Stock"
                    value={`${relatedPart.minimumStock} ${relatedPart.unit}`}
                  />
                </>
              )}
            </Grid>
          )}
          {/* Status History Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Status History
              </Typography>
              {statusHistory.length === 0 ? (
                <Typography
                  color="text.secondary"
                  textAlign="center"
                  sx={{ py: 4 }}
                >
                  No status changes recorded yet.
                </Typography>
              ) : (
                <List>
                  {statusHistory.map((historyItem, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          <EditIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                mb: 1,
                              }}
                            >
                              <Typography variant="body1" fontWeight="medium">
                                {getStatusConfig(historyItem.status).label}
                              </Typography>
                              <Chip
                                label={historyItem.user}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                              >
                                {formatDate(historyItem.date)}
                              </Typography>
                              {historyItem.note && (
                                <Typography variant="body2" paragraph>
                                  {historyItem.note}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < statusHistory.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}
          {/* Approval Status Tab */}
          {activeTab === 2 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Assessment />
                        Approval Assessment
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1,
                          }}
                        >
                          <Typography variant="body1">
                            Approval Likelihood
                          </Typography>
                          <Typography variant="h6" color="primary.main">
                            {approvalScore.toFixed(1)} / 5
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(approvalScore / 5) * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'grey.800',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor:
                                approvalScore >= 4
                                  ? 'success.main'
                                  : approvalScore >= 3
                                  ? 'warning.main'
                                  : 'error.main',
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={statusConfig.label}
                          color={statusConfig.color}
                          variant="outlined"
                        />
                        {purchaseRequest.reason && (
                          <Chip
                            label="Detailed Reason Provided"
                            color="info"
                            variant="outlined"
                          />
                        )}
                        {relatedPart && relatedPart.stock <= relatedPart.minimumStock && (
                          <Chip
                            label="Low Stock Confirmed"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Request Indicators
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Urgency Level"
                            secondary={
                              <Chip
                                label={
                                  purchaseRequest.requiredQuantity > 10
                                    ? 'High'
                                    : purchaseRequest.requiredQuantity > 5
                                    ? 'Medium'
                                    : 'Low'
                                }
                                color={
                                  purchaseRequest.requiredQuantity > 10
                                    ? 'error'
                                    : purchaseRequest.requiredQuantity > 5
                                    ? 'warning'
                                    : 'success'
                                }
                                size="small"
                              />
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText
                            primary="Vendor Preference"
                            secondary={
                              purchaseRequest.preferredVendor
                                ? purchaseRequest.preferredVendor
                                : 'Any vendor'
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText
                            primary="Submission Date"
                            secondary={formatDate(purchaseRequest.createdAt)}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          {/* Lifecycle Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Timeline />
                Request Lifecycle
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Inventory />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Request Submitted"
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(purchaseRequest.createdAt)}
                        </Typography>
                        <Typography variant="body2">
                          New purchase request created for {purchaseRequest.requiredQuantity}{' '}
                          units of {purchaseRequest.partNameOrId}
                          {purchaseRequest.preferredVendor && ` from ${purchaseRequest.preferredVendor}`}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
                {statusHistory.slice(1).map((historyItem, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: getStatusConfig(historyItem.status).color + '.main' }}>
                        {getStatusConfig(historyItem.status).icon}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={`${getStatusConfig(historyItem.status).label} Update`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(historyItem.date)}
                          </Typography>
                          <Typography variant="body2">
                            {historyItem.note || `Status changed to ${getStatusConfig(historyItem.status).label}`}
                            {historyItem.user && ` by ${historyItem.user}`}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {statusHistory.length < 2 && (
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'grey.400' }}>
                        <Timeline />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary="Next Step"
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Awaiting approval or further action.
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PurchaseRequestDetail;