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

/**
 
 * This component renders a searchable and filterable table of assets with CRUD actions.
 * Supports viewing details, inline editing via dialog, deletion with confirmation,
 * and notifications via snackbar. Integrates with API for updates and deletions.
 * 
 * Props:
 * - assets: Array of asset objects to display (e.g., [{ id, name, status, ... }]).
 * - onRefresh: Callback to refresh the asset list (e.g., refetch from API).
 * - onAssetSelect: Callback when viewing asset details (passes selected asset).
 * - onAssetEdit: Legacy prop (unused; edit handled inline via dialog).
 * - onAddAsset: Callback to open add asset form.
 */
const AssetList = ({
  assets,
  onRefresh,
  onAssetSelect,
  onAssetEdit, 
  onAddAsset,
}) => {
  // Filter state for search, status, and location
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    location: '',
  });

  // Dialog state for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Dialog state for edit form
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Selected asset for deletion
  const [assetToDelete, setAssetToDelete] = useState(null);

  // Selected asset for editing
  const [assetToEdit, setAssetToEdit] = useState(null);

  // Form state for edit dialog fields
  const [editForm, setEditForm] = useState({});

  // Loading state for API operations
  const [loading, setLoading] = useState(false);

  // Snackbar state for success/error notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  /**
   * Filters assets based on search term, status, and location
   * Uses case-insensitive partial matching for search on name/ID
   */
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      asset.id.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || asset.status === filters.status;
    const matchesLocation =
      !filters.location || asset.location === filters.location;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  /**
   * Updates filter state for a specific key (search, status, location)
   * @param {string} key - Filter key to update
   * @param {string} value - New filter value
   */
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Renders a Chip for asset status with appropriate color and label
   * @param {string} status - Asset status (e.g., 'active', 'repair')
   * @returns {JSX.Element} Status Chip
   */
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

  /**
   * Renders stock quantity display; shows warning Chip if below threshold
   * @param {number} quantity - Current asset quantity
   * @param {number} minThreshold - Minimum stock threshold
   * @returns {JSX.Element} Quantity display or warning Chip
   */
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

  /**
   * Opens edit dialog with pre-filled form data from selected asset
   * Logs asset ID for debugging
   * @param {object} asset - Asset to edit
   */
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

  /**
   * Handles changes to edit form fields
   * @param {string} field - Form field name (e.g., 'name')
   * @param {string} value - New field value
   */
  const handleFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Submits edit form to API, updates asset, shows notification, and refreshes list
   * Handles errors and resets state on completion
   */
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

  /**
   * Opens delete confirmation dialog for selected asset
   * @param {object} asset - Asset to delete
   */
  const handleDeleteClick = (asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  /**
   * Confirms and executes asset deletion via API, shows notification, and refreshes list
   * Handles errors and resets state
   */
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

  /**
   * Closes delete confirmation dialog and resets state
   */
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAssetToDelete(null);
  };

  /**
   * Closes edit dialog and resets form state
   */
  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setAssetToEdit(null);
    setEditForm({});
  };

  /**
   * Closes snackbar notification
   */
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  /**
   * Handles edit button click; delegates to dialog flow (ignores onAssetEdit prop)
   * @param {object} asset - Asset to edit
   */
  const handleEdit = (asset) => {
    handleEditClick(asset); // Use new dialog flow
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Filter and Action Card */}
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
            {/* Search Input */}
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
            {/* Status Filter Select */}
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
            {/* Location Filter Select */}
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
            {/* Refresh Button */}
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={onRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
            {/* Add Asset Button */}
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

      {/* Assets Table Card */}
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
                    {/* ID Cell */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontWeight: 'medium' }}
                      >
                        {asset.id}
                      </Typography>
                    </TableCell>
                    {/* Name and Category Cell */}
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
                    {/* Location Details Cell */}
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
                    {/* Status Chip Cell */}
                    <TableCell>{getStatusChip(asset.status)}</TableCell>
                    {/* Quantity Chip Cell */}
                    <TableCell>
                      {getStockChip(asset.quantity, asset.minThreshold)}
                    </TableCell>
                    {/* Min Threshold Cell */}
                    <TableCell>
                      <Typography variant="body2">
                        {asset.minThreshold}
                      </Typography>
                    </TableCell>
                    {/* Actions Cell */}
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {/* View Button */}
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onAssetSelect(asset)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {/* Edit Button */}
                        <Tooltip title="Edit Asset">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleEditClick(asset)} // open dialog
                            disabled={loading}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {/* Delete Button */}
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

      {/* Edit Asset Dialog */}
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
            {/* Name Field */}
            <TextField
              label="Name *"
              value={editForm.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              fullWidth
              size="small"
              required
            />
            {/* Category Field */}
            <TextField
              label="Category"
              value={editForm.category}
              onChange={(e) => handleFormChange('category', e.target.value)}
              fullWidth
              size="small"
            />
            {/* Location and Status Row */}
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
            {/* Quantity and Min Threshold Row */}
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
            {/* Building and Room Row */}
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
            {/* Condition Field */}
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
          {/* Cancel Button */}
          <Button onClick={handleEditCancel} disabled={loading}>
            Cancel
          </Button>
          {/* Submit Button */}
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
            Are you sure you want to delete the asset{' '}
            <strong>"{assetToDelete?.name}"</strong> (ID: {assetToDelete?.id})?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. All maintenance records associated
            with this asset will also be removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          {/* Cancel Button */}
          <Button onClick={handleDeleteCancel} disabled={loading}>
            Cancel
          </Button>
          {/* Delete Button */}
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

      {/* Snackbar for notifications */}
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
