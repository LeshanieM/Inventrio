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
  Chip
} from '@mui/material';
import {
  Save,
  Cancel,
  Inventory,
  Description,
  Store,
  Numbers,
  Pending as PendingIcon
} from '@mui/icons-material';
// Assuming purchaseRequestsAPI in services/api.js
import { purchaseRequestsAPI } from '../services/api';

const AddPurchaseRequest = ({ onPurchaseRequestAdded }) => {
  const [formData, setFormData] = useState({
    partNameOrId: '',
    requiredQuantity: 0,
    reason: '',
    preferredVendor: '',
    status: 'pending' // Auto-set
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...formData,
        status: 'pending' // Ensure auto-set
      };
      await purchaseRequestsAPI.create(payload);
      onPurchaseRequestAdded();
    } catch (error) {
      console.error('Error creating purchase request:', error);
      setError('Failed to create purchase request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onPurchaseRequestAdded();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
      <Card sx={{ backgroundColor: 'background.paper' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inventory sx={{ fontSize: 32 }} />
              <Typography variant="h5" component="h1" fontWeight="bold">
                Purchase Request
              </Typography>
            </Box>
          }
          subheader="Submit a new request for spare parts procurement"
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
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Inventory />
                  Basic Information
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Part Name or ID *"
                  name="partNameOrId"
                  value={formData.partNameOrId}
                  onChange={handleChange}
                  placeholder="Enter part name or ID"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Inventory />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Search or enter the exact part name/ID from inventory"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Required Quantity *"
                  name="requiredQuantity"
                  value={formData.requiredQuantity}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Numbers />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Number of units needed"
                />
              </Grid>
              {/* Reason */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <Description />
                  Reason (Optional)
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Why this purchase is needed"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="e.g., Low stock for upcoming maintenance, replacement for faulty unit"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Description />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Provide details to help with approval"
                />
              </Grid>
              {/* Vendor */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <Store />
                  Vendor
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Preferred Vendor"
                  name="preferredVendor"
                  value={formData.preferredVendor}
                  onChange={handleChange}
                  placeholder="e.g., HeavyEquip Supplies"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Store />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Suggested supplier (optional)"
                />
              </Grid>
              {/* Form Actions */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Chip
                    icon={<PendingIcon />}
                    label="PENDING"
                    color="warning"
                    variant="filled"
                    size="medium"
                    sx={{ mr: 'auto' }}
                  />
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
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    disabled={loading || !formData.partNameOrId || formData.requiredQuantity === 0}
                    size="large"
                    sx={{ minWidth: 140 }}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
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

export default AddPurchaseRequest;