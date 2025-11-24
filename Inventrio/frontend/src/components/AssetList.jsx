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
  Add,
  Warning,
  Close,
} from '@mui/icons-material';
import { assetsAPI } from '../services/api';

const AssetList = ({
  assets,
  onRefresh,
  onAssetSelect,
  onAssetEdit,
  onAddAsset,
}) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    location: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false); // New: Edit state
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [assetToEdit, setAssetToEdit] = useState(null); // New: Track editing asset
  const [editForm, setEditForm] = useState({}); // New: Edit form state
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      asset.id.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || asset.status === filters.status;
    const matchesLocation =
      !filters.location || asset.location === filters.location;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      active: { label: 'Active', color: 'success' },
      repair: { label: 'Under Repair', color: 'warning' },
      standby: { label: 'Standby', color: 'default' },
      retired: { label: 'Retired', color: 'error' },
    };
    const config = statusConfig[status] || { label: status, color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getStockChip = (quantity, minThreshold) => {
    if (quantity <= minThreshold) {
      return (
        <Tooltip title="Low stock - reorder suggested">
          <Chip
            label={`${quantity} in stock`}
            color="error"
            size="small"
            variant="outlined"
            icon={<Warning />}
          />
        </Tooltip>
      );
    }
    return <Typography variant="body2">{quantity}</Typography>;
  };

  // New: Handle edit click - open dialog with pre-filled form
  const handleEditClick = (asset) => {
    console.log('Opening edit for asset:', asset.id);
    setAssetToEdit(asset);
    setEditForm({
      name: asset.name || '',
      category: asset.category || '',
      location: asset.location || '',
      status: asset.status || 'active',
      quantity: asset.quantity || '',
      minThreshold: asset.minThreshold || '',
      building: asset.building || '',
      room: asset.room || '',
      condition: asset.condition || '',
    });
    setEditDialogOpen(true);
  };

  // New: Handle form changes
  const handleFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  // New: Submit edit
  const handleEditSubmit = async () => {
    if (!assetToEdit) return;
    setLoading(true);
    try {
      console.log('Updating asset:', assetToEdit.id, editForm);
      const payload = {
        name: editForm.name,
        category: editForm.category,
        location: editForm.location,
        status: editForm.status,
        quantity: parseInt(editForm.quantity) || 0,
        minThreshold: parseInt(editForm.minThreshold) || 0,
        building: editForm.building,
        room: editForm.room,
        condition: parseInt(editForm.condition) || undefined,
      };
      const response = await assetsAPI.update(assetToEdit.id, payload);
      console.log('Edit success:', response.data);
      setSnackbar({
        open: true,
        message: 'Asset updated successfully!',
        severity: 'success',
      });
      onRefresh(); // Reload list from backend
    } catch (error) {
      console.error('Edit error:', error);
      setSnackbar({
        open: true,
        message: `Error updating asset: ${
          error.response?.data?.message || error.message
        }`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setEditDialogOpen(false);
      setAssetToEdit(null);
      setEditForm({});
    }
  };

  // Existing delete handlers (unchanged)
  const handleDeleteClick = (asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;
    setLoading(true);
    try {
      await assetsAPI.delete(assetToDelete.id);
      setSnackbar({
        open: true,
        message: 'Asset deleted successfully!',
        severity: 'success',
      });
      onRefresh(); // Refresh the list
    } catch (error) {
      console.error('Error deleting asset:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting asset',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAssetToDelete(null);
  };

  // New: Cancel edit
  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setAssetToEdit(null);
    setEditForm({});
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Updated: Edit button calls handleEditClick (dialog), not onAssetEdit
  const handleEdit = (asset) => {
    handleEditClick(asset); // Use new dialog flow
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Filter Card - unchanged */}
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
              placeholder="Search assets..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
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
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="repair">Under Repair</MenuItem>
              <MenuItem value="standby">Standby</MenuItem>
              <MenuItem value="retired">Retired</MenuItem>
            </TextField>
            <TextField
              select
              label="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              sx={{ minWidth: 150 }}
              size="small"
            >
              <MenuItem value="">All Locations</MenuItem>
              <MenuItem value="North Bay">North Bay</MenuItem>
              <MenuItem value="South Dock">South Dock</MenuItem>
              <MenuItem value="Main Floor">Main Floor</MenuItem>
            </TextField>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={onRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAddAsset}
              sx={{ ml: 'auto' }}
            >
              Add Asset
            </Button>
          </Box>
        </CardContent>
      </Card>
      {/* Assets Table Card - updated edit button call */}
      <Card sx={{ backgroundColor: 'background.paper' }}>
        <CardHeader
          title={
            <Typography variant="h6" component="h2">
              All Assets ({filteredAssets.length})
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              {filteredAssets.length === assets.length
                ? 'Showing all assets'
                : `Filtered from ${assets.length} total assets`}
            </Typography>
          }
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        />
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ backgroundColor: 'transparent' }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  ID
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Name
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Location
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Quantity
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Min Threshold
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 'bold',
                    color: 'text.primary',
                    width: '140px',
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No assets found matching your filters.
                    </Typography>
                    {assets.length > 0 && (
                      <Button
                        variant="text"
                        onClick={() =>
                          setFilters({ search: '', status: '', location: '' })
                        }
                        sx={{ mt: 1 }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow
                    key={asset.id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: 'action.hover' },
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontWeight: 'medium' }}
                      >
                        {asset.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {asset.name}
                      </Typography>
                      {asset.category && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {asset.category}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {asset.location}
                      </Typography>
                      {(asset.building || asset.room) && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {[asset.building, asset.room]
                            .filter(Boolean)
                            .join(' • ')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{getStatusChip(asset.status)}</TableCell>
                    <TableCell>
                      {getStockChip(asset.quantity, asset.minThreshold)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {asset.minThreshold}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onAssetSelect(asset)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Asset">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleEditClick(asset)} // Updated to open dialog
                            disabled={loading}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Asset">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(asset)}
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

      {/* New: Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Asset - {assetToEdit?.name}
          <IconButton
            onClick={handleEditCancel}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name *"
              value={editForm.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              fullWidth
              size="small"
              required
            />
            <TextField
              label="Category"
              value={editForm.category}
              onChange={(e) => handleFormChange('category', e.target.value)}
              fullWidth
              size="small"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Location *"
                value={editForm.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
                select
                fullWidth
                size="small"
                required
              >
                <MenuItem value="North Bay">North Bay</MenuItem>
                <MenuItem value="South Dock">South Dock</MenuItem>
                <MenuItem value="Main Floor">Main Floor</MenuItem>
              </TextField>
              <TextField
                label="Status *"
                value={editForm.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                select
                fullWidth
                size="small"
                required
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="repair">Under Repair</MenuItem>
                <MenuItem value="standby">Standby</MenuItem>
                <MenuItem value="retired">Retired</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Quantity *"
                type="number"
                value={editForm.quantity}
                onChange={(e) => handleFormChange('quantity', e.target.value)}
                inputProps={{ min: 0 }}
                fullWidth
                size="small"
                required
              />
              <TextField
                label="Min Threshold *"
                type="number"
                value={editForm.minThreshold}
                onChange={(e) =>
                  handleFormChange('minThreshold', e.target.value)
                }
                inputProps={{ min: 0 }}
                fullWidth
                size="small"
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Building"
                value={editForm.building}
                onChange={(e) => handleFormChange('building', e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="Room"
                value={editForm.room}
                onChange={(e) => handleFormChange('room', e.target.value)}
                fullWidth
                size="small"
              />
            </Box>
            <TextField
              label="Condition (1-5)"
              type="number"
              value={editForm.condition}
              onChange={(e) => handleFormChange('condition', e.target.value)}
              inputProps={{ min: 1, max: 5 }}
              fullWidth
              size="small"
              helperText="Optional: Asset condition rating"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={
              loading ||
              !editForm.name ||
              !editForm.location ||
              !editForm.status
            }
            startIcon={loading ? <Refresh /> : null}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog - unchanged */}
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
            Are you sure you want to delete the asset{' '}
            <strong>"{assetToDelete?.name}"</strong> (ID: {assetToDelete?.id})?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. All maintenance records associated
            with this asset will also be removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <Refresh /> : <Delete />}
          >
            {loading ? 'Deleting...' : 'Delete Asset'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for notifications - unchanged */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssetList;
