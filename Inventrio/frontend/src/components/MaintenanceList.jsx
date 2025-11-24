import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Typography,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Refresh,
  Visibility,
  Edit,
  Delete,
  Build,
  Close,
  Link as LinkIcon,
  Warning,
} from '@mui/icons-material';
// Remove: import { maintenanceAPI } from '../services/api'; (no longer used here)

const MaintenanceList = ({
  maintenance,
  onRefresh,
  onMaintenanceSelect,
  onMaintenanceUpdate, // Add this
  onMaintenanceDelete, // Add this
  onAssetSelect,
}) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    asset: '',
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Debug: Log the maintenance data to see what we're working with
  console.log('Maintenance data:', maintenance);

  if (!maintenance || maintenance.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" align="center" color="text.secondary">
              No maintenance records available
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={onRefresh}
              >
                Refresh Data
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const filteredMaintenance = maintenance.filter((record) => {
    if (!record) return false;

    const matchesSearch =
      (record.asset &&
        record.asset.toLowerCase().includes(filters.search.toLowerCase())) ||
      (record.id &&
        record.id.toLowerCase().includes(filters.search.toLowerCase())) ||
      (record.action &&
        record.action.toLowerCase().includes(filters.search.toLowerCase()));

    const matchesStatus = !filters.status || record.status === filters.status;
    const matchesAsset = !filters.asset || record.asset === filters.asset;

    return matchesSearch && matchesStatus && matchesAsset;
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditClick = (record) => {
    console.log('Editing record:', record);
    setSelectedRecord(record);
    setEditForm({
      asset: record.asset || '',
      assetId: record.assetId || '',
      action: record.action || '',
      description: record.description || '',
      technician: record.technician || '',
      status: record.status || 'pending',
      condition: record.condition || '',
      date: record.date
        ? new Date(record.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (record) => {
    console.log('Deleting record:', record);
    setMaintenanceToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedRecord) return;
    setLoading(true);
    try {
      console.log('Submitting update for:', selectedRecord.id, editForm);

      // Use the passed prop instead of direct API
      const updatedRecord = {
        ...selectedRecord, // Preserve original fields like id
        ...editForm,
        // Ensure date is properly formatted if needed (string for API)
        date: editForm.date,
      };
      await onMaintenanceUpdate(updatedRecord);

      console.log('Update completed via prop handler');

      setSnackbar({
        open: true,
        message: 'Maintenance record updated successfully!',
        severity: 'success',
      });

      // REMOVED: onRefresh(); // Avoid resetting local state with mock data
    } catch (error) {
      console.error('Error updating maintenance record:', error);
      // The prop handler already logs/updates local on error, but show snackbar here
      setSnackbar({
        open: true,
        message: `Error updating maintenance record: ${
          error.message || 'Unknown error'
        }`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setEditDialogOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!maintenanceToDelete) return;
    setLoading(true);
    try {
      console.log('Deleting record:', maintenanceToDelete.id);

      // Use the passed prop instead of direct API
      await onMaintenanceDelete(maintenanceToDelete.id);

      console.log('Delete completed via prop handler');

      setSnackbar({
        open: true,
        message: 'Maintenance record deleted successfully!',
        severity: 'success',
      });

      // REMOVED: onRefresh(); // Avoid resetting local state with mock data
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      // The prop handler already logs/updates local on error, but show snackbar here
      setSnackbar({
        open: true,
        message: `Error deleting maintenance record: ${
          error.message || 'Unknown error'
        }`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setMaintenanceToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setMaintenanceToDelete(null);
  };

  const handleFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleViewAsset = (record) => {
    if (onAssetSelect && record.assetId) {
      onAssetSelect(record.assetId);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      completed: { label: 'Completed', color: 'success' },
      'in-progress': { label: 'In Progress', color: 'warning' },
      pending: { label: 'Pending', color: 'default' },
      cancelled: { label: 'Cancelled', color: 'error' },
    };
    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getConditionChip = (condition) => {
    if (!condition)
      return (
        <Typography variant="body2" color="text.secondary">
          —
        </Typography>
      );

    let color = 'default';
    if (condition >= 4) color = 'success';
    else if (condition >= 3) color = 'warning';
    else color = 'error';
    return (
      <Chip
        label={`${condition}/5`}
        color={color}
        size="small"
        variant="outlined"
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const uniqueAssets = [
    ...new Set(maintenance.map((record) => record.asset).filter(Boolean)),
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Filter Card */}
      <Card sx={{ mb: 3, backgroundColor: 'background.paper' }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <TextField
              placeholder="Search maintenance records..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
              size="small"
            />

            <TextField
              select
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              sx={{ minWidth: 150 }}
              size="small"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </TextField>
            <TextField
              select
              label="Asset"
              value={filters.asset}
              onChange={(e) => handleFilterChange('asset', e.target.value)}
              sx={{ minWidth: 150 }}
              size="small"
            >
              <MenuItem value="">All Assets</MenuItem>
              {uniqueAssets.map((asset) => (
                <MenuItem key={asset} value={asset}>
                  {asset}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={onRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>
      {/* Maintenance Table Card */}
      <Card sx={{ backgroundColor: 'background.paper' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Build />
              <Typography variant="h6" component="h2">
                Maintenance History ({filteredMaintenance.length})
              </Typography>
            </Box>
          }
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        />

        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Work Order</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Asset</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Technician</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Condition</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '140px' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMaintenance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No maintenance records found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaintenance.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {record.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {record.asset}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {record.assetId}
                          </Typography>
                        </Box>
                        {record.assetId && (
                          <Tooltip title="View Asset">
                            <IconButton
                              size="small"
                              onClick={() => handleViewAsset(record)}
                            >
                              <LinkIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(record.date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {record.action}
                        </Typography>
                        {record.description && (
                          <Typography variant="caption" color="text.secondary">
                            {record.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {record.technician || 'Not assigned'}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(record.status)}</TableCell>
                    <TableCell>{getConditionChip(record.condition)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => onMaintenanceSelect(record)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Record">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(record)}
                            disabled={loading}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Record">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(record)}
                            disabled={loading}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Maintenance Record
          <IconButton
            onClick={() => setEditDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Asset Name"
                value={editForm.asset}
                onChange={(e) => handleFormChange('asset', e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="Asset ID"
                value={editForm.assetId}
                onChange={(e) => handleFormChange('assetId', e.target.value)}
                fullWidth
                size="small"
              />
            </Box>

            <TextField
              label="Maintenance Action"
              value={editForm.action}
              onChange={(e) => handleFormChange('action', e.target.value)}
              fullWidth
              size="small"
            />

            <TextField
              label="Description"
              value={editForm.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              multiline
              rows={3}
              fullWidth
              size="small"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Technician"
                value={editForm.technician}
                onChange={(e) => handleFormChange('technician', e.target.value)}
                fullWidth
                size="small"
              />

              <TextField
                select
                label="Status"
                value={editForm.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Condition (1-5)"
                type="number"
                value={editForm.condition || ''}
                onChange={(e) =>
                  handleFormChange('condition', parseInt(e.target.value) || '')
                }
                inputProps={{ min: 1, max: 5 }}
                fullWidth
                size="small"
              />

              <TextField
                label="Date"
                type="date"
                value={editForm.date}
                onChange={(e) => handleFormChange('date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="error" />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete maintenance record "
            {maintenanceToDelete?.id}" for "{maintenanceToDelete?.asset}"? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MaintenanceList;
