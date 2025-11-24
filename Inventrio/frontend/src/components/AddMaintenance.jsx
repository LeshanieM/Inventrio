import React, { useState, useEffect } from 'react';
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
  FormControl,
  FormHelperText,
} from '@mui/material';
import {
  Save,
  Cancel,
  Build,
  Person,
  Description,
  BuildCircle,
  Inventory,
  Assessment,
} from '@mui/icons-material';
import { maintenanceAPI, assetsAPI } from '../services/api';

const AddMaintenance = ({ onMaintenanceAdded }) => {
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({
    asset: '',
    assetId: '',
    date: new Date().toISOString().split('T')[0],
    technician: '',
    description: '',
    parts: '',
    condition: '',
    action: '',
    status: 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const response = await assetsAPI.getAll();
      setAssets(response.data);
    } catch (error) {
      console.error('Error loading assets:', error);
      setError('Failed to load assets');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If asset selection changes, update assetId
    if (name === 'asset') {
      const selected = assets.find((a) => a.name === value);
      if (selected) {
        setFormData((prev) => ({
          ...prev,
          assetId: selected.id,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await maintenanceAPI.create(formData);
      onMaintenanceAdded();
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      setError('Failed to create maintenance record');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onMaintenanceAdded();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Card sx={{ backgroundColor: 'background.paper' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Build sx={{ fontSize: 32 }} />
              <Typography variant="h5" component="h1" fontWeight="bold">
                Add Maintenance Record
              </Typography>
            </Box>
          }
          subheader="Create a new maintenance work order"
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
              {/* Asset Selection */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Asset *"
                  name="asset"
                  value={formData.asset}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Inventory />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Select the asset that requires maintenance"
                >
                  <MenuItem value="">
                    <em>Select an asset</em>
                  </MenuItem>
                  {assets.map((asset) => (
                    <MenuItem key={asset.id} value={asset.name}>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {asset.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {asset.id} • {asset.location}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Date and Technician */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Maintenance Date *"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BuildCircle />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Technician"
                  name="technician"
                  value={formData.technician}
                  onChange={handleChange}
                  placeholder="Enter technician name"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Optional: Assign a technician"
                />
              </Grid>

              {/* Action Summary */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Action Summary *"
                  name="action"
                  value={formData.action}
                  onChange={handleChange}
                  placeholder="Brief summary of maintenance action"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Build />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Provide a concise description of the maintenance work"
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Detailed Description *"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the repair work in detail..."
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Description />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Provide detailed information about what was repaired and how"
                />
              </Grid>

              {/* Parts and Condition */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Parts Used"
                  name="parts"
                  value={formData.parts}
                  onChange={handleChange}
                  placeholder="e.g., Bearings, seals, lubricant"
                  helperText="List parts and materials used"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Condition Rating"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  placeholder="1-5"
                  inputProps={{
                    min: 1,
                    max: 5,
                    step: 0.1,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Assessment />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="caption" color="text.secondary">
                          /5
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  helperText="Rate asset condition after maintenance (1-5)"
                />
              </Grid>

              {/* Status (Hidden but included in form data) */}
              <Grid item xs={12}>
                <input type="hidden" name="status" value={formData.status} />
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
                    disabled={loading}
                    size="large"
                    sx={{ minWidth: 120 }}
                  >
                    {loading ? 'Saving...' : 'Save Record'}
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

export default AddMaintenance;
