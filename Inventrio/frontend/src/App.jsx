import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory,
  Build,
  Store as StoreIcon, // For spare parts
  Add,
  Today,
  Menu as MenuIcon,
  Pending, // For purchase requests
} from '@mui/icons-material';
import Dashboard from './components/Dashboard';
import AssetList from './components/AssetList';
import AssetDetail from './components/AssetDetail';
import AddAsset from './components/AddAsset';
import AddMaintenance from './components/AddMaintenance';
import MaintenanceList from './components/MaintenanceList';
import MaintenanceDetail from './components/MaintenanceDetail';
import SparePartList from './components/SparePartList';
import SparePartDetail from './components/SparePartDetail';
import AddSparePart from './components/AddSparePart';
import AddPurchaseRequest from './components/AddPurchaseRequest';
import PurchaseRequestList from './components/PurchaseRequestList';
import PurchaseRequestDetail from './components/PurchaseRequestDetail';
import { maintenanceAPI, purchaseRequestsAPI } from './services/api';

/**
 * Main App Component
 * Manages the overall state and routing between different views in the asset management system.
 * Handles data loading, navigation, and persistence for maintenance records.
 */
function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for current view and data
  const [currentView, setCurrentView] = useState('dashboard');
  const [assets, setAssets] = useState([]);
  const [spareParts, setSpareParts] = useState([]); 
  const [purchaseRequests, setPurchaseRequests] = useState([]); 
  const [maintenance, setMaintenance] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    repair: 0,
    lowStock: 0,
  });
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedSparePart, setSelectedSparePart] = useState(null); 
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [selectedPurchaseRequest, setSelectedPurchaseRequest] = useState(null); 

  // Helper to save/load from localStorage (for maintenance persistence)
  const STORAGE_KEY = 'assetManagement_maintenance';

  /**
   * Saves maintenance data to localStorage
   * @param {Array} data - Array of maintenance records
   */
  const saveMaintenanceToStorage = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('Maintenance saved to localStorage:', data.length, 'records');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  /**
   * Loads maintenance data from localStorage
   * @returns {Array|null} Array of maintenance records or null
   */
  const loadMaintenanceFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  };

  // Initial data load on mount
  useEffect(() => {
    loadAssets();
    loadSpareParts(); 
    loadPurchaseRequests(); 
    loadStats();
    loadMaintenance();
  }, []);

  /**
   * Loads assets from API or uses mock data on error
   */
  const loadAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error('Error loading assets:', error);
      // Fallback mock data for testing
      const mockAssets = [
        {
          id: '1',
          name: 'Excavator X-100',
          assetId: 'EQ001',
          status: 'active',
          condition: 4,
        },
        {
          id: '2',
          name: 'Crane C-200',
          assetId: 'EQ002',
          status: 'maintenance',
          condition: 2,
        },
      ];
      setAssets(mockAssets);
    }
  };

  //Load spare parts from API or uses mock data on error
  const loadSpareParts = async () => {
    try {
      const response = await fetch('/api/spare-parts');
      const data = await response.json();
      setSpareParts(data);
    } catch (error) {
      console.error('Error loading spare parts:', error);
      // Fallback mock data for testing
      const mockSpareParts = [
        {
          partNumber: 'SP001',
          partName: 'Hydraulic Filter',
          description: 'High-pressure hydraulic filter for excavators',
          unit: 'pcs',
          stock: 5,
          minimumStock: 2,
          unitPrice: 45.99,
          vendor: 'HeavyEquip Supplies',
        },
        {
          partNumber: 'SP002',
          partName: 'Engine Oil',
          description: 'Synthetic engine oil for diesel engines',
          unit: 'liters',
          stock: 20,
          minimumStock: 10,
          unitPrice: 12.50,
          vendor: 'LubeTech Inc.',
        },
      ];
      setSpareParts(mockSpareParts);
    }
  };

  //  Load purchase requests from API or uses mock data on error
  const loadPurchaseRequests = async () => {
    try {
      const response = await fetch('/api/purchase-requests');
      const data = await response.json();
      setPurchaseRequests(data);
    } catch (error) {
      console.error('Error loading purchase requests:', error);
      // Fallback mock data for testing
      const mockPRs = [
        {
          id: 1,
          partNameOrId: 'SP001',
          requiredQuantity: 10,
          reason: 'Low stock for upcoming maintenance',
          preferredVendor: 'HeavyEquip Supplies',
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          partNameOrId: 'SP002',
          requiredQuantity: 5,
          reason: 'Replacement for faulty units',
          preferredVendor: 'LubeTech Inc.',
          status: 'approved',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        },
      ];
      setPurchaseRequests(mockPRs);
    }
  };

  /**
   * Loads maintenance from API, with fallback to localStorage or mock data
   */
  const loadMaintenance = async () => {
    try {
      const response = await fetch('/api/maintenance');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Loaded from API:', data.length, 'records');
      setMaintenance(data);
      // Sync to localStorage for offline resilience
      saveMaintenanceToStorage(data);
      //  If API returned empty but storage has data, prefer storage (demo-friendly)
      const stored = loadMaintenanceFromStorage();
      if (data.length === 0 && stored && stored.length > 0) {
        console.log(
          'API empty, but storage has data—preferring storage for demo'
        );
        setMaintenance(stored);
        saveMaintenanceToStorage(stored);
      }
    } catch (error) {
      console.error(
        'Error loading maintenance (falling back to storage/mocks):',
        error
      );
      // First, try localStorage
      let fallbackData = loadMaintenanceFromStorage();
      if (!fallbackData || fallbackData.length === 0) {
        // Initial mock if nothing stored
        fallbackData = [
          {
            id: 'WO001',
            asset: 'Excavator X-100',
            assetId: 'EQ001',
            date: new Date().toISOString(),
            action: 'Routine Service',
            description: 'Regular maintenance and oil change',
            technician: 'John Smith',
            status: 'completed',
            condition: 4,
          },
          {
            id: 'WO002',
            asset: 'Crane C-200',
            assetId: 'EQ002',
            date: new Date().toISOString(),
            action: 'Engine Repair',
            description: 'Replace faulty engine components',
            technician: 'Mike Johnson',
            status: 'in-progress',
            condition: 2,
          },
        ];
        console.log('Loaded initial mock data');
      } else {
        console.log(
          'Loaded from localStorage:',
          fallbackData.length,
          'records'
        );
      }
      setMaintenance(fallbackData);
      // Ensure storage is updated
      saveMaintenanceToStorage(fallbackData);
    }
  };

  /**
   * Loads asset statistics from API or uses mock data on error
   */
  const loadStats = async () => {
    try {
      const response = await fetch('/api/assets/stats/summary');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        total: 15,
        active: 12,
        repair: 2,
        lowStock: 1,
      });
    }
  };

  /**
   * Handles navigation between views and reloads relevant data
   * @param {string} view - The view to switch to (e.g., 'dashboard', 'asset-list')
   */
  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view === 'dashboard') {
      loadStats();
      loadMaintenance();
      loadSpareParts(); //  Reload spares on dashboard
      loadPurchaseRequests(); // Reload purchase requests on dashboard
    } else if (view === 'asset-list') {
      loadAssets();
    } else if (view === 'spare-parts-list') { //  Load spares
      loadSpareParts();
    } else if (view === 'purchase-requests-list') { //  Load purchase requests
      loadPurchaseRequests();
    } else if (view === 'maintenance-list') {
      loadMaintenance();
    }
  };

  /**
   * Handles selection of an asset for detail view
   * @param {object} asset - Selected asset object
   */
  const handleAssetSelect = (asset) => {
    setSelectedAsset(asset);
    setCurrentView('asset-detail');
  };

  //  Handle spare part select for detail view
  const handleSparePartSelect = (sparePart) => {
    setSelectedSparePart(sparePart);
    setCurrentView('spare-part-detail');
  };

  //  Handle purchase request select for detail view
  const handlePurchaseRequestSelect = (purchaseRequest) => {
    setSelectedPurchaseRequest(purchaseRequest);
    setCurrentView('purchase-request-detail');
  };

  /**
   * Handles selection of a maintenance record for detail view
   * @param {object} maintenanceRecord - Selected maintenance record
   */
  const handleMaintenanceSelect = (maintenanceRecord) => {
    setSelectedMaintenance(maintenanceRecord);
    setCurrentView('maintenance-detail');
  };

  /**
   * Handles asset addition and refreshes list
   */
  const handleAssetAdded = () => {
    loadAssets();
    loadStats();
    setCurrentView('asset-list');
  };

  // Handle spare part addition and refreshes list
  const handleSparePartAdded = () => {
    loadSpareParts();
    setCurrentView('spare-parts-list');
  };

  // Handle purchase request addition and refreshes list
  const handlePurchaseRequestAdded = () => {
    loadPurchaseRequests();
    setCurrentView('purchase-requests-list');
  };

  /**
   * Handles maintenance addition and refreshes list
   */
  const handleMaintenanceAdded = () => {
    loadMaintenance();
    setCurrentView('maintenance-list');
  };

  /**
   * Handles asset edit navigation
   * @param {object} asset - Asset to edit
   */
  const handleAssetEdit = (asset) => {
    setSelectedAsset(asset);
    setCurrentView('asset-detail');
  };

  // Handle spare part edit navigation
  const handleSparePartEdit = (sparePart) => {
    setSelectedSparePart(sparePart);
    setCurrentView('spare-part-detail');
  };

/*************  ✨ Windsurf Command 🌟  *************/
  /**
   * Handles purchase request edit navigation
   * @param {object} purchaseRequest - Purchase request to edit
   * @description Sets the selected purchase request and navigates to the detail view
   */
  //  Handle purchase request edit navigation
  const handlePurchaseRequestEdit = (purchaseRequest) => {
    setSelectedPurchaseRequest(purchaseRequest);
    setCurrentView('purchase-request-detail');
  };
/*******  c308c0a8-5163-4d37-a595-c114d0852e90  *******/

  /**
   * Handles maintenance edit navigation
   * @param {object} maintenanceRecord - Maintenance record to edit
   */
  const handleMaintenanceEdit = (maintenanceRecord) => {
    setSelectedMaintenance(maintenanceRecord);
    setCurrentView('maintenance-detail');
  };

  // Compute updated list FIRST, then set & save (avoids async stale state)
  /**
   * Updates a maintenance record locally and attempts backend sync
   * @param {object} updatedRecord - Updated maintenance record
   */
  const handleMaintenanceUpdate = async (updatedRecord) => {
    try {
      // Try backend update
      const response = await fetch(`/api/maintenance/${updatedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecord),
      });
      if (response.ok) {
        console.log('Backend update succeeded for:', updatedRecord.id);
      } else {
        console.warn(
          'Backend update failed (status:',
          response.status,
          '), using local only'
        );
      }
    } catch (error) {
      console.error('Backend update error (local only):', error);
    }
    // Compute updated list from CURRENT state (safe here)
    const updatedList = maintenance.map((record) =>
      record.id === updatedRecord.id ? { ...record, ...updatedRecord } : record
    );
    // Always update local state & persist
    setMaintenance(updatedList);
    saveMaintenanceToStorage(updatedList);
    console.log('Local update completed for:', updatedRecord.id);
  };

  // handleMaintenanceDelete (already good, but added response check)
  /**
   * Deletes a maintenance record locally and attempts backend sync
   * @param {string} recordId - ID of maintenance record to delete
   */
  const handleMaintenanceDelete = async (recordId) => {
    try {
      const response = await fetch(`/api/maintenance/${recordId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        console.log('Backend delete succeeded for:', recordId);
      } else {
        console.warn(
          'Backend delete failed (status:',
          response.status,
          '), using local only'
        );
      }
    } catch (error) {
      console.error('Backend delete error (local only):', error);
    }
    // Always update local state & persist
    const updatedMaintenance = maintenance.filter(
      (record) => record.id !== recordId
    );
    setMaintenance(updatedMaintenance);
    saveMaintenanceToStorage(updatedMaintenance);
    console.log(
      'Local delete completed for:',
      recordId,
      '- now',
      updatedMaintenance.length,
      'records'
    );
  };

  /**
   * Selects an asset from maintenance context
   * @param {string} assetId - ID of asset to select
   */
  const handleAssetSelectFromMaintenance = async (assetId) => {
    try {
      // Find asset in local state first
      const asset = assets.find(
        (a) => a.assetId === assetId || a.id === assetId
      );
      if (asset) {
        setSelectedAsset(asset);
        setCurrentView('asset-detail');
      } else {
        // Fallback: fetch from API
        const response = await fetch(`/api/assets/${assetId}`);
        const asset = await response.json();
        setSelectedAsset(asset);
        setCurrentView('asset-detail');
      }
    } catch (error) {
      console.error('Error loading asset:', error);
    }
  };

  /**
   * Returns the title for the current view
   * @returns {string} View title
   */
  const getViewTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      'asset-list': 'Asset Inventory',
      'asset-detail': 'Asset Details',
      'maintenance-list': 'Maintenance Records',
      'maintenance-detail': 'Maintenance Details',
      'spare-parts-list': 'Spare Parts Inventory', 
      'spare-part-detail': 'Spare Part Details', 
      'purchase-requests-list': 'Purchase Requests', 
      'purchase-request-detail': 'Purchase Request Details', 
      'add-asset': 'Add New Asset',
      'add-maintenance': 'Add Maintenance Record',
      'add-spare-part': 'Add New Spare Part', 
      'add-purchase-request': 'Add Purchase Request', 
    };
    return titles[currentView] || 'Asset Management';
  };

  /**
   * Returns the icon for the current view
   * @returns {JSX.Element} View icon
   */
  const getViewIcon = () => {
    const icons = {
      dashboard: <DashboardIcon />,
      'asset-list': <Inventory />,
      'asset-detail': <Inventory />,
      'maintenance-list': <Build />,
      'maintenance-detail': <Build />,
      'spare-parts-list': <StoreIcon />, 
      'spare-part-detail': <StoreIcon />, 
      'purchase-requests-list': <Pending />, 
      'purchase-request-detail': <Pending />, 
      'add-asset': <Add />,
      'add-maintenance': <Add />,
      'add-spare-part': <Add />, 
      'add-purchase-request': <Add />, 
    };
    return icons[currentView] || <DashboardIcon />;
  };

  /**
   * Renders the appropriate component based on current view
   * @returns {JSX.Element} Rendered view component
   */
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard stats={stats} assets={assets} maintenance={maintenance} spareParts={spareParts} purchaseRequests={purchaseRequests} />
        );
      case 'asset-list':
        return (
          <AssetList
            assets={assets}
            onAssetSelect={handleAssetSelect}
            onAssetEdit={handleAssetEdit}
            onRefresh={loadAssets}
            onAddAsset={() => handleViewChange('add-asset')}
          />
        );
      case 'asset-detail':
        return (
          <AssetDetail
            asset={selectedAsset}
            onBack={() => setCurrentView('asset-list')}
            onEdit={handleAssetEdit}
          />
        );
      case 'maintenance-list':
        return (
          <MaintenanceList
            maintenance={maintenance}
            onRefresh={loadMaintenance}
            onMaintenanceSelect={handleMaintenanceSelect}
            onMaintenanceUpdate={handleMaintenanceUpdate}
            onMaintenanceDelete={handleMaintenanceDelete}
            onAssetSelect={handleAssetSelectFromMaintenance}
          />
        );
      case 'maintenance-detail':
        return (
          <MaintenanceDetail
            maintenance={selectedMaintenance}
            onBack={() => setCurrentView('maintenance-list')}
            onEdit={handleMaintenanceEdit}
          />
        );
      case 'spare-parts-list': 
        return (
          <SparePartList
            spareParts={spareParts}
            onSparePartSelect={handleSparePartSelect}
            onSparePartEdit={handleSparePartEdit}
            onRefresh={loadSpareParts}
            onAddSparePart={() => handleViewChange('add-spare-part')}
          />
        );
      case 'spare-part-detail': 
        return (
          <SparePartDetail
            sparePart={selectedSparePart}
            onBack={() => setCurrentView('spare-parts-list')}
            onEdit={handleSparePartEdit}
          />
        );
      case 'purchase-requests-list': 
        return (
          <PurchaseRequestList
            purchaseRequests={purchaseRequests}
            onRefresh={loadPurchaseRequests}
            onPurchaseRequestSelect={handlePurchaseRequestSelect}
            onPurchaseRequestEdit={handlePurchaseRequestEdit}
            onAddPurchaseRequest={() => handleViewChange('add-purchase-request')}
          />
        );
      case 'purchase-request-detail': 
        return (
          <PurchaseRequestDetail
            purchaseRequest={selectedPurchaseRequest}
            onBack={() => setCurrentView('purchase-requests-list')}
          />
        );
      case 'add-asset':
        return <AddAsset onAssetAdded={handleAssetAdded} />;
      case 'add-maintenance':
        return <AddMaintenance onMaintenanceAdded={handleMaintenanceAdded} />;
      case 'add-spare-part': 
        return <AddSparePart onSparePartAdded={handleSparePartAdded} />;
      case 'add-purchase-request': 
        return <AddPurchaseRequest onPurchaseRequestAdded={handlePurchaseRequestAdded} />;
      default:
        return <Dashboard stats={stats} assets={assets} spareParts={spareParts} purchaseRequests={purchaseRequests} />;
    }
  };

  // Local component for navigation tabs
  const NavigationTabs = () => (
    <Tabs
      value={currentView}
      onChange={(e, newValue) => handleViewChange(newValue)}
      sx={{
        '& .MuiTab-root': {
          minWidth: 'auto',
          px: 2,
          fontWeight: 600,
        },
      }}
    >
      <Tab
        icon={<DashboardIcon />}
        iconPosition="start"
        label={isMobile ? '' : 'Overview'}
        value="dashboard"
      />
      <Tab
        icon={<Inventory />}
        iconPosition="start"
        label={isMobile ? '' : 'Assets'}
        value="asset-list"
      />
      <Tab
        icon={<StoreIcon />}
        iconPosition="start"
        label={isMobile ? '' : 'Spare Parts'} 
        value="spare-parts-list"
      />
      <Tab
        icon={<Pending />}
        iconPosition="start"
        label={isMobile ? '' : 'Purchase Requests'} // New tab
        value="purchase-requests-list"
      />
      <Tab
        icon={<Build />}
        iconPosition="start"
        label={isMobile ? '' : 'Maintenance'}
        value="maintenance-list"
      />
    </Tabs>
  );

  // Local component for action buttons
  const ActionButtons = () => (
    <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
      <Tooltip title="Add New Asset">
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => handleViewChange('add-asset')}
          size="small"
        >
          {isMobile ? '' : 'Add Asset'}
        </Button>
      </Tooltip>
      <Tooltip title="Add Spare Part"> {/* New button */}
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => handleViewChange('add-spare-part')}
          size="small"
        >
          {isMobile ? '' : 'Add Spare Part'}
        </Button>
      </Tooltip>
      <Tooltip title="Add Purchase Request"> {/* New button */}
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => handleViewChange('add-purchase-request')}
          size="small"
        >
          {isMobile ? '' : 'Add Request'}
        </Button>
      </Tooltip>
      <Tooltip title="Add Maintenance Record">
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => handleViewChange('add-maintenance')}
          size="small"
        >
          {isMobile ? '' : 'Add Maintenance'}
        </Button>
      </Tooltip>
    </Box>
  );

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        elevation={1}
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <img
              src="/logo.png"
              alt="Company Logo"
              style={{ height: 40, width: 'auto' }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getViewIcon()}
              <Typography variant="h6" component="div" fontWeight="bold">
                {getViewTitle()}
              </Typography>
            </Box>
            {!isMobile && (
              <Chip
                icon={<Today />}
                label={new Date().toLocaleDateString()}
                variant="outlined"
                size="small"
              />
            )}
          </Box>
          {!isMobile && <ActionButtons />}
        </Toolbar>
        {/* Navigation Tabs */}
        <Toolbar variant="dense" sx={{ minHeight: '48px !important' }}>
          <NavigationTabs />
          {isMobile && <ActionButtons />}
        </Toolbar>
      </AppBar>
      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {renderView()}
      </Container>
    </Box>
  );
}

export default App;