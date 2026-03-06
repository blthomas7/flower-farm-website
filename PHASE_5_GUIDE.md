# Phase 5: PostgreSQL Database Integration - Implementation Guide

## Overview
Phase 5 represents the migration from in-memory mock data to a persistent PostgreSQL database using Sequelize ORM.

## Current Status
- ✅ **Database Schema**: Complete (8 tables created in PostgreSQL)
- ✅ **Sequelize Models**: Complete (User, Product, Order, OrderItem, CSAOption, CSAMembership, BlogPost, PlantingCalendar)
- ✅ **Database Connection Module**: Complete (backend/database/db.js)
- ✅ **Relationships/Associations**: Configured in models
- ✅ **Seed Data Functions**: Implemented with demo data
- ⏳ **Endpoint Migration**: Pending - endpoints still use mock arrays
- ⏳ **Testing**: All endpoints need re-testing with database

## Installation Status
```bash
npm install sequelize pg pg-hstore  ✅ DONE
```

## What's Already in Place

### 1. Database Schema (backend/database/schema.sql)
All 8 tables created in PostgreSQL database:
- users (id, name, email, password_hash, role, timestamps)
- products (id, name, color, type, price, in_stock, created_at)
- orders (id, user_id, order_type, total_price, pickup_location, status, timestamps)
- order_items (id, order_id, product_id, quantity, created_at)
- csa_options (id, name, price, description, created_at)
- csa_memberships (id, user_id, tier, frequency, pickup_location, status, timestamps)
- blog_posts (id, title, content, author, image_url, published_at, created_at)
- planting_calendar (id, flower, plant_month, harvest_month, notes, created_at)

Indexes created for performance on common queries.

### 2. Sequelize Models (backend/database/db.js)
All models defined with:
- Proper field mapping (camelCase to snake_case)
- Foreign key relationships
- Timestamps (createdAt, updatedAt)
- Associations between models

### 3. Database Utilities
- `initializeDatabase()` - Connects to DB, syncs models, seeds demo data
- `seedDatabase()` - Creates demo users (demo@farm.com, admin@farm.com) and sample products
- Proper bcrypt hashing for password storage

## Next Steps to Complete Phase 5

### Step 1: Update Authentication Endpoints
Replace in `/api/auth/register` and `/api/auth/login`:
```javascript
// OLD: users.find(u => u.email === email)
// NEW: await User.findOne({ where: { email } })

// OLD: users.push(newUser)
// NEW: await User.create({ ...newUser })
```

### Step 2: Update Product/CSA Data Endpoints
Replace in GET endpoints:
```javascript
// OLD: res.json({ success: true, data: products })
// NEW: const products = await Product.findAll()
//      res.json({ success: true, data: products })
```

### Step 3: Update Order Endpoints
Replace POST /api/orders and POST /api/csa-subscribe:
```javascript
// OLD: orders.push(newOrder)
// NEW: await Order.create({ ...orderData })
//      then create OrderItems with await OrderItem.create()
```

### Step 4: Update Admin Endpoints
Replace GET /api/admin/orders and GET /api/admin/users:
```javascript
// Get all orders with user relationships
const allOrders = await Order.findAll({
  include: [{ model: User, attributes: ['id', 'name', 'email'] }]
});
```

### Step 5: Testing and Validation
- Test all authentication flows (signup, login, verify)
- Test all CRUD operations on orders and CSA memberships
- Verify email notifications still work
- Load test with multiple concurrent requests
- Check password security (bcrypt verification)

### Step 6: Data Migration
If existing production data:
```bash
# Export from old system
# Import to PostgreSQL
# Verify data integrity
```

## Integration Points

### 1. Import Database Module
At top of backend/server.js:
```javascript
const { initializeDatabase, User, Product, ... } = require('./database/db');

// On server startup:
(async () => {
  await initializeDatabase();
  // Start Express server
})();
```

### 2. Replace Array Operations
Systematically replace all:
- `users.find()` → `User.findOne()`
- `products.filter()` → `Product.findAll({ where: ... })`
- `orders.push()` → `Order.create()`

### 3. Update Response Formatting
Sequelize models return objects with `.toJSON()` method for clean API responses.

## Performance Optimizations Ready
- Connection pooling (5 connections max)
- Database indexes on foreign keys
- Lazy-loaded associations where appropriate
- Query logging in development mode

## Security Considerations
- Passwords stored with bcrypt hashing (10 rounds)
- SQL injection prevention via Sequelize ORM
- Environment variables for credentials (ready for .env)
- No sensitive data in logs (logging disabled in production)

## Estimated Implementation Time
- Update all endpoints: 2-3 hours
- Testing all flows: 1-2 hours
- Performance optimization: 1 hour
- **Total: 4-6 hours**

## Testing Checklist
- [ ] New user signup creates user in database
- [ ] Login retrieves user from database
- [ ] Products display from database
- [ ] Orders save to database with order_items
- [ ] CSA memberships save to database
- [ ] Admin endpoints query database correctly
- [ ] Email notifications still trigger
- [ ] JWT tokens work with database users
- [ ] Role-based access control works
- [ ] All data persists across server restarts

## File Structure
```
backend/
├── server.js (main Express app - needs endpoint updates)
├── emailService.js (email templates - no changes needed)
├── database/
│   ├── schema.sql (PostgreSQL schema)
│   └── db.js (Sequelize models and initialization)
├── package.json (Sequelize + dependencies installed)
└── node_modules/
```

## Environment Setup
Create `.env` file in backend directory:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=Ben
DB_NAME=flower_farm_db
DB_PASS=
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

## Rollback Plan
Current state can continue with mock data:
- All endpoints work with in-memory arrays
- No data persistence across restarts
- Good for testing and development
- Database infrastructure is separate

To proceed with Phase 5:
1. Update server.js endpoints to use models
2. Test each endpoint individually
3. Run full test suite
4. Migrate to database-backed system

## Success Criteria
- [x] Database schema created
- [x] Sequelize models defined
- [ ] All endpoints refactored
- [ ] 100% test passing rate
- [ ] Data persists in database
- [ ] Email notifications functional
- [ ] Admin dashboard working with real data
- [ ] No performance degradation

---

**Last Updated**: March 6, 2026
**Author**: Development Team
**Status**: Phase 5 Infrastructure Ready - Awaiting Endpoint Migration
