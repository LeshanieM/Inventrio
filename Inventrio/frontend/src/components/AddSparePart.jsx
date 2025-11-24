import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  MenuItem,
  Button,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Save,
  Cancel,
  Inventory,
  QrCode,
  Description,
  Layers,
  TrendingUp,
  Store,
  AttachMoney,
} from '@mui/icons-material';
// Assuming you have or will add sparePartsAPI in services/api.js
// e.g., export const sparePartsAPI = { create: (data) => api.post('/spare-parts', data), ... };
import { sparePartsAPI } from '../services/api';

const AddSparePart = ({ onSparePartAdded }) => {
  const [formData, setFormData] = useState({
    partName: '',
    partNumber: '',
    description: '',
    unit: '',
    stock: 0,
    minimumStock: 0,
    unitPrice: 0,
    vendor: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sparePartsAPI.create(formData);
      onSparePartAdded();
    } catch (error) {
      console.error('Error creating spare part:', error);
      setError('Failed to create spare part');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onSparePartAdded();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Card sx={{ backgroundColor: 'background.paper' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inventory sx={{ fontSize: 32 }} />
              <Typography variant="h5" component="h1" fontWeight="bold">
                Add New Spare Part
              </Typography>
            </Box>
          }
          subheader="Register a new spare part in the inventory system"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        />

        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Inventory />
                  Basic Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Part Name *"
                  name="partName"
                  value={formData.partName}
                  onChange={handleChange}
                  placeholder="Enter part name"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Inventory />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Provide a descriptive name for the spare part"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Part Number *"
                  name="partNumber"
                  value={formData.partNumber}
                  onChange={handleChange}
                  placeholder="e.g., SP-12345"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCode />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Unique identifier for the part"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="Detailed description of the part"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Description />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Optional: Additional details about usage or specifications"
                />
              </Grid>
              {/* Inventory Details */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}
                >
                  <Layers />
                  Inventory Details
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="e.g., pcs, kg"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Layers />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Unit of measurement"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Stock *"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Inventory />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Current stock quantity"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Stock *"
                  name="minimumStock"
                  value={formData.minimumStock}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TrendingUp />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Reorder alert below this level"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Unit Price *"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Price per unit (currency: default)"
                />
              </Grid>
              {/* Vendor Information */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}
                >
                  <Store />
                  Vendor Information
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Vendor"
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleChange}
                  placeholder="Vendor name or supplier"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Store />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Supplier or vendor providing this part"
                />
              </Grid>
              {/* Form Actions */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={loading}
                    size="large"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <Save />
                    }
                    disabled={
                      loading ||
                      !formData.partName ||
                      !formData.partNumber ||
                      formData.stock === '' ||
                      formData.minimumStock === '' ||
                      formData.unitPrice === ''
                    }
                    size="large"
                    sx={{ minWidth: 120 }}
                  >
                    {loading ? 'Saving...' : 'Save Spare Part'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddSparePart;
