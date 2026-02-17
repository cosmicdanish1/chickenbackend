# Database Setup Instructions

## Prerequisites

You need PostgreSQL installed and running. If you don't have it:

### Install PostgreSQL
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the `postgres` user

### Alternative: Use Docker
```bash
docker run --name postgres-poultry -e POSTGRES_PASSWORD=Test@1212 -e POSTGRES_DB=poultry -p 5432:5432 -d postgres:13
```

## Manual Database Setup

### Step 1: Connect to PostgreSQL
Open Command Prompt or PowerShell as Administrator and run:

```bash
# If PostgreSQL is in PATH
psql -U postgres

# If not in PATH, navigate to PostgreSQL bin directory first
# Usually: C:\Program Files\PostgreSQL\15\bin\
cd "C:\Program Files\PostgreSQL\15\bin"
psql -U postgres
```

### Step 2: Create Database
In the PostgreSQL prompt:

```sql
-- Create the database
CREATE DATABASE poultry;

-- Connect to the database
\c poultry

-- Create the citext extension
CREATE EXTENSION IF NOT EXISTS citext;
```

### Step 3: Create Schema
Copy and paste the entire content from `schema.sql` into the PostgreSQL prompt, or run:

```bash
psql -U postgres -d poultry -f schema.sql
```

### Step 4: (Optional) Load Sample Data
```bash
psql -U postgres -d poultry -f seed.sql
```

## Quick Test Connection

Test if the database is accessible:

```bash
psql -U postgres -d poultry -c "SELECT version();"
```

## Update .env File

Make sure your `.env` file has the correct credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
DB_NAME=poultry
DB_SYNCHRONIZE=true
```

## Alternative: Use pgAdmin

If you have pgAdmin installed:
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click "Databases" → Create → Database
4. Name it `poultry`
5. Open Query Tool and run the contents of `schema.sql`
6. Optionally run `seed.sql` for sample data

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL service is running
- Check Windows Services for "postgresql-x64-xx"
- Verify port 5432 is not blocked by firewall

### Authentication Issues
- Use the password you set during PostgreSQL installation
- Try connecting with pgAdmin first to verify credentials

### Permission Issues
- Run Command Prompt as Administrator
- Ensure the postgres user has necessary permissions

## Verify Setup

After setup, you should be able to run:
```bash
npm run start:dev
```

And see the backend start successfully without database connection errors.