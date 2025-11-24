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
  AttachMoney,
} from '@mui/icons-material';
import { sparePartsAPI } from '../services/api';

const SparePartList = ({
  spareParts,
  onRefresh,
  onSparePartSelect,
  onSparePartEdit,
  onAddSparePart,
}) => {
  const [filters, setFilters] = useState({
    search: '',
    unit: '',
    vendor: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [sparePartToDelete, setSparePartToDelete] = useState(null);
  const [sparePartToEdit, setSparePartToEdit] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const filteredSpareParts = spareParts.filter((part) => {
    const matchesSearch =
      part.partName.toLowerCase().includes(filters.search.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(filters.search.toLowerCase());
    const matchesUnit = !filters.unit || part.unit === filters.unit;
    const matchesVendor = !filters.vendor || part.vendor.toLowerCase().includes(filters.vendor.toLowerCase());
    return matchesSearch && matchesUnit && matchesVendor;
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getStockChip = (stock, minStock) => {
    if (stock <= minStock) {
      return (
        <Tooltip title="Low stock - reorder suggested">
          <Chip
            label={`${stock} in stock`}
            color="error"
            size="small"
            variant="outlined"
            icon={<Warning />}
          />
        </Tooltip>
      );
    }
    return <Typography variant="body2">{stock}</Typography>;
  };

  const handleEditClick = (part) => {
    console.log('Opening edit for spare part:', part.partNumber);
    setSparePartToEdit(part);
    setEditForm({
      partName: part.partName || '',
      partNumber: part.partNumber || '',
      description: part.description || '',
      unit: part.unit || '',
      stock: part.stock || '',
      minimumStock: part.minimumStock || '',
      unitPrice: part.unitPrice || '',
      vendor: part.vendor || '',
    });
    setEditDialogOpen(true);
  };

  const handleFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async () => {
    if (!sparePartToEdit) return;
    setLoading(true);
    try {
      console.log('Updating spare part:', sparePartToEdit.partNumber, editForm);
      const payload = {
        partName: editForm.partName,
        partNumber: editForm.partNumber,
        description: editForm.description,
        unit: editForm.unit,
        stock: parseInt(editForm.stock) || 0,
        minimumStock: parseInt(editForm.minimumStock) || 0,
        unitPrice: parseFloat(editForm.unitPrice) || 0,
        vendor: editForm.vendor,
      };
      const response = await sparePartsAPI.update(sparePartToEdit.partNumber, payload);
      console.log('Edit success:', response.data);
      setSnackbar({
        open: true,
        message: 'Spare part updated successfully!',
        severity: 'success',
      });
      onRefresh();
    } catch (error) {
      console.error('Edit error:', error);
      setSnackbar({
        open: true,
        message: `Error updating spare part: ${error.response?.data?.message || error.message}`,
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setEditDialogOpen(false);
      setSparePartToEdit(null);
      setEditForm({});
    }
  };

  const handleDeleteClick = (part) => {
    setSparePartToDelete(part);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sparePartToDelete) return;
    setLoading(true);
    try {
      await sparePartsAPI.delete(sparePartToDelete.partNumber);
      setSnackbar({
        open: true,
        message: 'Spare part deleted successfully!',
        severity: 'success',
      });
      onRefresh();
    } catch (error) {
      console.error('Error deleting spare part:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting spare part',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSparePartToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSparePartToDelete(null);
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setSparePartToEdit(null);
    setEditForm({});
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEdit = (part) => {
    handleEditClick(part);
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
              placeholder="Search spare parts..."
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
              label="Unit"
              value={filters.unit}
              onChange={(e) => handleFilterChange('unit', e.target.value)}
              sx={{ minWidth: 150 }}
              size="small"
            >
              <MenuItem value="">All Units</MenuItem>
              <MenuItem value="pcs">Pieces (pcs)</MenuItem>
              <MenuItem value="kg">Kilograms (kg)</MenuItem>
              <MenuItem value="liters">Liters (L)</MenuItem>
              <MenuItem value="m">Meters (m)</MenuItem>
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
              onClick={onAddSparePart}
              sx={{ ml: 'auto' }}
            >
              Add Spare Part
            </Button>
          </Box>
        </CardContent>
      </Card>
      {/* Spare Parts Table Card */}
      <Card sx={{ backgroundColor: 'background.paper' }}>
        <CardHeader
          title={
            <Typography variant="h6" component="h2">
              All Spare Parts ({filteredSpareParts.length})
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              {filteredSpareParts.length === spareParts.length
                ? 'Showing all spare parts'
                : `Filtered from ${spareParts.length} total spare parts`}
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
                  Part Number
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Part Name
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Vendor
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Unit
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Stock
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Min Stock
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Unit Price
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
              {filteredSpareParts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No spare parts found matching your filters.
                    </Typography>
                    {spareParts.length > 0 && (
                      <Button
                        variant="text"
                        onClick={() =>
                          setFilters({ search: '', unit: '', vendor: '' })
                        }
                        sx={{ mt: 1 }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSpareParts.map((part) => (
                  <TableRow
                    key={part.partNumber}
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
                        {part.partNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {part.partName}
                      </Typography>
                      {part.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {part.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {part.vendor}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {part.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getStockChip(part.stock, part.minimumStock)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {part.minimumStock}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main">
                        ${part.unitPrice.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onSparePartSelect(part)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Spare Part">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleEditClick(part)}
                            disabled={loading}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Spare Part">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(part)}
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
        onClose={handleEditCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Spare Part - {sparePartToEdit?.partName}
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
              label="Part Name *"
              value={editForm.partName}
              onChange={(e) => handleFormChange('partName', e.target.value)}
              fullWidth
              size="small"
              required
            />
            <TextField
              label="Part Number *"
              value={editForm.partNumber}
              onChange={(e) => handleFormChange('partNumber', e.target.value)}
              fullWidth
              size="small"
              required
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
                label="Unit"
                value={editForm.unit}
                onChange={(e) => handleFormChange('unit', e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="pcs">Pieces (pcs)</MenuItem>
                <MenuItem value="kg">Kilograms (kg)</MenuItem>
                <MenuItem value="liters">Liters (L)</MenuItem>
                <MenuItem value="m">Meters (m)</MenuItem>
              </TextField>
              <TextField
                label="Vendor"
                value={editForm.vendor}
                onChange={(e) => handleFormChange('vendor', e.target.value)}
                fullWidth
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Stock *"
                type="number"
                value={editForm.stock}
                onChange={(e) => handleFormChange('stock', e.target.value)}
                inputProps={{ min: 0 }}
                fullWidth
                size="small"
                required
              />
              <TextField
                label="Minimum Stock *"
                type="number"
                value={editForm.minimumStock}
                onChange={(e) => handleFormChange('minimumStock', e.target.value)}
                inputProps={{ min: 0 }}
                fullWidth
                size="small"
                required
              />
            </Box>
            <TextField
              label="Unit Price *"
              type="number"
              value={editForm.unitPrice}
              onChange={(e) => handleFormChange('unitPrice', e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              required
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
              !editForm.partName ||
              !editForm.partNumber ||
              editForm.stock === '' ||
              editForm.minimumStock === '' ||
              editForm.unitPrice === ''
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
            Are you sure you want to delete the spare part{' '}
            <strong>"{sparePartToDelete?.partName}"</strong> (Part Number: {sparePartToDelete?.partNumber})?
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
            {loading ? 'Deleting...' : 'Delete Spare Part'}
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

export default SparePartList;