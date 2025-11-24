import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme
} from '@mui/material';
import {
  Doughnut
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import {
  Inventory,
  CheckCircle,
  Build,
  Warning,
  TrendingUp,
  History,
  Store as StoreIcon // For spare parts
} from '@mui/icons-material';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ stats, assets, maintenance, spareParts = [] }) => { // Add spareParts prop
  const theme = useTheme();
  const [lowStockAssets, setLowStockAssets] = useState([]);
  const [lowStockSpareParts, setLowStockSpareParts] = useState([]); // New: Low stock spares
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);

  useEffect(() => {
    loadLowStockAssets();
    loadLowStockSpareParts(); // New
    loadMaintenanceHistory();
  }, [assets, spareParts, maintenance]); // Include spareParts

  const loadLowStockAssets = () => {
    const lowStock = assets.filter(
      (asset) => asset.quantity <= asset.minThreshold
    );
    setLowStockAssets(lowStock);
  };

  const loadLowStockSpareParts = () => { // New
    const lowStock = spareParts.filter(
      (part) => part.stock <= part.minimumStock
    );
    setLowStockSpareParts(lowStock);
  };

  const loadMaintenanceHistory = () => {
    const recentMaintenance = maintenance
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    setMaintenanceHistory(recentMaintenance);
  };

  // Existing asset chart
  const assetChartData = {
    labels: ['Active', 'Under Repair'],
    datasets: [
      {
        data: [stats.active, stats.repair],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.warning.main
        ],
        borderColor: [
          theme.palette.background.paper,
          theme.palette.background.paper
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  // New: Spare parts stock chart (Adequate vs Low/Out of Stock)
  const adequateSpareParts = spareParts.filter(part => part.stock > part.minimumStock).length;
  const lowSpareParts = spareParts.length - adequateSpareParts;
  const spareChartData = {
    labels: ['Adequate Stock', 'Low/Out of Stock'],
    datasets: [
      {
        data: [adequateSpareParts, lowSpareParts],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.error.main
        ],
        borderColor: [
          theme.palette.background.paper,
          theme.palette.background.paper
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme.palette.text.secondary,
          boxWidth: 10,
          boxHeight: 10,
          padding: 8,
          font: {
            size: 10,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '68%',
  };

  const completedMaintenance = maintenance.filter(
    (m) => m.status === 'completed'
  ).length;
  const pendingMaintenance = maintenance.filter(
    (m) => m.status === 'pending' || m.status === 'in-progress'
  ).length;

  const getStatusChip = (status) => {
    const statusConfig = {
      completed: { label: 'Completed', color: 'success' },
      'in-progress': { label: 'In Progress', color: 'warning' },
      pending: { label: 'Pending', color: 'default' }
    };
    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const StatCard = ({ icon, title, value, subtitle, color = 'primary' }) => (
    <Card sx={{ height: '100%', backgroundColor: 'background.paper' }}>
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}
        >
          {React.cloneElement(icon, {
            sx: { fontSize: 40, color: `${color}.main` }
          })}
        </Box>
        <Typography variant="h4" component="div" fontWeight="bold" gutterBottom>
          {value}
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Summary Stats Row - Updated with Spare Parts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<Inventory />}
            title="Total Assets"
            value={stats.total}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<CheckCircle />}
            title="Active"
            value={stats.active}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<Build />}
            title="Under Repair"
            value={stats.repair}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<History />}
            title="Maintenance"
            value={maintenance.length}
            subtitle={`${completedMaintenance} completed, ${pendingMaintenance} pending`}
            color="info"
          />
        </Grid>
        {/* New: Spare Parts Stats */}
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<StoreIcon />}
            title="Total Spare Parts"
            value={spareParts.length}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            icon={<Warning />}
            title="Low Stock Spares"
            value={lowStockSpareParts.length}
            subtitle={lowStockSpareParts.length > 0 ? 'Reorder needed' : 'All good'}
            color="error"
          />
        </Grid>
      </Grid>
      {/* Middle Row - Charts (Assets + Spare Parts) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Asset Status Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp />
                Asset Status
              </Typography>
              <Box sx={{ height: 300, position: 'relative' }}>
                <Doughnut data={assetChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* New: Spare Parts Stock Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StoreIcon />
                Spare Parts Stock
              </Typography>
              <Box sx={{ height: 300, position: 'relative' }}>
                <Doughnut data={spareChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Low Stock Sections Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Low Stock Assets - Existing */}
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: 'background.paper', height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning />
                  Low Stock Assets
                </Typography>
                <Chip
                  label={lowStockAssets.length}
                  color={lowStockAssets.length > 0 ? 'error' : 'success'}
                  variant="outlined"
                />
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {lowStockAssets.length === 0 ? (
                  <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                    All stock levels are healthy.
                  </Typography>
                ) : (
                  <List dense>
                    {lowStockAssets.map((asset, index) => (
                      <React.Fragment key={asset.id}>
                        <ListItem>
                          <ListItemIcon>
                            <Warning color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" fontWeight="medium">
                                  {asset.name}
                                </Typography>
                                <Chip
                                  label={`${asset.quantity} in stock`}
                                  color="error"
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Min: {asset.minThreshold} • ID: {asset.id}
                                </Typography>
                                <Typography variant="caption" color="error.main">
                                  Reorder suggested
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < lowStockAssets.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* New: Low Stock Spare Parts */}
        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: 'background.paper', height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning />
                  Low Stock Spare Parts
                </Typography>
                <Chip
                  label={lowStockSpareParts.length}
                  color={lowStockSpareParts.length > 0 ? 'error' : 'success'}
                  variant="outlined"
                />
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {lowStockSpareParts.length === 0 ? (
                  <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                    All spare parts stock is healthy.
                  </Typography>
                ) : (
                  <List dense>
                    {lowStockSpareParts.map((part, index) => (
                      <React.Fragment key={part.partNumber}>
                        <ListItem>
                          <ListItemIcon>
                            <Warning color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" fontWeight="medium">
                                  {part.partName}
                                </Typography>
                                <Chip
                                  label={`${part.stock} ${part.unit}`}
                                  color="error"
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Min: {part.minimumStock} {part.unit} • PN: {part.partNumber}
                                </Typography>
                                <Typography variant="caption" color="error.main">
                                  Reorder suggested
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < lowStockSpareParts.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Recent Maintenance - Existing (unchanged) */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ backgroundColor: 'background.paper' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <History />
                  Recent Maintenance
                </Typography>
                <Chip
                  label={maintenanceHistory.length}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              {maintenanceHistory.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                  No maintenance records found.
                </Typography>
              ) : (
                <List>
                  {maintenanceHistory.map((entry, index) => (
                    <React.Fragment key={entry.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="body1" fontWeight="medium">
                                {entry.asset}
                              </Typography>
                              {getStatusChip(entry.status)}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {formatDate(entry.date)} • {entry.id}
                                {entry.technician && ` • ${entry.technician}`}
                              </Typography>
                              <Typography variant="body1" paragraph sx={{ mb: 1 }}>
                                {entry.action}
                              </Typography>
                              {entry.condition && (
                                <Chip
                                  label={`Condition: ${entry.condition}/5`}
                                  size="small"
                                  variant="outlined"
                                  color={
                                    entry.condition >= 4 ? 'success' :
                                    entry.condition >= 3 ? 'warning' : 'error'
                                  }
                                />
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;