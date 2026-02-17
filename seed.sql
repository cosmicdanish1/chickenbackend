-- Poultry backend seed data for testing
-- Assumes schema.sql has already been run and database "poultry" selected

-- Admin user with hashed password (password: admin123)
INSERT INTO users (name, email, password_hash, role) VALUES 
  ('Admin User', 'admin@azizpoultry.com', '$2b$10$68xJLxQyW86mkkFaS/zuzuir/fk1XuDt0Z8ZdoC8PK2s3boIwFV/e', 'admin');

-- Sample vehicles
INSERT INTO vehicles (
  vehicle_number,
  vehicle_type,
  driver_name,
  phone,
  owner_name,
  address,
  total_capacity,
  petrol_tank_capacity,
  mileage,
  join_date,
  status,
  note
) VALUES
  ('MH12AB1234', 'Truck', 'Ramesh Kumar', '9876543210', 'Aziz Poultry Farms', 'Pune, Maharashtra', 240, 150.0, 6.5, '2024-01-15', 'active', 'Primary delivery truck'),
  ('MH12CD5678', 'Mini Truck', 'Suresh Patil', '9876501234', 'Aziz Poultry Farms', 'Pune, Maharashtra', 130, 80.0, 9.2, '2024-03-10', 'active', 'Used for short distance deliveries'),
  ('MH12EF9012', 'Pickup Van', 'Mahesh Yadav', '9876512345', 'Aziz Poultry Farms', 'Pune, Maharashtra', 42, 60.0, 11.0, '2024-05-01', 'inactive', 'Under maintenance');

-- Sample farmers
INSERT INTO farmers (name, phone, email, address, notes) VALUES
  ('Farmer A', '9000000001', 'farmer.a@example.com', 'Village A, Taluka X', 'Supplies broiler birds'),
  ('Farmer B', '9000000002', 'farmer.b@example.com', 'Village B, Taluka Y', 'Layer bird supplier');

-- Sample retailers
INSERT INTO retailers (name, owner_name, phone, email, address, notes) VALUES
  ('Fresh Eggs Center', 'Rahul Sharma', '8000000001', 'fresh.eggs@example.com', 'Market Road, Pune', 'Regular egg retailer'),
  ('Prime Chicken Shop', 'Imran Khan', '8000000002', 'prime.chicken@example.com', 'City Center, Pune', 'Bulk meat buyer');

-- Sample inventory items
INSERT INTO inventory_items (name, item_type, quantity, unit, min_stock_level, last_updated_at) VALUES
  ('Layer Birds Batch A', 'birds', 1500, 'birds', 1000, NOW() - INTERVAL '2 days'),
  ('Broiler Feed 50kg Bags', 'feed', 80, 'bags', 50, NOW() - INTERVAL '1 day'),
  ('Medicine Pack', 'supplies', 20, 'packs', 10, NOW());

-- Sample expenses
INSERT INTO expenses (expense_date, category, description, amount, payment_method, notes) VALUES
  (CURRENT_DATE - INTERVAL '10 days', 'feed', 'Purchase of broiler feed', 25000.00, 'bank_transfer', 'Payment to main feed supplier'),
  (CURRENT_DATE - INTERVAL '5 days', 'labor', 'Monthly staff salaries', 40000.00, 'bank_transfer', 'Salary for 5 workers'),
  (CURRENT_DATE - INTERVAL '3 days', 'medicine', 'Vaccination medicine', 8000.00, 'cash', 'Vaccines for new batch');

