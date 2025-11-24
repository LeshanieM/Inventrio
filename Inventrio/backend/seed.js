import mongoose from 'mongoose';
import Asset from './models/Asset.js';
import Maintenance from './models/Maintenance.js';
import SparePart from './models/SpareParts.js'; // New: Import SparePart model
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/asset-management'
    );
    console.log('Connected to MongoDB successfully!');

    // Clear existing data
    console.log('Clearing existing data...');
    await Asset.deleteMany({});
    await Maintenance.deleteMany({});
    await SparePart.deleteMany({}); // New: Clear spare parts

    // Insert sample assets
    console.log('Inserting sample assets...');
    const assets = [
      {
        id: 'AS-1001',
        name: 'Forklift A3',
        status: 'active',
        quantity: 6,
        minThreshold: 3,
        location: 'North Bay',
        category: 'Material Handling',
        model: 'FL-3500X',
        serial: 'SN-847392',
        vendor: 'LiftPro Inc.',
        warranty: '2 years',
        installationDate: new Date('2023-01-15'),
        building: 'Warehouse A',
        floor: 'Ground',
        room: 'Bay 3',
        lastRepairDate: new Date('2023-11-20'),
        lastRepairNote: 'Hydraulic system service',
      },
      {
        id: 'AS-1002',
        name: 'Pallet Jack B2',
        status: 'active',
        quantity: 3,
        minThreshold: 4,
        location: 'South Dock',
        category: 'Material Handling',
        model: 'PJ-2200',
        serial: 'SN-562891',
        vendor: 'MoveMaster',
        warranty: '1 year',
        installationDate: new Date('2023-03-22'),
        building: 'Warehouse B',
        floor: 'Ground',
        room: 'Dock 2',
      },
      {
        id: 'AS-1003',
        name: 'Conveyor Motor C7',
        status: 'repair',
        quantity: 1,
        minThreshold: 2,
        location: 'Main Floor',
        category: 'Conveyance',
        model: 'CM-7500',
        serial: 'SN-319475',
        vendor: 'FlowSystems',
        warranty: '3 years',
        installationDate: new Date('2022-11-05'),
        building: 'Main Facility',
        floor: 'Production',
        room: 'Line 7',
        lastRepairDate: new Date('2024-01-10'),
        lastRepairNote: 'Bearing replacement',
      },
      {
        id: 'AS-1004',
        name: 'Loader D1',
        status: 'active',
        quantity: 4,
        minThreshold: 3,
        location: 'North Bay',
        category: 'Material Handling',
        model: 'LD-4500',
        serial: 'SN-728394',
        vendor: 'HeavyLift Co.',
        warranty: '2 years',
        installationDate: new Date('2023-05-18'),
        building: 'Warehouse A',
        floor: 'Ground',
        room: 'Bay 1',
      },
      {
        id: 'AS-1005',
        name: 'Lift Battery Pack',
        status: 'repair',
        quantity: 2,
        minThreshold: 5,
        location: 'South Dock',
        category: 'Power Systems',
        model: 'BP-120A',
        serial: 'SN-645821',
        vendor: 'PowerCell Inc.',
        warranty: '18 months',
        installationDate: new Date('2023-07-30'),
        building: 'Warehouse B',
        floor: 'Ground',
        room: 'Charging Station',
      },
      {
        id: 'AS-1006',
        name: 'Scanner Handheld',
        status: 'active',
        quantity: 10,
        minThreshold: 5,
        location: 'Main Floor',
        category: 'Technology',
        model: 'SCAN-500',
        serial: 'SN-938472',
        vendor: 'ScanTech',
        warranty: '1 year',
        installationDate: new Date('2023-09-12'),
        building: 'Main Office',
        floor: 'Ground',
        room: 'Supply Room',
      },
    ];
    const insertedAssets = await Asset.insertMany(assets);
    console.log(`Inserted ${insertedAssets.length} assets`);

    // New: Insert sample spare parts
    console.log('Inserting sample spare parts...');
    const spareParts = [
      {
        partNumber: 'SP001',
        partName: 'Hydraulic Filter',
        description: 'High-pressure hydraulic filter for excavators',
        unit: 'pcs',
        stock: 5,
        minimumStock: 2,
        unitPrice: 45.99,
        vendor: 'HeavyEquip Supplies',
        acquisitionDate: new Date('2023-06-01'),
        lastReorderDate: new Date('2024-10-15'),
        lastReorderNote: 'Standard reorder',
      },
      {
        partNumber: 'SP002',
        partName: 'Engine Oil',
        description: 'Synthetic engine oil for diesel engines',
        unit: 'liters',
        stock: 20,
        minimumStock: 10,
        unitPrice: 12.5,
        vendor: 'LubeTech Inc.',
        acquisitionDate: new Date('2023-08-20'),
        lastReorderDate: new Date('2024-11-01'),
        lastReorderNote: 'Bulk purchase',
      },
      {
        partNumber: 'SP003',
        partName: 'Bearing Set',
        description: 'Precision bearing kit for conveyor motors',
        unit: 'set',
        stock: 1,
        minimumStock: 3,
        unitPrice: 89.0,
        vendor: 'FlowSystems',
        acquisitionDate: new Date('2023-04-10'),
        lastReorderDate: new Date('2024-09-25'),
        lastReorderNote: 'Emergency reorder',
      },
      {
        partNumber: 'SP004',
        partName: 'Tire Assembly',
        description: 'Heavy-duty rubber tire for pallet jacks',
        unit: 'pcs',
        stock: 8,
        minimumStock: 4,
        unitPrice: 65.75,
        vendor: 'MoveMaster',
        acquisitionDate: new Date('2023-02-14'),
        lastReorderDate: new Date('2024-10-05'),
        lastReorderNote: 'Seasonal stock-up',
      },
      {
        partNumber: 'SP005',
        partName: 'Lithium Cell',
        description: 'Replacement battery cell for lift packs',
        unit: 'pcs',
        stock: 12,
        minimumStock: 6,
        unitPrice: 22.99,
        vendor: 'PowerCell Inc.',
        acquisitionDate: new Date('2023-07-30'),
        lastReorderDate: new Date('2024-11-10'),
        lastReorderNote: 'Preventive stock',
      },
    ];
    const insertedSpareParts = await SparePart.insertMany(spareParts);
    console.log(`Inserted ${insertedSpareParts.length} spare parts`);

    // Insert sample maintenance records
    console.log('Inserting maintenance records...');
    const maintenance = [
      {
        id: 'WO-3342',
        asset: 'Forklift A3',
        assetId: 'AS-1001',
        date: new Date(),
        action: 'Hydraulic check',
        status: 'completed',
        technician: 'John Smith',
        description: 'Routine hydraulic system inspection',
        parts: 'Hydraulic fluid',
        condition: 4.5,
      },
      {
        id: 'WO-3341',
        asset: 'Lift Battery Pack',
        assetId: 'AS-1005',
        date: new Date(),
        action: 'Cell replacement',
        status: 'in-progress',
        technician: 'Mike Johnson',
        description: 'Replacing damaged battery cells',
        parts: 'Lithium cells, connectors',
        condition: 3.0,
      },
      {
        id: 'WO-3338',
        asset: 'Conveyor Motor C7',
        assetId: 'AS-1003',
        date: new Date(Date.now() - 86400000), // yesterday
        action: 'Bearing lubrication',
        status: 'completed',
        technician: 'Sarah Wilson',
        description: 'Lubricated motor bearings and checked alignment',
        parts: 'Lubricant',
        condition: 4.0,
      },
      {
        id: 'WO-3332',
        asset: 'Pallet Jack B2',
        assetId: 'AS-1002',
        date: new Date(Date.now() - 86400000), // yesterday
        action: 'Wheel alignment',
        status: 'completed',
        technician: 'Tom Brown',
        description: 'Adjusted wheel alignment and replaced worn tires',
        parts: 'Tires, bearings',
        condition: 4.2,
      },
    ];
    const insertedMaintenance = await Maintenance.insertMany(maintenance);
    console.log(`Inserted ${insertedMaintenance.length} maintenance records`);

    console.log('Database seeded successfully!');
    console.log(
      'You can now access the data at: http://localhost:5000/api/assets, /api/spare-parts, /api/maintenance'
    );
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
