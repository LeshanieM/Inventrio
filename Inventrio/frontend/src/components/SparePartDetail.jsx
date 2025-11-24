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
  QrCode,
  Store,
  Description,
  Layers,
  TrendingUp,
  AttachMoney,
} from '@mui/icons-material';

const SparePartDetail = ({ sparePart, onBack }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [usageHistory, setUsageHistory] = useState([]);

  useEffect(() => {
    if (sparePart) {
      loadSparePartUsage();
    }
  }, [sparePart]);

  const loadSparePartUsage = async () => {
    try {
      const response = await fetch('/api/spare-parts/usage'); // Adjust endpoint as needed
      const data = await response.json();
      const partUsage = data.filter(
        (record) => record.partNumber === sparePart.partNumber
      );
      setUsageHistory(partUsage);
    } catch (error) {
      console.error('Error loading usage history:', error);
    }
  };

  const calculateStockScore = () => {
    let base = 4.5;
    if (sparePart.stock <= sparePart.minimumStock) base = 2.5;
    if (sparePart.stock === 0) base = 1.0;
    return Math.max(1, Math.min(5, base));
  };

  const stockScore = calculateStockScore();

  const formatDate = (dateString) => {
    if (!dateString) return 'Not recorded';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStockConfig = (stock, minStock) => {
    if (stock === 0) {
      return { label: 'Out of Stock', color: 'error', icon: <Error /> };
    } else if (stock <= minStock) {
      return { label: 'Low Stock', color: 'warning', icon: <Warning /> };
    } else {
      return { label: 'In Stock', color: 'success', icon: <CheckCircle /> };
    }
  };

  const getStockChip = (stock, minStock) => {
    const config = getStockConfig(stock, minStock);
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

  const getUsageStatusChip = (status) => {
    const statusConfig = {
      issued: { label: 'Issued', color: 'warning' },
      received: { label: 'Received', color: 'success' },
      reordered: { label: 'Reordered', color: 'info' },
      depleted: { label: 'Depleted', color: 'error' },
    };
    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getStockStatus = () => {
    if (sparePart.stock <= sparePart.minimumStock) {
      return { label: 'Low Stock Alert', color: 'error', adequate: false };
    }
    return { label: 'Stock Adequate', color: 'success', adequate: true };
  };

  const stockStatus = getStockStatus();

  if (!sparePart) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" textAlign="center">
              No spare part selected.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const stockConfig = getStockConfig(sparePart.stock, sparePart.minimumStock);

  const tabLabels = [
    'General Info',
    `Usage History (${usageHistory.length})`,
    'Stock Status',
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
                    {sparePart.partName}
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
                    <Chip
                      label={sparePart.partNumber}
                      variant="outlined"
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      •
                    </Typography>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <Store fontSize="small" />
                      <Typography variant="body2">
                        {sparePart.vendor}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      •
                    </Typography>
                    <Typography variant="body2">
                      Stock: {sparePart.stock} {sparePart.unit}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  {getStockChip(sparePart.stock, sparePart.minimumStock)}
                </Box>
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
                label="Description"
                value={sparePart.description}
              />
              <DetailField
                icon={<Layers />}
                label="Unit"
                value={sparePart.unit}
              />
              <DetailField
                icon={<AttachMoney />}
                label="Unit Price"
                value={`$${sparePart.unitPrice.toFixed(2)}`}
                color="success.main"
              />
              <DetailField
                icon={<Store />}
                label="Vendor"
                value={sparePart.vendor}
              />
              <DetailField
                icon={<Inventory />}
                label="Current Stock"
                value={`${sparePart.stock} ${sparePart.unit}`}
                color={stockStatus.adequate ? 'success.main' : 'error.main'}
              />
              <DetailField
                icon={<Warning />}
                label="Minimum Stock"
                value={`${sparePart.minimumStock} ${sparePart.unit}`}
              />
            </Grid>
          )}
          {/* Usage History Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Usage History
              </Typography>
              {usageHistory.length === 0 ? (
                <Typography
                  color="text.secondary"
                  textAlign="center"
                  sx={{ py: 4 }}
                >
                  No usage history recorded for this spare part.
                </Typography>
              ) : (
                <List>
                  {usageHistory.map((record, index) => (
                    <React.Fragment key={record.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          <Inventory color="primary" />
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
                                {record.action || 'Stock Adjustment'}
                              </Typography>
                              {getUsageStatusChip(record.status)}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                              >
                                {formatDate(record.date)} • Qty:{' '}
                                {record.quantity} {sparePart.unit}
                                {record.technician && ` • ${record.technician}`}
                              </Typography>
                              {record.notes && (
                                <Typography variant="body2" paragraph>
                                  {record.notes}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < usageHistory.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}
          {/* Stock Status Tab */}
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
                        Stock Assessment
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
                            Overall Stock Level
                          </Typography>
                          <Typography variant="h6" color="primary.main">
                            {stockScore.toFixed(1)} / 5
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(stockScore / 5) * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'grey.800',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor:
                                stockScore >= 4
                                  ? 'success.main'
                                  : stockScore >= 3
                                  ? 'warning.main'
                                  : 'error.main',
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={stockConfig.label}
                          color={stockConfig.color}
                          variant="outlined"
                        />
                        {sparePart.stock === 0 && (
                          <Chip
                            label="Out of Stock"
                            color="error"
                            variant="outlined"
                          />
                        )}
                        {usageHistory.length > 0 && (
                          <Chip
                            label={`Usage Rate: ${usageHistory.length} events`}
                            color="info"
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
                        Stock Indicators
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Current Stock"
                            secondary={
                              <Chip
                                label={`${sparePart.stock} ${sparePart.unit}`}
                                color={
                                  sparePart.stock > 0 ? 'success' : 'error'
                                }
                                size="small"
                              />
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText
                            primary="Threshold Compliance"
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
                            primary="Reorder Frequency"
                            secondary={
                              <Chip
                                label={
                                  usageHistory.length === 0
                                    ? 'No History'
                                    : usageHistory.length <= 2
                                    ? 'Low'
                                    : usageHistory.length <= 5
                                    ? 'Moderate'
                                    : 'High'
                                }
                                color={
                                  usageHistory.length === 0
                                    ? 'default'
                                    : usageHistory.length <= 2
                                    ? 'success'
                                    : usageHistory.length <= 5
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
                Spare Part Lifecycle
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Inventory />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Initial Stocking"
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(sparePart.acquisitionDate || 'N/A')}
                        </Typography>
                        <Typography variant="body2">
                          Part added to inventory{' '}
                          {sparePart.vendor
                            ? `from ${sparePart.vendor}`
                            : 'by supplier'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <TrendingUp />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="Last Reorder"
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(sparePart.lastReorderDate || 'N/A')}
                        </Typography>
                        <Typography variant="body2">
                          {sparePart.lastReorderNote ||
                            'No recent reorder recorded'}
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
                          Part is currently {stockConfig.label.toLowerCase()}
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

export default SparePartDetail;
