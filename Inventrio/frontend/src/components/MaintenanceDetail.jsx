
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  IconButton
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

const MaintenanceDetail = ({ maintenance, onBack, onEdit }) => {
  if (!maintenance) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No maintenance record selected</Typography>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={onBack}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Maintenance Details
        </Typography>
        <Button
          variant="contained"
          onClick={() => onEdit(maintenance)}
          sx={{ ml: 'auto' }}
        >
          Edit Record
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Work Order Information</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Work Order ID</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {maintenance.id}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Asset</Typography>
                  <Typography variant="body1">{maintenance.asset}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Asset ID</Typography>
                  <Typography variant="body1">{maintenance.assetId}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography variant="body1">
                    {new Date(maintenance.date).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Maintenance Details</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Action</Typography>
                  <Typography variant="body1">{maintenance.action}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Technician</Typography>
                  <Typography variant="body1">
                    {maintenance.technician || 'Not assigned'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={maintenance.status} 
                    color={getStatusColor(maintenance.status)}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Condition</Typography>
                  <Typography variant="body1">
                    {maintenance.condition ? `${maintenance.condition}/5` : 'Not rated'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {maintenance.description && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Description</Typography>
                <Typography variant="body1">{maintenance.description}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MaintenanceDetail;