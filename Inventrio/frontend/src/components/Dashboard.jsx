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
  useTheme,
} from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {
  Inventory,
  CheckCircle,
  Build,
  Warning,
  TrendingUp,
  History,
  Store as StoreIcon, // For spare parts
  Pending as PendingIcon, // For purchase requests
} from '@mui/icons-material';

// Register Chart.js components for doughnut charts
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * This component provides an overview of the asset management system,
 * displaying key statistics, charts for asset status, spare parts stock,
 * and purchase requests, along with lists for low stock items and recent maintenance.
 * 
 * Props:
 * - stats: Object with asset statistics (e.g., { total: number, active: number, repair: number }).
 * - assets: Array of asset objects (e.g., [{ id, name, quantity, minThreshold, status, ... }]).
 * - maintenance: Array of maintenance records (e.g., [{ id, asset, date, status, action, ... }]).
 * - spareParts: Array of spare part objects (e.g., [{ partNumber, partName, stock, minimumStock, unit, ... }]).
 * - purchaseRequests: Array of purchase request objects (e.g., [{ id, partNameOrId, status, requiredQuantity, preferredVendor, createdAt, ... }]).
 */
const Dashboard = ({
  stats,
  assets,
  maintenance,
  spareParts = [],
  purchaseRequests = [],
}) => {
  // Access Material-UI theme for consistent styling
  const theme = useTheme();

  // State for low stock assets (filtered from props)
  const [lowStockAssets, setLowStockAssets] = useState([]);

  // State for low stock spare parts (filtered from props)
  const [lowStockSpareParts, setLowStockSpareParts] = useState([]);

  // State for recent maintenance history (sorted and sliced)
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);

  // State for pending purchase requests (filtered, sorted, and sliced)
  const [pendingRequests, setPendingRequests] = useState([]);

  // Effect to load derived data when props change
  useEffect(() => {
    loadLowStockAssets();
    loadLowStockSpareParts();
    loadMaintenanceHistory();
    loadPendingRequests();
  }, [assets, spareParts, maintenance, purchaseRequests]);

  /**
   * Filters assets where quantity <= minThreshold
   * Updates lowStockAssets state
   */
  const loadLowStockAssets = () => {
    const lowStock = assets.filter(
      (asset) => asset.quantity <= asset.minThreshold
    );
    setLowStockAssets(lowStock);
  };

  /**
   * Filters spare parts where stock <= minimumStock
   * Updates lowStockSpareParts state
   */
  const loadLowStockSpareParts = () => {
    const lowStock = spareParts.filter(
      (part) => part.stock <= part.minimumStock
    );
    setLowStockSpareParts(lowStock);
  };

  /**
   * Sorts maintenance records by date (descending) and takes top 5
   * Updates maintenanceHistory state
   */
  const loadMaintenanceHistory = () => {
    const recentMaintenance = maintenance
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    setMaintenanceHistory(recentMaintenance);
  };

  /**
   * Filters pending purchase requests, sorts by createdAt (descending), and takes top 5
   * Updates pendingRequests state
   */
  const loadPendingRequests = () => {
    const pending = purchaseRequests
      .filter((req) => req.status === 'pending')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    setPendingRequests(pending);
  };

  // Chart data for asset status (Active vs Under Repair)
  const assetChartData = {
    labels: ['Active', 'Under Repair'],
    datasets: [
      {
        data: [stats.active, stats.repair],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.warning.main,
        ],
        borderColor: [
          theme.palette.background.paper,
          theme.palette.background.paper,
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  // Calculate counts for spare parts chart (Adequate vs Low/Out of Stock)
  const adequateSpareParts = spareParts.filter(
    (part) => part.stock > part.minimumStock
  ).length;
  const lowSpareParts = spareParts.length - adequateSpareParts;

  // Chart data for spare parts stock levels
  const spareChartData = {
    labels: ['Adequate Stock', 'Low/Out of Stock'],
    datasets: [
      {
        data: [adequateSpareParts, lowSpareParts],
        backgroundColor: [theme.palette.success.main, theme.palette.error.main],
        borderColor: [
          theme.palette.background.paper,
          theme.palette.background.paper,
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  // Calculate counts for purchase requests chart (Pending vs Others)
  const pendingRequestsCount = purchaseRequests.filter(
    (req) => req.status === 'pending'
  ).length;
  const otherRequestsCount = purchaseRequests.length - pendingRequestsCount;

  // Chart data for purchase requests status
  const requestsChartData = {
    labels: ['Pending', 'Approved/Rejected/Completed'],
    datasets: [
      {
        data: [pendingRequestsCount, otherRequestsCount],
        backgroundColor: [theme.palette.warning.main, theme.palette.info.main],
        borderColor: [
          theme.palette.background.paper,
          theme.palette.background.paper,
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  // Common options for all doughnut charts
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

  // Calculate maintenance counts for stats display
  const completedMaintenance = maintenance.filter(
    (m) => m.status === 'completed'
  ).length;
  const pendingMaintenance = maintenance.filter(
    (m) => m.status === 'pending' || m.status === 'in-progress'
  ).length;

  /**
   * Renders a Chip for maintenance status with appropriate color and label
   * @param {string} status - Maintenance status (e.g., 'completed', 'in-progress')
   * @returns {JSX.Element} Status Chip
   */
  const getStatusChip = (status) => {
    const statusConfig = {
      completed: { label: 'Completed', color: 'success' },
      'in-progress': { label: 'In Progress', color: 'warning' },
      pending: { label: 'Pending', color: 'default' },
    };
    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  /**
   * Formats a date string to a short locale format (e.g., 'Nov 24, 2025')
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Reusable StatCard component for displaying key metrics with icons
   * @param {object} props - Component props
   * @param {JSX.Element} props.icon - Icon to display
   * @param {string} props.title - Card title
   * @param {number|string} props.value - Main metric value
   * @param {string} [props.subtitle] - Optional subtitle
   * @param {string} [props.color='primary'] - Icon and text color
   * @returns {JSX.Element} Stat card
   */
  const StatCard = ({ icon, title, value, subtitle, color = 'primary' }) => (
    <Card sx={{ height: '100%', backgroundColor: 'background.paper' }}>
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          {React.cloneElement(icon, {
            sx: { fontSize: 40, color: `${color}.main` },
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
      {/* Header with Logo and Title */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img
            src="/logo.png"
            alt="Company Logo"
            style={{ height: 50, width: 'auto' }}
          />
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            color="primary.main"
          >
            Dashboard Overview
          </Typography>
        </Box>
      </Box>

      {/* Summary Stats Row - Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Assets Card */}
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            icon={<Inventory />}
            title="Total Assets"
            value={stats.total}
            color="primary"
          />
        </Grid>
        {/* Active Assets Card */}
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            icon={<CheckCircle />}
            title="Active"
            value={stats.active}
            color="success"
          />
        </Grid>
        {/* Under Repair Assets Card */}
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            icon={<Build />}
            title="Under Repair"
            value={stats.repair}
            color="warning"
          />
        </Grid>
        {/* Maintenance Records Card */}
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            icon={<History />}
            title="Maintenance"
            value={maintenance.length}
            subtitle={`${completedMaintenance} completed, ${pendingMaintenance} pending`}
            color="info"
          />
        </Grid>
        {/* Total Spare Parts Card */}
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            icon={<StoreIcon />}
            title="Total Spare Parts"
            value={spareParts.length}
            color="secondary"
          />
        </Grid>
        {/* Low Stock Spare Parts Card */}
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            icon={<Warning />}
            title="Low Stock Spares"
            value={lowStockSpareParts.length}
            subtitle={
              lowStockSpareParts.length > 0 ? 'Reorder needed' : 'All good'
            }
            color="error"
          />
        </Grid>
        {/* Purchase Requests Card */}
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            icon={<PendingIcon />}
            title="Purchase Requests"
            value={purchaseRequests.length}
            subtitle={`${pendingRequestsCount} pending`}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Middle Row - Doughnut Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Asset Status Doughnut Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <TrendingUp />
                Asset Status
              </Typography>
              <Box sx={{ height: 250, position: 'relative' }}>
                <Doughnut data={assetChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Spare Parts Stock Doughnut Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <StoreIcon />
                Spare Parts Stock
              </Typography>
              <Box sx={{ height: 250, position: 'relative' }}>
                <Doughnut data={spareChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Purchase Requests Status Doughnut Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <PendingIcon />
                Purchase Requests
              </Typography>
              <Box sx={{ height: 250, position: 'relative' }}>
                <Doughnut data={requestsChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Low Stock & Pending Sections Row - Lists */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Low Stock Assets List */}
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: 'background.paper', height: '100%' }}>
            <CardContent
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
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
                  <Typography
                    color="text.secondary"
                    textAlign="center"
                    sx={{ py: 4 }}
                  >
                    All stock levels are healthy.
                  </Typography>
                ) : (
                  <List dense>
                    {lowStockAssets.slice(0, 3).map((asset, index) => (
                      <React.Fragment key={asset.id}>
                        <ListItem>
                          <ListItemIcon>
                            <Warning color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
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
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Min: {asset.minThreshold} • ID: {asset.id}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < 2 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Low Stock Spare Parts List */}
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: 'background.paper', height: '100%' }}>
            <CardContent
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Warning />
                  Low Stock Spares
                </Typography>
                <Chip
                  label={lowStockSpareParts.length}
                  color={lowStockSpareParts.length > 0 ? 'error' : 'success'}
                  variant="outlined"
                />
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {lowStockSpareParts.length === 0 ? (
                  <Typography
                    color="text.secondary"
                    textAlign="center"
                    sx={{ py: 4 }}
                  >
                    All spare parts stock is healthy.
                  </Typography>
                ) : (
                  <List dense>
                    {lowStockSpareParts.slice(0, 3).map((part, index) => (
                      <React.Fragment key={part.partNumber}>
                        <ListItem>
                          <ListItemIcon>
                            <Warning color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
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
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Min: {part.minimumStock} {part.unit} • PN:{' '}
                                {part.partNumber}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < 2 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Pending Purchase Requests List */}
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: 'background.paper', height: '100%' }}>
            <CardContent
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <PendingIcon />
                  Pending Requests
                </Typography>
                <Chip
                  label={pendingRequests.length}
                  color={pendingRequests.length > 0 ? 'warning' : 'success'}
                  variant="outlined"
                />
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {pendingRequests.length === 0 ? (
                  <Typography
                    color="text.secondary"
                    textAlign="center"
                    sx={{ py: 4 }}
                  >
                    No pending purchase requests.
                  </Typography>
                ) : (
                  <List dense>
                    {pendingRequests.map((request, index) => (
                      <React.Fragment key={request.id}>
                        <ListItem>
                          <ListItemIcon>
                            <PendingIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <Typography variant="body1" fontWeight="medium">
                                  {request.partNameOrId}
                                </Typography>
                                <Chip
                                  label={request.requiredQuantity}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Qty: {request.requiredQuantity} • Vendor:{' '}
                                {request.preferredVendor || 'Any'}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < pendingRequests.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Recent Maintenance List */}
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: 'background.paper', height: '100%' }}>
            <CardContent
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <History />
                  Recent Maintenance
                </Typography>
                <Chip
                  label={maintenanceHistory.length}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {maintenanceHistory.length === 0 ? (
                  <Typography
                    color="text.secondary"
                    textAlign="center"
                    sx={{ py: 4 }}
                  >
                    No maintenance records found.
                  </Typography>
                ) : (
                  <List dense>
                    {maintenanceHistory.slice(0, 3).map((entry, index) => (
                      <React.Fragment key={entry.id}>
                        <ListItem>
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
                                  {entry.asset}
                                </Typography>
                                {getStatusChip(entry.status)}
                              </Box>
                            }
                            secondary={
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {formatDate(entry.date)} • {entry.action}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < 2 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;