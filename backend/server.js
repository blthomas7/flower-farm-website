const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail, sendCSASubscriptionEmail, sendOrderConfirmationEmail, sendCSAWeeklyBoxEmail } = require('./emailService');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-change-in-production'; // TODO: Move to environment variable

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// MOCK USER STORAGE (Phase 5 will use database)
// ============================================
const users = [
  {
    id: 1,
    email: 'demo@farm.com',
    name: 'Demo User',
    passwordHash: '$2b$10$YourHashedPasswordHere', // Will be replaced with real hash
    role: 'customer',
    createdAt: new Date()
  }
];

// Initialize demo user with proper hash
(async () => {
  const hashedPassword = await bcrypt.hash('demo123456', 10);
  users[0].passwordHash = hashedPassword;
  
  // Add admin demo user
  const adminHash = await bcrypt.hash('admin123456', 10);
  users.push({
    id: 2,
    email: 'admin@farm.com',
    name: 'Admin User',
    passwordHash: adminHash,
    role: 'admin',
    createdAt: new Date()
  });
})();

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

// Verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Verify admin role
const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No token provided' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// POST /api/auth/register - Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      passwordHash,
      role: 'customer',
      createdAt: new Date()
    };

    users.push(newUser);

    // Send welcome email (fire and forget to not block response)
    sendWelcomeEmail(newUser.name, newUser.email).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    // Create JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login - Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/verify - Verify token and get user info
app.get('/api/auth/verify', verifyToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// ============================================
// MOCK DATA
// ============================================

// Mock products (flowers)
const products = [
  {
    id: 1,
    name: 'Roses',
    color: 'Red',
    type: 'stem',
    price: 3.50,
    inStock: true,
    inStockQty: 150,
    description: 'Beautiful long-stem red roses, perfect for bouquets and arrangements.',
    season: 'year-round',
    vaseLIfe: 10
  },
  {
    id: 2,
    name: 'Dahlias',
    color: 'Mixed',
    type: 'stem',
    price: 2.75,
    inStock: true,
    inStockQty: 200,
    description: 'Stunning dahlia flowers with multiple color options. Full, dramatic blooms.',
    season: 'summer-fall',
    vaseLife: 7
  },
  {
    id: 3,
    name: 'Sunflowers',
    color: 'Yellow',
    type: 'stem',
    price: 1.50,
    inStock: true,
    inStockQty: 300,
    description: 'Bright cheerful sunflowers, great for events and decorations.',
    season: 'summer',
    vaseLife: 12
  },
  {
    id: 4,
    name: 'Tulips',
    color: 'Mixed',
    type: 'stem',
    price: 2.00,
    inStock: true,
    inStockQty: 180,
    description: 'Spring classics in multiple color combinations.',
    season: 'spring',
    vaseLife: 9
  },
  {
    id: 5,
    name: 'Lavender',
    color: 'Purple',
    type: 'stem',
    price: 1.25,
    inStock: true,
    inStockQty: 250,
    description: 'Fragrant purple lavender bundles. Fresh or dried.',
    season: 'summer',
    vaseLife: 14
  },
  {
    id: 6,
    name: 'Mixed Bouquet',
    color: 'Mixed',
    type: 'bundle',
    price: 45.00,
    inStock: true,
    inStockQty: 20,
    description: 'Our signature mixed bouquet with seasonal flowers.',
    season: 'year-round',
    vaseLife: 10
  }
];

// Mock CSA options
const csaOptions = [
  {
    id: 1,
    tier: 'Small',
    price: 60,
    frequency: 'weekly',
    stemCount: 15,
    description: 'Perfect for small arrangements or single room decoration.',
    contents: [
      '5 stems roses or dahlias',
      '5 stems seasonal filler',
      '5 stems mixed greens'
    ]
  },
  {
    id: 2,
    tier: 'Medium',
    price: 100,
    frequency: 'weekly',
    stemCount: 30,
    description: 'Great for adding flowers to multiple rooms or sharing with friends.',
    contents: [
      '10 stems mixed flowers',
      '10 stems seasonal filler',
      '10 stems mixed greens',
      'Flower care instruction card'
    ]
  },
  {
    id: 3,
    tier: 'Large',
    price: 180,
    frequency: 'weekly',
    stemCount: 50,
    description: 'Perfect for event preparation or large-scale decorating.',
    contents: [
      '20 stems mixed premium flowers',
      '15 stems seasonal filler',
      '15 stems mixed greens',
      'Floral preservative packet',
      'Personalized flower description card'
    ]
  }
];

// Mock planting calendar
const plantingCalendar = [
  {
    season: 'Spring',
    months: 'March - May',
    flowers: [
      { name: 'Tulips', bloomDate: 'April', vaseLife: 9 },
      { name: 'Daffodils', bloomDate: 'April', vaseLife: 7 },
      { name: 'Ranunculus', bloomDate: 'May', vaseLife: 8 }
    ]
  },
  {
    season: 'Summer',
    months: 'June - August',
    flowers: [
      { name: 'Dahlias', bloomDate: 'July-Aug', vaseLife: 7 },
      { name: 'Sunflowers', bloomDate: 'July-Sept', vaseLife: 12 },
      { name: 'Lavender', bloomDate: 'June-Aug', vaseLife: 14 },
      { name: 'Zinnias', bloomDate: 'July-Sept', vaseLife: 8 }
    ]
  },
  {
    season: 'Fall',
    months: 'September - November',
    flowers: [
      { name: 'Dahlias', bloomDate: 'Sept-Oct', vaseLife: 7 },
      { name: 'Chrysanthemums', bloomDate: 'Sept-Nov', vaseLife: 10 },
      { name: 'Celosia', bloomDate: 'Sept-Oct', vaseLife: 9 }
    ]
  },
  {
    season: 'Winter',
    months: 'December - February',
    flowers: [
      { name: 'Roses', bloomDate: 'Year-round', vaseLife: 10 },
      { name: 'Carnations', bloomDate: 'Year-round', vaseLife: 12 },
      { name: 'Eucalyptus', bloomDate: 'Year-round', vaseLife: 14 }
    ]
  }
];

// Mock farm location
const farmLocation = {
  name: 'Sunny Valley Flower Farm',
  address: '1234 Farm Road, Countryside, CA 95020',
  phone: '(555) 123-4567',
  email: 'hello@sunnyvalleyfarm.com',
  hours: {
    monday: '9am - 5pm',
    tuesday: '9am - 5pm',
    wednesday: '9am - 5pm',
    thursday: '9am - 5pm',
    friday: '9am - 6pm',
    saturday: '9am - 4pm',
    sunday: 'Closed'
  },
  pickupLocations: [
    {
      location: 'Farm Stand',
      day: 'Wednesday',
      time: '4pm - 5pm'
    },
    {
      location: 'Downtown Market',
      day: 'Saturday',
      time: '8am - 12pm'
    },
    {
      location: 'Farm Office',
      day: 'Friday',
      time: '3pm - 6pm'
    }
  ]
};

// Mock blog posts
const blogPosts = [
  {
    id: 1,
    title: 'Why Seasonal Flowers Matter',
    date: '2026-03-01',
    author: 'Sarah Johnson',
    excerpt: 'Discover why choosing seasonal flowers supports local farming and creates the most beautiful arrangements.',
    content: 'Seasonal flowers are fresher, longer-lasting, and support sustainable farming practices. When you choose flowers that are in season, you\'re getting blooms at their peak beauty.'
  },
  {
    id: 2,
    title: 'Spring Planting: What\'s Happening on the Farm',
    date: '2026-02-15',
    author: 'Sarah Johnson',
    excerpt: 'Get an insider look at our spring planting schedule and what\'s coming soon to our CSA boxes.',
    content: 'March is our busiest month! We\'re in the field planting tulips, daffodils, and ranunculus. By April, you\'ll see these beauties in your CSA boxes.'
  },
  {
    id: 3,
    title: 'How to Extend Your Flower\'s Vase Life',
    date: '2026-02-01',
    author: 'Mike Chen',
    excerpt: 'Simple tips and tricks to keep your farm-fresh flowers looking beautiful for 2 weeks or more.',
    content: 'Fresh water daily, trim stems at an angle, remove lower leaves, and keep flowers away from direct sunlight. These simple steps can extend vase life significantly.'
  },
  {
    id: 4,
    title: 'Meet Our Farm Team',
    date: '2026-01-20',
    author: 'Sarah Johnson',
    excerpt: 'Learn about the passionate people who work hard every day to bring you fresh, beautiful flowers.',
    content: 'Our team of 5 dedicated farmers work year-round to cultivate the most beautiful flowers. From planting to harvest to arrangement, every step is done with care.'
  },
  {
    id: 5,
    title: 'Sustainable Farming Practices We Use',
    date: '2026-01-05',
    author: 'Mike Chen',
    excerpt: 'We\'re committed to environmental stewardship. Here\'s how we farm sustainably.',
    content: 'We use drip irrigation to conserve water, organic pest management, crop rotation, and minimal pesticides. Our goal is beautiful flowers that are good for the planet.'
  }
];

// Mock orders
const orders = [];

// Mock CSA memberships
const csaMemberships = [];

// ============================================
// API ENDPOINTS
// ============================================

// 1. GET /api/products - Get all flowers
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: products,
    count: products.length
  });
});

// 2. GET /api/products/:id - Get single flower by ID
app.get('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }
  
  res.json({
    success: true,
    data: product
  });
});

// 3. GET /api/csa-options - Get CSA membership tiers
app.get('/api/csa-options', (req, res) => {
  res.json({
    success: true,
    data: csaOptions,
    count: csaOptions.length
  });
});

// 4. GET /api/planting-calendar - Get seasonal flower calendar
app.get('/api/planting-calendar', (req, res) => {
  res.json({
    success: true,
    data: plantingCalendar,
    count: plantingCalendar.length
  });
});

// 5. GET /api/farm/location - Get farm info, hours, pickup locations
app.get('/api/farm/location', (req, res) => {
  res.json({
    success: true,
    data: farmLocation
  });
});

// 6. GET /api/blog/posts - Get all blog posts
app.get('/api/blog/posts', (req, res) => {
  res.json({
    success: true,
    data: blogPosts,
    count: blogPosts.count
  });
});

// ============================================
// CUSTOMER ORDER ENDPOINTS
// ============================================

// POST /api/csa-subscribe - Subscribe to CSA
app.post('/api/csa-subscribe', verifyToken, async (req, res) => {
  try {
    const { tier, frequency, pickupLocation } = req.body;

    if (!tier || !frequency || !pickupLocation) {
      return res.status(400).json({ error: 'Tier, frequency, and pickup location required' });
    }

    const membership = {
      id: csaMemberships.length + 1,
      userId: req.user.id,
      tier,
      frequency,
      pickupLocation,
      startDate: new Date(),
      status: 'active',
      createdAt: new Date()
    };

    csaMemberships.push(membership);

    // Send CSA subscription email (fire and forget)
    const currentUser = users.find(u => u.id === req.user.id);
    if (currentUser) {
      const csaOption = csaOptions.find(opt => opt.name === tier);
      const tierValue = csaOption?.price || 60;
      sendCSASubscriptionEmail(currentUser.name, currentUser.email, tier, frequency, pickupLocation, tierValue).catch(err => {
        console.error('Failed to send CSA email:', err);
      });
    }

    // In production, this would charge Stripe here
    // For now, just create the membership
    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to CSA!',
      membership
    });
  } catch (error) {
    console.error('CSA subscription error:', error);
    res.status(500).json({ error: 'Subscription failed' });
  }
});

// POST /api/orders - Create new order
app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const { items, orderType, pickupLocation } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain items' });
    }

    // Calculate total price
    let totalPrice = 0;
    items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        totalPrice += product.price * item.quantity;
      }
    });

    const order = {
      id: orders.length + 1,
      userId: req.user.id,
      items,
      orderType: orderType || 'retail',
      totalPrice,
      pickupLocation,
      status: 'pending',
      orderDate: new Date(),
      createdAt: new Date()
    };

    orders.push(order);

    // Send order confirmation email (fire and forget)
    const currentUser = users.find(u => u.id === req.user.id);
    if (currentUser) {
      const itemDetails = items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          name: product?.name || `Product #${item.productId}`,
          quantity: item.quantity
        };
      });
      sendOrderConfirmationEmail(
        currentUser.name,
        currentUser.email,
        order.id,
        itemDetails,
        totalPrice,
        orderType || 'retail',
        pickupLocation
      ).catch(err => {
        console.error('Failed to send order confirmation email:', err);
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Order creation failed' });
  }
});

// GET /api/user/csa - Get user's CSA memberships
app.get('/api/user/csa', verifyToken, (req, res) => {
  const userMemberships = csaMemberships.filter(m => m.userId === req.user.id);
  
  res.json({
    success: true,
    data: userMemberships,
    count: userMemberships.length
  });
});

// GET /api/user/orders - Get user's orders
app.get('/api/user/orders', verifyToken, (req, res) => {
  const userOrders = orders.filter(o => o.userId === req.user.id);
  
  res.json({
    success: true,
    data: userOrders,
    count: userOrders.length
  });
});

// ============================================
// ADMIN ENDPOINTS (Protected)
// ============================================

// GET /api/admin/orders - Get all orders (admin only)
app.get('/api/admin/orders', verifyToken, verifyAdmin, (req, res) => {
  res.json({
    success: true,
    data: orders,
    count: orders.length
  });
});

// GET /api/admin/users - Get all users (admin only)
app.get('/api/admin/users', verifyToken, verifyAdmin, (req, res) => {
  // Don't return passwords
  const safeUsers = users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt
  }));

  res.json({
    success: true,
    data: safeUsers,
    count: safeUsers.length
  });
});

// ============================================
// HEALTH CHECK
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Backend server is running!' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`🌸 Flower Farm Backend running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}/health to verify`);
  console.log('\n========================================');
  console.log('AUTHENTICATION ENDPOINTS:');
  console.log('  POST http://localhost:3001/api/auth/register');
  console.log('  POST http://localhost:3001/api/auth/login');
  console.log('  GET  http://localhost:3001/api/auth/verify (protected)');
  console.log('\nDEMO CUSTOMER CREDENTIALS:');
  console.log('  Email:    demo@farm.com');
  console.log('  Password: demo123456');
  console.log('\nDEMO ADMIN CREDENTIALS:');
  console.log('  Email:    admin@farm.com');
  console.log('  Password: admin123456');
  console.log('\nPUBLIC API ENDPOINTS:');
  console.log('  GET http://localhost:3001/api/products');
  console.log('  GET http://localhost:3001/api/products/:id');
  console.log('  GET http://localhost:3001/api/csa-options');
  console.log('  GET http://localhost:3001/api/planting-calendar');
  console.log('  GET http://localhost:3001/api/farm/location');
  console.log('  GET http://localhost:3001/api/blog/posts');
  console.log('\nCUSTOMER ENDPOINTS (protected):');
  console.log('  POST http://localhost:3001/api/csa-subscribe');
  console.log('  POST http://localhost:3001/api/orders');
  console.log('  GET  http://localhost:3001/api/user/csa');
  console.log('  GET  http://localhost:3001/api/user/orders');
  console.log('\nADMIN ENDPOINTS (protected, admin-only):');
  console.log('  GET  http://localhost:3001/api/admin/orders');
  console.log('  GET  http://localhost:3001/api/admin/users');
  console.log('========================================\n');
});
