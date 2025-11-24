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
  Pending,
  CheckCircle,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { purchaseRequestsAPI } from '../services/api';

const PurchaseRequestList = ({
  purchaseRequests,
  onRefresh,
  onPurchaseRequestSelect,
  onPurchaseRequestEdit,
  onAddPurchaseRequest,
}) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    vendor: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [requestToEdit, setRequestToEdit] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const filteredRequests = purchaseRequests.filter((request) => {
    const matchesSearch =
      request.partNameOrId.toLowerCase().includes(filters.search.toLowerCase()) ||
      (request.partNumber && request.partNumber.toLowerCase().includes(filters.search.toLowerCase()));
    const matchesStatus = !filters.status || request.status === filters.status;
    const matchesVendor = !filters.vendor || request.preferredVendor.toLowerCase().includes(filters.vendor.toLowerCase());
    return matchesSearch && matchesStatus && matchesVendor;
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'warning', icon: <Pending /> },
      approved: { label: 'Approved', color: 'success', icon: <CheckCircle /> },
      rejected: { label: 'Rejected', color: 'error', icon: <CancelIcon /> },
      completed: { label: 'Completed', color: 'default', icon: <CheckCircle /> },
    };
    const config = statusConfig[status] || { label: status, color: 'default' };
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  const handleEditClick = (request) => {
    console.log('Opening edit for request:', request.id);
    setRequestToEdit(request);
    setEditForm({
      partNameOrId: request.partNameOrId || '',
      requiredQuantity: request.requiredQuantity || '',
      reason: request.reason || '',
      preferredVendor: request.preferredVendor || '',
      status: request.status || 'pending',
    });
    setEditDialogOpen(true);
  };

  const handleFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async () => {
    if (!requestToEdit) return;
    setLoading(true);
    try {
      console.log('Updating request:', requestToEdit.id, editForm);
      const payload = {
        partNameOrId: editForm.partNameOrId,
        requiredQuantity: parseInt(editForm.requiredQuantity) || 0,
        reason: editForm.reason,
        preferredVendor: editForm.preferredVendor,
        status: editForm.status,
      };
      const response = await purchaseRequestsAPI.update(requestToEdit.id, payload);
      console.log('Edit success:', response.data);
      setSnackbar({
        open: true,
        message: 'Purchase request updated successfully!',
        severity: 'success',
      });
      onRefresh(); // Reload list from backend
    } catch (error) {
      console.error('Edit error:', error);
      setSnackbar({
        open: true,
        message: `Error updating request: ${error.response?.data?.message || error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setEditDialogOpen(false);
      setRequestToEdit(null);
      setEditForm({});
    }
  };

  const handleDeleteClick = (request) => {
    setRequestToDelete(request);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!requestToDelete) return;
    setLoading(true);
    try {
      await purchaseRequestsAPI.delete(requestToDelete.id);
      setSnackbar({
        open: true,
        message: 'Purchase request deleted successfully!',
        severity: 'success',
      });
      onRefresh(); // Refresh the list
    } catch (error) {
      console.error('Error deleting request:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting request',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRequestToDelete(null);
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setRequestToEdit(null);
    setEditForm({});
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEdit = (request) => {
    handleEditClick(request);
  };

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
              placeholder="Search requests..."
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
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
            <TextField
              label="Vendor"
              value={filters.vendor}
              onChange={(e) => handleFilterChange('vendor', e.target.value)}
              sx={{ minWidth: 150 }}
              size="small"
            />
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
              onClick={onAddPurchaseRequest}
              sx={{ ml: 'auto' }}
            >
              Add Request
            </Button>
          </Box>
        </CardContent>
      </Card>
      {/* Purchase Requests Table Card */}
      <Card sx={{ backgroundColor: 'background.paper' }}>
        <CardHeader
          title={
            <Typography variant="h6" component="h2">
              All Purchase Requests ({filteredRequests.length})
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              {filteredRequests.length === purchaseRequests.length
                ? 'Showing all requests'
                : `Filtered from ${purchaseRequests.length} total requests`}
            </Typography>
          }
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        />
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ backgroundColor: 'transparent' }}
        >
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Request ID
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Part Name/ID
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Required Quantity
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Vendor
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Submitted Date
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
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No purchase requests found matching your filters.
                    </Typography>
                    {purchaseRequests.length > 0 && (
                      <Button
                        variant="text"
                        onClick={() =>
                          setFilters({ search: '', status: '', vendor: '' })
                        }
                        sx={{ mt: 1 }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow
                    key={request.id}
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
                        {request.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {request.partNameOrId}
                      </Typography>
                      {request.partNumber && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          PN: {request.partNumber}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {request.requiredQuantity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {request.preferredVendor}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(request.status)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onPurchaseRequestSelect(request)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Request">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleEditClick(request)}
                            disabled={loading || request.status === 'completed'}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Request">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(request)}
                            disabled={loading || request.status === 'completed'}
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
        onClose={handleEditCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Purchase Request - {requestToEdit?.partNameOrId}
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
              label="Part Name or ID *"
              value={editForm.partNameOrId}
              onChange={(e) => handleFormChange('partNameOrId', e.target.value)}
              fullWidth
              size="small"
              required
            />
            <TextField
              label="Required Quantity *"
              type="number"
              value={editForm.requiredQuantity}
              onChange={(e) => handleFormChange('requiredQuantity', e.target.value)}
              inputProps={{ min: 1 }}
              fullWidth
              size="small"
              required
            />
            <TextField
              label="Reason"
              value={editForm.reason}
              onChange={(e) => handleFormChange('reason', e.target.value)}
              multiline
              rows={3}
              fullWidth
              size="small"
            />
            <TextField
              label="Preferred Vendor"
              value={editForm.preferredVendor}
              onChange={(e) => handleFormChange('preferredVendor', e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Status *"
              value={editForm.status}
              onChange={(e) => handleFormChange('status', e.target.value)}
              select
              fullWidth
              size="small"
              required
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
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
              !editForm.partNameOrId ||
              !editForm.requiredQuantity ||
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
            Are you sure you want to delete the purchase request for{' '}
            <strong>"{requestToDelete?.partNameOrId}"</strong> (ID: {requestToDelete?.id})?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
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
            {loading ? 'Deleting...' : 'Delete Request'}
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

export default PurchaseRequestList;