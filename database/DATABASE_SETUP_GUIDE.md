# Database Setup Guide

Quick guide to set up and populate the Poultry Management System database.

---

## Prerequisites

- PostgreSQL 14+ installed
- Database user with CREATE privileges
- Command line access (psql or pgAdmin)

---

## Quick Start

### Step 1: Check Existing Data

Before doing anything, check what data already exists:

```bash
psql -U postgres -d poultry -f migrations/check-existing-data.sql
```

This will show you:
- How many records are in each table
- Sample data from each table
- Summary of all tables

---

### Step 2: Seed Data (If Needed)

If tables are empty or need more data:

```bash
psql -U postgres -d poultry -f migrations/010_seed_data.sql
```

**This script is SAFE because it:**
- ✅ Checks for existing data first
- ✅ Only inserts if tables are empty
- ✅ Uses `ON CONFLICT DO NOTHING` for safety
- ✅ Shows what it's doing with NOTICE messages

---

## All Migration Files

Located in `BackEnd/migrations/`:

| File | Purpose | When to Use |
|------|---------|-------------|
| `000_master_setup.sql` | Complete schema setup | Fresh install only |
| `004_create_inventory_table.sql` | Inventory table | If missing |
| `008_create_settings_table.sql` | Settings table | If missing |
| `009_create_audit_logs_table.sql` | Audit logs table | If missing |
| `010_seed_data.sql` | Sample data | Anytime (safe) |
| `check-existing-data.sql` | Check current data | Anytime |

---

## Common Scenarios

### Scenario 1: Fresh Database Setup

```bash
# Create database
createdb -U postgres poultry

# Run master setup
psql -U postgres -d poultry -f migrations/000_master_setup.sql

# Add sample data
psql -U postgres -d poultry -f migrations/010_seed_data.sql

# Verify
psql -U postgres -d poultry -f migrations/check-existing-data.sql
```

### Scenario 2: Database Already Exists

```bash
# Check what's there
psql -U postgres -d poultry -f migrations/check-existing-data.sql

# Add sample data if needed (safe - checks first)
psql -U postgres -d poultry -f migrations/010_seed_data.sql
```

### Scenario 3: Add More Sample Data

The seed script only adds data if tables are empty. To add more:

1. Edit `migrations/010_seed_data.sql`
2. Change the condition from `= 0` to `< 20` (or desired number)
3. Run the script

Example:
```sql
-- Change this:
IF (SELECT COUNT(*) FROM farmers) = 0 THEN

-- To this:
IF (SELECT COUNT(*) FROM farmers) < 20 THEN
```

---

## What Gets Seeded

### Users (10 records)
- 1 Admin
- 3 Managers
- 6 Staff members
- All with password: `admin123`

### Vehicles (10 records)
- 5 Trucks
- 3 Vans
- 2 Pickups
- 9 Active, 1 Inactive

### Farmers (10 records)
- Various farm suppliers
- With contact details

### Retailers (10 records)
- Different retail shops
- With owner and contact info

### Purchase Orders (10 records)
- Various suppliers
- Different statuses
- With line items

### Sales (10 records)
- Different product types
- Various payment statuses
- Linked to retailers

### Expenses (10 records)
- Different categories
- Various payment methods

### Inventory (10 records)
- Feed, medicine, equipment
- With stock levels

### Settings (10 records)
- System configuration
- Company information

---

## Verification

After seeding, verify the data:

```bash
psql -U postgres -d poultry -f migrations/check-existing-data.sql
```

Expected output:
```
table_name          | record_count | status
--------------------+--------------+--------
users               |           10 | ✓
vehicles            |           10 | ✓
farmers             |           10 | ✓
retailers           |           10 | ✓
purchase_orders     |           10 | ✓
purchase_order_items|            5 | ✓
sales               |           10 | ✓
expenses            |           10 | ✓
inventory_items     |           10 | ✓
settings            |           10 | ✓
audit_logs          |            0 | ✓
```

---

## Troubleshooting

### Problem: "relation does not exist"

**Solution**: Tables not created yet. Run master setup:
```bash
psql -U postgres -d poultry -f migrations/000_master_setup.sql
```

### Problem: "duplicate key value violates unique constraint"

**Solution**: Data already exists. This is normal and safe. The script will skip existing data.

### Problem: "database does not exist"

**Solution**: Create the database first:
```bash
createdb -U postgres poultry
```

### Problem: "permission denied"

**Solution**: Use a user with proper privileges:
```bash
psql -U postgres -d poultry -f migrations/010_seed_data.sql
```

---

## Database Credentials

Default credentials (change in production):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=poultry
```

Update in `BackEnd/.env` file.

---

## Backup Before Seeding

Always backup before making changes:

```bash
# Full backup
pg_dump -U postgres poultry > backup_before_seed.sql

# Restore if needed
psql -U postgres -d poultry < backup_before_seed.sql
```

---

## Reset Database (Caution!)

To start fresh (WARNING: Deletes all data):

```bash
# Drop and recreate database
dropdb -U postgres poultry
createdb -U postgres poultry

# Run setup
psql -U postgres -d poultry -f migrations/000_master_setup.sql
psql -U postgres -d poultry -f migrations/010_seed_data.sql
```

---

## Documentation

- **Schema Details**: See `DATABASE_SCHEMA.md`
- **ER Diagrams**: See `DATABASE_DIAGRAM.md`
- **API Integration**: See `../Frontend/lib/api.ts`

---

## Quick Commands Reference

```bash
# Check data
psql -U postgres -d poultry -f migrations/check-existing-data.sql

# Seed data
psql -U postgres -d poultry -f migrations/010_seed_data.sql

# Connect to database
psql -U postgres -d poultry

# List tables
\dt

# Describe table
\d users

# Count records
SELECT COUNT(*) FROM users;

# Exit
\q
```

---

## Next Steps

After seeding:

1. ✅ Verify data with check script
2. ✅ Start backend server: `npm run start:dev`
3. ✅ Test API endpoints
4. ✅ Start frontend: `cd Frontend && npm run dev`
5. ✅ Login with: `admin@azizpoultry.com` / `admin123`

---

**Last Updated**: 2024  
**Database**: PostgreSQL 14+  
**Status**: Production Ready
