# Poultry Management System - Backend

A NestJS-based backend API for managing poultry farm operations including vehicles, farmers, retailers, purchases, sales, expenses, and dashboard analytics.

## Features Implemented

### Phase 1 - Authentication & Master Data ✅
- **Authentication**: JWT-based login system
- **Users Management**: CRUD operations for users with roles
- **Farmers Management**: Complete CRUD for farmer records
- **Retailers Management**: Complete CRUD for retailer records
- **Vehicles Management**: Complete CRUD for vehicle records

### Phase 2 - Core Operations ✅
- **Purchase Orders**: Full purchase order management with line items
- **Sales Management**: Complete sales tracking with payment status
- **Expenses Management**: Expense tracking with categories and payment methods

### Phase 3 - Dashboard & Analytics ✅
- **Dashboard KPIs**: Revenue, expenses, profit calculations
- **Analytics**: Revenue by product type, expenses by category
- **Recent Activity**: Latest sales and expenses

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Validation**: class-validator and class-transformer
- **Password Hashing**: bcrypt

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE poultry;
```

2. Run the schema creation:
```bash
psql -U postgres -d poultry -f schema.sql
```

3. (Optional) Load seed data:
```bash
psql -U postgres -d poultry -f seed.sql
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and update the database credentials:

```bash
cp .env.example .env
```

Update the database configuration in `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=poultry
```

### 4. Start the Application

Development mode:
```bash
npm run start:dev
```

Production build:
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3001/api/v1`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login

### Users
- `GET /api/v1/users` - List all users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Farmers
- `GET /api/v1/farmers` - List all farmers
- `POST /api/v1/farmers` - Create farmer
- `GET /api/v1/farmers/:id` - Get farmer by ID
- `PATCH /api/v1/farmers/:id` - Update farmer
- `DELETE /api/v1/farmers/:id` - Delete farmer

### Retailers
- `GET /api/v1/retailers` - List all retailers
- `POST /api/v1/retailers` - Create retailer
- `GET /api/v1/retailers/:id` - Get retailer by ID
- `PATCH /api/v1/retailers/:id` - Update retailer
- `DELETE /api/v1/retailers/:id` - Delete retailer

### Vehicles
- `GET /api/v1/vehicles` - List all vehicles
- `POST /api/v1/vehicles` - Create vehicle
- `GET /api/v1/vehicles/:id` - Get vehicle by ID
- `PATCH /api/v1/vehicles/:id` - Update vehicle
- `DELETE /api/v1/vehicles/:id` - Delete vehicle

### Purchase Orders
- `GET /api/v1/purchases` - List purchase orders (with filters)
- `POST /api/v1/purchases` - Create purchase order
- `GET /api/v1/purchases/:id` - Get purchase order by ID
- `PATCH /api/v1/purchases/:id` - Update purchase order
- `PATCH /api/v1/purchases/:id/status` - Update order status
- `DELETE /api/v1/purchases/:id` - Delete purchase order

### Sales
- `GET /api/v1/sales` - List sales (with filters)
- `POST /api/v1/sales` - Create sale
- `GET /api/v1/sales/:id` - Get sale by ID
- `PATCH /api/v1/sales/:id` - Update sale
- `PATCH /api/v1/sales/:id/payment` - Update payment status
- `DELETE /api/v1/sales/:id` - Delete sale

### Expenses
- `GET /api/v1/expenses` - List expenses (with filters)
- `POST /api/v1/expenses` - Create expense
- `GET /api/v1/expenses/:id` - Get expense by ID
- `PATCH /api/v1/expenses/:id` - Update expense
- `DELETE /api/v1/expenses/:id` - Delete expense
- `GET /api/v1/expenses/by-category` - Get expenses grouped by category
- `GET /api/v1/expenses/total` - Get total expenses

### Dashboard
- `GET /api/v1/dashboard/kpis` - Get dashboard KPIs
- `GET /api/v1/dashboard/revenue-by-product` - Revenue breakdown by product type
- `GET /api/v1/dashboard/expenses-by-category` - Expenses breakdown by category
- `GET /api/v1/dashboard/recent-sales` - Recent sales activity
- `GET /api/v1/dashboard/recent-expenses` - Recent expenses activity

### Health Check
- `GET /api/v1/health` - API health status

## Default Admin User

After running the seed data, you can login with:
- **Email**: admin@azizpoultry.com
- **Password**: admin123

## Query Parameters

Many endpoints support filtering with query parameters:

### Date Range Filtering
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)

### Sales Filters
- `customer` - Filter by customer name
- `productType` - Filter by product type (eggs, meat, chicks, other)
- `paymentStatus` - Filter by payment status (paid, pending, partial)

### Purchase Filters
- `supplier` - Filter by supplier name
- `status` - Filter by status (pending, received, cancelled)

### Expense Filters
- `category` - Filter by category (feed, labor, medicine, etc.)
- `paymentMethod` - Filter by payment method (cash, bank_transfer, etc.)

## Development

The project follows NestJS best practices with:
- Modular architecture
- DTOs for validation
- Service layer for business logic
- Repository pattern with TypeORM
- Global validation and error handling
- CORS enabled for frontend integration

## Next Steps

Refer to `phase-plan.md` for remaining features to implement:
- Godown Management
- Mortality Tracking
- Settings Management
- Audit Logs
- Report Generation