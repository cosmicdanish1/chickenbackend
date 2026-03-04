const { Client } = require('pg');
require('dotenv').config();

async function seedDatabase() {
  const connectionConfig = process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      };

  const client = new Client(connectionConfig);

  try {
    await client.connect();
    console.log('✓ Connected to database\n');

    // Clear existing data (except users)
    console.log('Clearing existing data...');
    await client.query('DELETE FROM purchase_order_items');
    await client.query('DELETE FROM purchase_orders');
    await client.query('DELETE FROM sales');
    await client.query('DELETE FROM expenses');
    await client.query('DELETE FROM godown_sales');
    await client.query('DELETE FROM godown_mortality');
    await client.query('DELETE FROM godown_expenses');
    await client.query('DELETE FROM godown_inward_entries');
    await client.query('DELETE FROM inventory_items');
    await client.query('DELETE FROM vehicles WHERE id > 1');
    await client.query('DELETE FROM retailers WHERE id > 1');
    await client.query('DELETE FROM farmers WHERE id > 1');
    console.log('✓ Cleared existing data\n');

    // Seed Farmers
    console.log('Seeding Farmers...');
    const farmerData = [
      { name: 'Ahmed Khan', phone: '03001234567', email: 'ahmed@example.com', address: 'Village Chak 123, Faisalabad', status: 'active' },
      { name: 'Muhammad Ali', phone: '03011234567', email: 'ali@example.com', address: 'Village Kot Addu, Muzaffargarh', status: 'active' },
      { name: 'Hassan Raza', phone: '03021234567', email: 'hassan@example.com', address: 'Village Jaranwala, Faisalabad', status: 'active' },
      { name: 'Usman Tariq', phone: '03031234567', email: 'usman@example.com', address: 'Village Samundri, Faisalabad', status: 'active' },
      { name: 'Bilal Ahmed', phone: '03041234567', email: 'bilal@example.com', address: 'Village Tandlianwala, Faisalabad', status: 'inactive' },
    ];

    for (const farmer of farmerData) {
      await client.query(
        `INSERT INTO farmers (name, phone, email, address, status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [farmer.name, farmer.phone, farmer.email, farmer.address, farmer.status, 'Reliable supplier']
      );
    }
    console.log(`✓ Added ${farmerData.length} farmers\n`);

    // Seed Retailers
    console.log('Seeding Retailers...');
    const retailerData = [
      { name: 'Al-Madina Poultry Shop', ownerName: 'Imran Sheikh', phone: '03111234567', email: 'madina@example.com', address: 'Main Bazar, Faisalabad', status: 'active' },
      { name: 'City Chicken Center', ownerName: 'Kashif Mahmood', phone: '03121234567', email: 'city@example.com', address: 'Ghulam Muhammad Abad, Faisalabad', status: 'active' },
      { name: 'Fresh Poultry Mart', ownerName: 'Nadeem Abbas', phone: '03131234567', email: 'fresh@example.com', address: 'Peoples Colony, Faisalabad', status: 'active' },
      { name: 'Royal Chicken Shop', ownerName: 'Tariq Mehmood', phone: '03141234567', email: 'royal@example.com', address: 'Samanabad, Faisalabad', status: 'active' },
      { name: 'Green Valley Poultry', ownerName: 'Shahid Iqbal', phone: '03151234567', email: 'green@example.com', address: 'Millat Town, Faisalabad', status: 'inactive' },
    ];

    const retailerIds = {};
    for (const retailer of retailerData) {
      const result = await client.query(
        `INSERT INTO retailers (name, owner_name, phone, email, address, status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [retailer.name, retailer.ownerName, retailer.phone, retailer.email, retailer.address, retailer.status, 'Regular customer']
      );
      retailerIds[retailer.name] = result.rows[0].id;
    }
    console.log(`✓ Added ${retailerData.length} retailers\n`);

    // Seed Vehicles
    console.log('Seeding Vehicles...');
    const vehicleData = [
      { vehicleNumber: 'LES-1234', vehicleType: 'Truck', driverName: 'Akram Ali', phone: '03211234567', ownerName: 'Aziz Poultry', totalCapacity: '5000', petrolTankCapacity: '100', mileage: '8', status: 'active' },
      { vehicleNumber: 'LES-5678', vehicleType: 'Mini Truck', driverName: 'Rashid Khan', phone: '03221234567', ownerName: 'Aziz Poultry', totalCapacity: '3000', petrolTankCapacity: '80', mileage: '10', status: 'active' },
      { vehicleNumber: 'LES-9012', vehicleType: 'Pickup Van', driverName: 'Zahid Hussain', phone: '03231234567', ownerName: 'Aziz Poultry', totalCapacity: '1500', petrolTankCapacity: '60', mileage: '12', status: 'active' },
      { vehicleNumber: 'LES-3456', vehicleType: 'Truck', driverName: 'Farhan Ahmed', phone: '03241234567', ownerName: 'Aziz Poultry', totalCapacity: '5000', petrolTankCapacity: '100', mileage: '8', status: 'inactive' },
    ];

    for (const vehicle of vehicleData) {
      await client.query(
        `INSERT INTO vehicles (vehicle_number, vehicle_type, driver_name, phone, owner_name, address, total_capacity, petrol_tank_capacity, mileage, join_date, status, note) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE, $10, $11)`,
        [vehicle.vehicleNumber, vehicle.vehicleType, vehicle.driverName, vehicle.phone, vehicle.ownerName, 'Faisalabad', vehicle.totalCapacity, vehicle.petrolTankCapacity, vehicle.mileage, vehicle.status, 'Company vehicle']
      );
    }
    console.log(`✓ Added ${vehicleData.length} vehicles\n`);

    // Seed Purchase Orders
    console.log('Seeding Purchase Orders...');
    const purchaseOrders = [
      { orderNumber: 'PO-2024-001', supplierName: 'Ahmed Khan', orderDate: '2024-02-15', totalAmount: 250000, transportCharges: 5000, loadingCharges: 2000, commission: 3000, grossAmount: 260000, netAmount: 258000, status: 'received' },
      { orderNumber: 'PO-2024-002', supplierName: 'Muhammad Ali', orderDate: '2024-02-20', totalAmount: 180000, transportCharges: 4000, loadingCharges: 1500, commission: 2500, weightShortage: 1000, grossAmount: 188000, netAmount: 187000, status: 'received' },
      { orderNumber: 'PO-2024-003', supplierName: 'Hassan Raza', orderDate: '2024-02-25', totalAmount: 320000, transportCharges: 6000, loadingCharges: 2500, commission: 4000, grossAmount: 332500, netAmount: 332500, status: 'received' },
      { orderNumber: 'PO-2024-004', supplierName: 'Usman Tariq', orderDate: '2024-03-01', totalAmount: 150000, transportCharges: 3500, loadingCharges: 1200, commission: 2000, grossAmount: 156700, netAmount: 156700, status: 'pending' },
    ];

    for (const po of purchaseOrders) {
      await client.query(
        `INSERT INTO purchase_orders (order_number, supplier_name, order_date, status, total_amount, transport_charges, loading_charges, commission, other_charges, weight_shortage, mortality_deduction, other_deduction, gross_amount, net_amount, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, 0, 0, $10, $11, $12)`,
        [po.orderNumber, po.supplierName, po.orderDate, po.status, po.totalAmount, po.transportCharges, po.loadingCharges, po.commission, po.weightShortage || 0, po.grossAmount, po.netAmount, 'Quality birds received']
      );

      // Add items for each purchase order
      const poResult = await client.query('SELECT id FROM purchase_orders WHERE order_number = $1', [po.orderNumber]);
      const poId = poResult.rows[0].id;

      await client.query(
        `INSERT INTO purchase_order_items (purchase_order_id, description, quantity, unit, unit_cost, line_total) 
         VALUES ($1, 'Live Chickens', 2000, 'birds', $2, $3)`,
        [poId, (po.totalAmount / 2000).toFixed(2), po.totalAmount]
      );
    }
    console.log(`✓ Added ${purchaseOrders.length} purchase orders\n`);

    // Seed Sales
    console.log('Seeding Sales...');
    const sales = [
      { invoiceNumber: 'INV-2024-001', customerName: 'Al-Madina Poultry Shop', saleDate: '2024-02-16', saleMode: 'from_vehicle', productType: 'meat', quantity: 500, unitPrice: 180, totalAmount: 90000, transportCharges: 1000, grossAmount: 91000, netAmount: 91000, paymentStatus: 'paid', amountReceived: 91000 },
      { invoiceNumber: 'INV-2024-002', customerName: 'City Chicken Center', saleDate: '2024-02-21', saleMode: 'from_vehicle', productType: 'meat', quantity: 400, unitPrice: 185, totalAmount: 74000, transportCharges: 800, grossAmount: 74800, netAmount: 74800, paymentStatus: 'paid', amountReceived: 74800 },
      { invoiceNumber: 'INV-2024-003', customerName: 'Fresh Poultry Mart', saleDate: '2024-02-26', saleMode: 'from_godown', productType: 'meat', quantity: 600, unitPrice: 190, totalAmount: 114000, transportCharges: 1200, grossAmount: 115200, netAmount: 115200, paymentStatus: 'partial', amountReceived: 80000 },
      { invoiceNumber: 'INV-2024-004', customerName: 'Royal Chicken Shop', saleDate: '2024-03-02', saleMode: 'from_vehicle', productType: 'meat', quantity: 350, unitPrice: 188, totalAmount: 65800, transportCharges: 700, grossAmount: 66500, netAmount: 66500, paymentStatus: 'pending', amountReceived: 0 },
    ];

    for (const sale of sales) {
      const retailerId = retailerIds[sale.customerName];
      await client.query(
        `INSERT INTO sales (invoice_number, customer_name, sale_date, sale_mode, product_type, quantity, unit, unit_price, total_amount, transport_charges, loading_charges, commission, other_charges, weight_shortage, mortality_deduction, other_deduction, gross_amount, net_amount, payment_status, amount_received, notes, retailer_id) 
         VALUES ($1, $2, $3, $4, $5, $6, 'kg', $7, $8, $9, 0, 0, 0, 0, 0, 0, $10, $11, $12, $13, $14, $15)`,
        [sale.invoiceNumber, sale.customerName, sale.saleDate, sale.saleMode, sale.productType, sale.quantity, sale.unitPrice, sale.totalAmount, sale.transportCharges, sale.grossAmount, sale.netAmount, sale.paymentStatus, sale.amountReceived, 'Fresh quality birds', retailerId]
      );
    }
    console.log(`✓ Added ${sales.length} sales\n`);

    // Seed Expenses
    console.log('Seeding Expenses...');
    const expenses = [
      { expenseDate: '2024-02-15', expenseOwner: 'Muhammad Aziz', category: 'feed', description: 'Chicken Feed - 50 bags', amount: 25000, paymentMethod: 'bank_transfer' },
      { expenseDate: '2024-02-18', expenseOwner: 'Farm Manager', category: 'labor', description: 'Worker Salaries - February', amount: 45000, paymentMethod: 'cash' },
      { expenseDate: '2024-02-20', expenseOwner: 'Veterinary Dept', category: 'medicine', description: 'Vaccines and Medicines', amount: 15000, paymentMethod: 'bank_transfer' },
      { expenseDate: '2024-02-22', expenseOwner: 'Admin', category: 'utilities', description: 'Electricity Bill - February', amount: 12000, paymentMethod: 'bank_transfer' },
      { expenseDate: '2024-02-25', expenseOwner: 'Maintenance Team', category: 'maintenance', description: 'Shed Repairs', amount: 8000, paymentMethod: 'cash' },
      { expenseDate: '2024-02-28', expenseOwner: 'Transport Manager', category: 'transportation', description: 'Vehicle Fuel', amount: 18000, paymentMethod: 'cash' },
    ];

    for (const expense of expenses) {
      await client.query(
        `INSERT INTO expenses (expense_date, expense_owner, category, description, amount, payment_method, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [expense.expenseDate, expense.expenseOwner, expense.category, expense.description, expense.amount, expense.paymentMethod, 'Regular expense']
      );
    }
    console.log(`✓ Added ${expenses.length} expenses\n`);

    // Seed Inventory Items
    console.log('Seeding Inventory Items...');
    const inventoryItems = [
      { itemType: 'feed', itemName: 'Starter Feed', quantity: 500, unit: 'kg', minimumStockLevel: 100, currentStockLevel: 500 },
      { itemType: 'feed', itemName: 'Grower Feed', quantity: 800, unit: 'kg', minimumStockLevel: 200, currentStockLevel: 800 },
      { itemType: 'medicine', itemName: 'Antibiotics', quantity: 50, unit: 'bottles', minimumStockLevel: 10, currentStockLevel: 50 },
      { itemType: 'medicine', itemName: 'Vaccines', quantity: 100, unit: 'doses', minimumStockLevel: 20, currentStockLevel: 100 },
      { itemType: 'equipment', itemName: 'Feeders', quantity: 30, unit: 'pieces', minimumStockLevel: 5, currentStockLevel: 30 },
      { itemType: 'equipment', itemName: 'Drinkers', quantity: 40, unit: 'pieces', minimumStockLevel: 10, currentStockLevel: 40 },
    ];

    for (const item of inventoryItems) {
      await client.query(
        `INSERT INTO inventory_items (item_type, item_name, quantity, unit, minimum_stock_level, current_stock_level, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [item.itemType, item.itemName, item.quantity, item.unit, item.minimumStockLevel, item.currentStockLevel, 'In stock']
      );
    }
    console.log(`✓ Added ${inventoryItems.length} inventory items\n`);

    // Seed Godown Inward Entries
    console.log('Seeding Godown Inward Entries...');
    const godownInward = [
      { entryDate: '2024-02-16', supplierName: 'Ahmed Khan', purchaseInvoiceNo: 'PO-2024-001', numberOfBirds: 1000, averageWeight: 1.5, totalWeight: 1500, ratePerKg: 125, totalAmount: 187500 },
      { entryDate: '2024-02-21', supplierName: 'Muhammad Ali', purchaseInvoiceNo: 'PO-2024-002', numberOfBirds: 800, averageWeight: 1.6, totalWeight: 1280, ratePerKg: 128, totalAmount: 163840 },
      { entryDate: '2024-02-26', supplierName: 'Hassan Raza', purchaseInvoiceNo: 'PO-2024-003', numberOfBirds: 1200, averageWeight: 1.4, totalWeight: 1680, ratePerKg: 130, totalAmount: 218400 },
    ];

    for (const entry of godownInward) {
      await client.query(
        `INSERT INTO godown_inward_entries (entry_date, supplier_name, purchase_invoice_no, number_of_birds, average_weight, total_weight, rate_per_kg, total_amount, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [entry.entryDate, entry.supplierName, entry.purchaseInvoiceNo, entry.numberOfBirds, entry.averageWeight, entry.totalWeight, entry.ratePerKg, entry.totalAmount, 'Quality birds']
      );
    }
    console.log(`✓ Added ${godownInward.length} godown inward entries\n`);

    // Seed Godown Sales
    console.log('Seeding Godown Sales...');
    const godownSales = [
      { saleDate: '2024-02-17', customerName: 'Fresh Poultry Mart', invoiceNumber: 'GS-001', numberOfBirds: 300, averageWeight: 1.5, totalWeight: 450, ratePerKg: 180, totalAmount: 81000, paymentStatus: 'paid', amountReceived: 81000 },
      { saleDate: '2024-02-22', customerName: 'Royal Chicken Shop', invoiceNumber: 'GS-002', numberOfBirds: 250, averageWeight: 1.6, totalWeight: 400, ratePerKg: 185, totalAmount: 74000, paymentStatus: 'paid', amountReceived: 74000 },
      { saleDate: '2024-02-27', customerName: 'City Chicken Center', invoiceNumber: 'GS-003', numberOfBirds: 400, averageWeight: 1.4, totalWeight: 560, ratePerKg: 190, totalAmount: 106400, paymentStatus: 'partial', amountReceived: 80000 },
    ];

    for (const sale of godownSales) {
      await client.query(
        `INSERT INTO godown_sales (sale_date, customer_name, invoice_number, number_of_birds, average_weight, total_weight, rate_per_kg, total_amount, payment_status, amount_received, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [sale.saleDate, sale.customerName, sale.invoiceNumber, sale.numberOfBirds, sale.averageWeight, sale.totalWeight, sale.ratePerKg, sale.totalAmount, sale.paymentStatus, sale.amountReceived, 'Godown sale']
      );
    }
    console.log(`✓ Added ${godownSales.length} godown sales\n`);

    // Seed Godown Mortality
    console.log('Seeding Godown Mortality...');
    const godownMortality = [
      { mortalityDate: '2024-02-17', numberOfBirdsDied: 15, reason: 'Disease' },
      { mortalityDate: '2024-02-23', numberOfBirdsDied: 10, reason: 'Heat Stress' },
      { mortalityDate: '2024-02-28', numberOfBirdsDied: 8, reason: 'Unknown' },
    ];

    for (const mortality of godownMortality) {
      await client.query(
        `INSERT INTO godown_mortality (mortality_date, number_of_birds_died, reason, notes) 
         VALUES ($1, $2, $3, $4)`,
        [mortality.mortalityDate, mortality.numberOfBirdsDied, mortality.reason, 'Recorded mortality']
      );
    }
    console.log(`✓ Added ${godownMortality.length} godown mortality records\n`);

    // Seed Godown Expenses
    console.log('Seeding Godown Expenses...');
    const godownExpenses = [
      { expenseDate: '2024-02-16', category: 'feed', description: 'Bird Feed', amount: 8000, paymentMethod: 'cash' },
      { expenseDate: '2024-02-20', category: 'labor', description: 'Worker Wages', amount: 5000, paymentMethod: 'cash' },
      { expenseDate: '2024-02-25', category: 'utilities', description: 'Electricity', amount: 3000, paymentMethod: 'bank_transfer' },
      { expenseDate: '2024-02-28', category: 'maintenance', description: 'Shed Cleaning', amount: 2000, paymentMethod: 'cash' },
    ];

    for (const expense of godownExpenses) {
      await client.query(
        `INSERT INTO godown_expenses (expense_date, category, description, amount, payment_method, notes) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [expense.expenseDate, expense.category, expense.description, expense.amount, expense.paymentMethod, 'Godown expense']
      );
    }
    console.log(`✓ Added ${godownExpenses.length} godown expenses\n`);

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\nSummary:');
    console.log(`  • ${farmerData.length} Farmers`);
    console.log(`  • ${retailerData.length} Retailers`);
    console.log(`  • ${vehicleData.length} Vehicles`);
    console.log(`  • ${purchaseOrders.length} Purchase Orders`);
    console.log(`  • ${sales.length} Sales`);
    console.log(`  • ${expenses.length} Expenses`);
    console.log(`  • ${inventoryItems.length} Inventory Items`);
    console.log(`  • ${godownInward.length} Godown Inward Entries`);
    console.log(`  • ${godownSales.length} Godown Sales`);
    console.log(`  • ${godownMortality.length} Godown Mortality Records`);
    console.log(`  • ${godownExpenses.length} Godown Expenses`);
    console.log('\nYou can now view this data in the frontend!');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seedDatabase();
