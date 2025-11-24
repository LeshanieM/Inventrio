//individual asset details page
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
  Build,
  Assessment,
  Timeline,
  CheckCircle,
  Warning,
  Error,
  LocationOn,
  Category,
  Memory,
  QrCode,
  Store,
  CalendarToday,
  Apartment,
  Layers,
  MeetingRoom,
} from '@mui/icons-material';

const AssetDetail = ({ asset, onBack }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);

  useEffect(() => {
    if (asset) {
      loadAssetMaintenance();
    }
  }, [asset]);

  const loadAssetMaintenance = async () => {
    try {
      const response = await fetch('/api/maintenance');
      const data = await response.json();
      const assetMaintenance = data.filter(
        (record) => record.assetId === asset.id
      );
      setMaintenanceHistory(assetMaintenance);
    } catch (error) {
      console.error('Error loading maintenance history:', error);
    }
  };

  const calculateConditionScore = () => {
    let base = 4.5;
    if (asset.status === 'repair') base = 2.5;
    if (asset.status === 'retired') base = 1.5;
    if (asset.quantity <= asset.minThreshold) base -= 0.5;
    return Math.max(1, Math.min(5, base));
  };

  const conditionScore = calculateConditionScore();

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
      active: { label: 'Active', color: 'success', icon: <CheckCircle /> },
      repair: { label: 'Under Repair', color: 'warning', icon: <Build /> },
      standby: { label: 'Standby', color: 'default', icon: <Inventory /> },
      retired: { label: 'Retired', color: 'error', icon: <Error /> },
    };
    return (
      config[status] || { label: status, color: 'default', icon: <Inventory /> }
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

  const getMaintenanceStatusChip = (status) => {
    const statusConfig = {
      completed: { label: 'Completed', color: 'success' },
      'in-progress': { label: 'In Progress', color: 'warning' },
      pending: { label: 'Pending', color: 'default' },
      cancelled: { label: 'Cancelled', color: 'error' },
    };
    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getStockStatus = () => {
    if (asset.quantity <= asset.minThreshold) {
      return { label: 'Low Stock', color: 'error', adequate: false };
    }
    return { label: 'Adequate', color: 'success', adequate: true };
  };

  const stockStatus = getStockStatus();

  if (!asset) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" textAlign="center">
              No asset selected.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const statusConfig = getStatusConfig(asset.status);

  const tabLabels = [
    'General Info',
    `Maintenance (${maintenanceHistory.length})`,
    'Condition',
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
                    {asset.name}
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
                    <Chip label={asset.id} variant="outlined" size="small" />
                    <Typography variant="body2" color="text.secondary">
                      •
                    </Typography>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <LocationOn fontSize="small" />
                      <Typography variant="body2">{asset.location}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      •
                    </Typography>
                    <Typography variant="body2">
                      Qty: {asset.quantity}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ ml: 'auto' }}>{getStatusChip(asset.status)}</Box>
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
                icon={<Category />}
                label="Category"
                value={asset.category}
              />
              <DetailField
                icon={<Memory />}
                label="Model"
                value={asset.model}
              />
              <DetailField
                icon={<QrCode />}
                label="Serial Number"
                value={asset.serial}
              />
              <DetailField
                icon={<Store />}
                label="Vendor"
                value={asset.vendor}
              />
              <DetailField
                icon={<CalendarToday />}
                label="Warranty"
                value={asset.warranty}
              />
              <DetailField
                icon={<Inventory />}
                label="Current Quantity"
                value={asset.quantity.toString()}
                color={stockStatus.adequate ? 'success.main' : 'error.main'}
              />
              <DetailField
                icon={<Warning />}
                label="Minimum Threshold"
                value={asset.minThreshold.toString()}
              />
              <DetailField
                icon={<Apartment />}
                label="Building"
                value={asset.building}
              />
              <DetailField
                icon={<Layers />}
                label="Floor"
                value={asset.floor}
              />
              <DetailField
                icon={<MeetingRoom />}
                label="Room"
                value={asset.room}
              />
            </Grid>
          )}

          {/* Maintenance Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Maintenance History
              </Typography>
              {maintenanceHistory.length === 0 ? (
                <Typography
                  color="text.secondary"
                  textAlign="center"
                  sx={{ py: 4 }}
                >
                  No maintenance history recorded for this asset.
                </Typography>
              ) : (
                <List>
                  {maintenanceHistory.map((record, index) => (
                    <React.Fragment key={record.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          <Build color="primary" />
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
                                {record.action}
                              </Typography>
                              {getMaintenanceStatusChip(record.status)}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                              >
                                {formatDate(record.date)} • {record.id}
                                {record.technician && ` • ${record.technician}`}
                              </Typography>
                              {record.description && (
                                <Typography variant="body2" paragraph>
                                  {record.description}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < maintenanceHistory.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* Condition Tab */}
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
                        Condition Assessment
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
                            Overall Condition
                          </Typography>
                          <Typography variant="h6" color="primary.main">
                            {conditionScore.toFixed(1)} / 5
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(conditionScore / 5) * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'grey.800',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor:
                                conditionScore >= 4
                                  ? 'success.main'
                                  : conditionScore >= 3
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
                        {!stockStatus.adequate && (
                          <Chip
                            label="Low Stock"
                            color="error"
                            variant="outlined"
                          />
                        )}
                        {asset.status === 'active' && (
                          <Chip
                            label="Ready for Use"
                            color="success"
                            variant="outlined"
                          />
                        )}
                        {maintenanceHistory.some(
                          (m) => m.status === 'in-progress'
                        ) && (
                          <Chip
                            label="Maintenance in Progress"
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
                        Health Indicators
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Stock Level"
                            secondary={
                              <Chip
                                label={stockStatus.label}
                                color={stockStatus.color}
                                size="small"
                              />
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText
                            primary="Operational Status"
                            secondary={
                              <Chip
                                label={
                                  asset.status === 'active'
                                    ? 'Normal'
                                    : 'Attention Needed'
                                }
                                color={
                                  asset.status === 'active'
                                    ? 'success'
                                    : 'warning'
                                }
                                size="small"
                              />
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText
                            primary="Maintenance Frequency"
                            secondary={
                              <Chip
                                label={
                                  maintenanceHistory.length === 0
                                    ? 'No History'
                                    : maintenanceHistory.length <= 2
                                    ? 'Low'
                                    : maintenanceHistory.length <= 5
                                    ? 'Moderate'
                                    : 'High'
                                }
                                color={
                                  maintenanceHistory.length === 0
                                    ? 'default'
                                    : maintenanceHistory.length <= 2
                                    ? 'success'
                                    : maintenanceHistory.length <= 5
                                    ? 'warning'
                                    : 'error'
                                }
                                size="small"
                              />
                            }
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
                Asset Lifecycle
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Inventory />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Acquisition & Installation"
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(asset.installationDate)}
                        </Typography>
                        <Typography variant="body2">
                          Asset installed and commissioned{' '}
                          {asset.building ? `at ${asset.building}` : 'on site'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <Build />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Last Maintenance"
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(asset.lastRepairDate)}
                        </Typography>
                        <Typography variant="body2">
                          {asset.lastRepairNote ||
                            'No recent maintenance recorded'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <CheckCircle />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Current Status"
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Present
                        </Typography>
                        <Typography variant="body2">
                          Asset is currently{' '}
                          {asset.status === 'active'
                            ? 'active and in service'
                            : asset.status === 'repair'
                            ? 'undergoing repairs'
                            : 'on standby'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AssetDetail;
