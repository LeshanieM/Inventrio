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
  Category,
  Apartment,
  Layers,
  MeetingRoom,
  LocationOn,
  Memory,
  QrCode,
  Store,
  CalendarToday,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import { assetsAPI } from '../services/api';

/**
 
 * This component renders a form for adding a new asset to the inventory management system.
 * It handles form state, validation, submission to the API, and provides user feedback.
 * 
 * Props:
 * - onAssetAdded: Callback function triggered after successful asset creation or cancellation.
 *   It typically closes the modal or refreshes the asset list.
 */
const AddAsset = ({ onAssetAdded }) => {
  // Initial form state with default values for all asset fields
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    model: '',
    serial: '',
    vendor: '',
    warranty: '',
    installationDate: '',
    building: '',
    floor: '',
    room: '',
    location: '',
    quantity: 0,
    minThreshold: 0,
    status: 'active',
  });

  // Loading state to show spinner during API calls
  const [loading, setLoading] = useState(false);

  // Error state for displaying API or validation errors
  const [error, setError] = useState('');

  /**
   * Handles input changes for form fields
   * Updates the formData state based on the target field's name and value
   * Parses numeric fields (quantity, minThreshold) to integers
   */
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  /**
   * Handles form submission
   * Prevents default form behavior, sets loading state,
   * Calls the API to create the asset, and handles success/error
   * On success, triggers the onAssetAdded callback
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await assetsAPI.create(formData);
      onAssetAdded(); // Notify parent component of successful addition
    } catch (error) {
      console.error('Error creating asset:', error);
      setError('Failed to create asset');
    } finally {
      setLoading(false); // Always reset loading state
    }
  };

  /**
   * Handles form cancellation
   * Triggers the onAssetAdded callback to close the form or reset the view
   */
  const handleCancel = () => {
    onAssetAdded();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      {/* Main Card Container */}
      <Card sx={{ backgroundColor: 'background.paper' }}>
        {/* Card Header with title and subtitle */}
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inventory sx={{ fontSize: 32 }} />
              <Typography variant="h5" component="h1" fontWeight="bold">
                Add New Asset
              </Typography>
            </Box>
          }
          subheader="Register a new asset in the management system"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        />

        {/* Card Content with Form */}
        <CardContent>
          {/* Error Alert Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {/* Main Form Element */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Section: Basic Information */}
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
              {/* Asset Name Field - Required */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Asset Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter asset name"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Inventory />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Provide a descriptive name for the asset"
                />
              </Grid>
              {/* Category Field */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Material Handling"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Category />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Asset category or type"
                />
              </Grid>
              {/* Location Select Field - Required */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Location *"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Select the primary location"
                >
                  <MenuItem value="">
                    <em>Select location</em>
                  </MenuItem>
                  <MenuItem value="North Bay">North Bay</MenuItem>
                  <MenuItem value="South Dock">South Dock</MenuItem>
                  <MenuItem value="Main Floor">Main Floor</MenuItem>
                </TextField>
              </Grid>

              {/* Section: Location Details */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}
                >
                  <Apartment />
                  Location Details
                </Typography>
              </Grid>
              {/* Building Field */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Building"
                  name="building"
                  value={formData.building}
                  onChange={handleChange}
                  placeholder="Building name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Apartment />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {/* Floor Field */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Floor"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  placeholder="Floor level"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Layers />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {/* Room Field */}
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Room"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  placeholder="Room number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MeetingRoom />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Section: Technical Specifications */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}
                >
                  <Memory />
                  Technical Specifications
                </Typography>
              </Grid>
              {/* Model Field */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="Model number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Memory />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {/* Serial Number Field */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Serial Number"
                  name="serial"
                  value={formData.serial}
                  onChange={handleChange}
                  placeholder="Serial number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCode />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {/* Vendor Field */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vendor"
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleChange}
                  placeholder="Vendor name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Store />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {/* Warranty Field */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Warranty"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleChange}
                  placeholder="e.g., 3 years"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Section: Installation & Inventory */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}
                >
                  <TrendingUp />
                  Installation & Inventory
                </Typography>
              </Grid>
              {/* Installation Date Field */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Installation Date"
                  name="installationDate"
                  value={formData.installationDate}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {/* Hidden Status Field - Defaults to 'active' */}
              <Grid item xs={12} sm={6}>
                <input type="hidden" name="status" value={formData.status} />
              </Grid>
              {/* Quantity Field - Required */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantity *"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  inputProps={{
                    min: 0,
                  }}
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
              {/* Minimum Threshold Field - Required */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Threshold *"
                  name="minThreshold"
                  value={formData.minThreshold}
                  onChange={handleChange}
                  required
                  inputProps={{
                    min: 0,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Warning />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Reorder alert will trigger below this level"
                />
              </Grid>

              {/* Form Actions Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}
                >
                  {/* Cancel Button */}
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={loading}
                    size="large"
                  >
                    Cancel
                  </Button>
                  {/* Submit Button with Loading Indicator */}
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <Save />
                    }
                    disabled={loading}
                    size="large"
                    sx={{ minWidth: 120 }}
                  >
                    {loading ? 'Saving...' : 'Save Asset'}
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

export default AddAsset;
