const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const bcrypt = require('bcrypt');

// Initialize Sequelize connection
const sequelize = new Sequelize('flower_farm_db', process.env.DB_USER || 'Ben', '', {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'production' ? false : console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  }
});

// Define Models
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password_hash'
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'customer',
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: DataTypes.STRING,
  type: DataTypes.STRING,
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  inStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'in_stock'
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true
});

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  orderType: {
    type: DataTypes.STRING,
    defaultValue: 'retail',
    field: 'order_type'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_price'
  },
  pickupLocation: {
    type: DataTypes.STRING,
    field: 'pickup_location'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  orderDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'order_date'
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order_id',
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'product_id',
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'order_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true
});

const CSAOption = sequelize.define('CSAOption', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  description: DataTypes.TEXT,
}, {
  tableName: 'csa_options',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true
});

const CSAMembership = sequelize.define('CSAMembership', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  tier: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  frequency: DataTypes.STRING,
  pickupLocation: {
    type: DataTypes.STRING,
    field: 'pickup_location'
  },
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'start_date'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
  }
}, {
  tableName: 'csa_memberships',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

const BlogPost = sequelize.define('BlogPost', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  author: DataTypes.STRING,
  imageUrl: {
    type: DataTypes.STRING,
    field: 'image_url'
  },
  publishedAt: {
    type: DataTypes.DATE,
    field: 'published_at'
  }
}, {
  tableName: 'blog_posts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true
});

const PlantingCalendar = sequelize.define('PlantingCalendar', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  flower: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  plantMonth: {
    type: DataTypes.INTEGER,
    field: 'plant_month'
  },
  harvestMonth: {
    type: DataTypes.INTEGER,
    field: 'harvest_month'
  },
  notes: DataTypes.TEXT,
}, {
  tableName: 'planting_calendar',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true
});

// Define associations
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(CSAMembership, { foreignKey: 'userId' });
CSAMembership.belongsTo(User, { foreignKey: 'userId' });

// Initialize database
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    await sequelize.sync({ logging: false });
    console.log('✅ Database models synced');

    // Seed demo data if needed
    await seedDatabase();

    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return false;
  }
}

async function seedDatabase() {
  try {
    const userCount = await User.count();
    
    if (userCount === 0) {
      console.log('Seeding demo users...');
      
      const demoHash = await bcrypt.hash('demo123456', 10);
      const adminHash = await bcrypt.hash('admin123456', 10);
      
      await User.bulkCreate([
        {
          name: 'Demo User',
          email: 'demo@farm.com',
          passwordHash: demoHash,
          role: 'customer'
        },
        {
          name: 'Admin User',
          email: 'admin@farm.com',
          passwordHash: adminHash,
          role: 'admin'
        }
      ]);
      
      console.log('✅ Demo users created');
    }

    const productCount = await Product.count();
    if (productCount === 0) {
      console.log('Seeding products...');
      
      await Product.bulkCreate([
        { name: 'Roses', color: 'Red', type: 'stem', price: 3.5, inStock: true },
        { name: 'Tulips', color: 'Yellow', type: 'stem', price: 2.5, inStock: true },
        { name: 'Sunflowers', color: 'Yellow', type: 'stem', price: 1.5, inStock: true },
        { name: 'Dahlias', color: 'Pink', type: 'stem', price: 2.75, inStock: false },
        { name: 'Lavender', color: 'Purple', type: 'stem', price: 1.25, inStock: true }
      ]);
      
      console.log('✅ Products created');
    }

    const csaCount = await CSAOption.count();
    if (csaCount === 0) {
      console.log('Seeding CSA options...');
      
      await CSAOption.bulkCreate([
        { name: 'Small', price: 40.00, description: 'Perfect for apartments - 20 stems' },
        { name: 'Medium', price: 60.00, description: 'Great for homes - 30 stems' },
        { name: 'Large', price: 85.00, description: 'For flower lovers - 50 stems' }
      ]);
      
      console.log('✅ CSA options created');
    }

  } catch (error) {
    console.error('Seeding error:', error);
  }
}

// Export models and utilities
module.exports = {
  sequelize,
  initializeDatabase,
  User,
  Product,
  Order,
  OrderItem,
  CSAOption,
  CSAMembership,
  BlogPost,
  PlantingCalendar
};
