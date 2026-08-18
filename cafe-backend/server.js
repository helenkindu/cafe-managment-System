require('dotenv').config();
const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpeg, png, gif, webp)'));
    }
  }
});

// Serve static files from uploads folder
app.use('/uploads', express.static('uploads'));

// ---------- FUNCTION TO CREATE DATABASE IF NOT EXISTS ----------
async function ensureDatabaseExists() {
  const dbName = process.env.DB_NAME;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT || 3306;

  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword
  });

  const [rows] = await connection.query(
    `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${dbName}'`
  );

  if (rows.length === 0) {
    console.log(`📦 Database '${dbName}' does not exist. Creating it...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' created successfully!`);
  } else {
    console.log(`✅ Database '${dbName}' already exists.`);
  }

  await connection.end();
}

// ---------- CONNECT TO MYSQL USING ENV VARIABLES ----------
async function initializeSequelize() {
  try {
    await ensureDatabaseExists();

    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT || 'mysql',
        port: process.env.DB_PORT || 3306,
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

    await sequelize.authenticate();
    console.log(`✅ MySQL (${process.env.DB_NAME}) connected successfully!`);
    return sequelize;
  } catch (err) {
    console.error('❌ Connection error:', err);
    throw err;
  }
}

// ---------- INITIALIZE DATABASE ----------
let sequelize;

initializeSequelize()
  .then((seq) => {
    sequelize = seq;
    defineModels(sequelize);
    setupRoutes(sequelize);
    startServer(sequelize);
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

// ---------- DEFINE MODELS ----------
function defineModels(sequelize) {
  const { DataTypes } = require('sequelize');

  // ---------- USER MODEL (For Authentication) ----------
  global.User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { 
      type: DataTypes.ENUM('admin', 'waiter', 'cashier', 'kitchen', 'barista'), 
      allowNull: false,
      defaultValue: 'waiter'
    },
    name: { type: DataTypes.STRING, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { timestamps: true });

  // ---------- WAITER MODEL ----------
  global.Waiter = sequelize.define('Waiter', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { timestamps: true });

  global.Category = sequelize.define('Category', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    icon: { type: DataTypes.STRING, defaultValue: '🍽️' },
    targetDept: { type: DataTypes.STRING, defaultValue: 'kitchen' }
  }, { timestamps: true });

  global.Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    price: { type: DataTypes.FLOAT, allowNull: false },
    image: DataTypes.STRING,
    targetDept: { type: DataTypes.STRING, defaultValue: 'kitchen' },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { timestamps: true });

  global.Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    waiterId: { type: DataTypes.INTEGER, allowNull: false },
    waiterName: { type: DataTypes.STRING, allowNull: false },
    tableNumber: { type: DataTypes.STRING, allowNull: false },
    items: { type: DataTypes.JSON, allowNull: false },
    totalPrice: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'PENDING_PAYMENT' },
    isPaid: { type: DataTypes.BOOLEAN, defaultValue: false },
    dispatchedAt: DataTypes.DATE,
    completedAt: DataTypes.DATE
  }, { timestamps: true });

  global.CafeSetting = sequelize.define('CafeSetting', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    key: { type: DataTypes.STRING, allowNull: false, unique: true },
    value: { type: DataTypes.STRING, allowNull: false }
  }, { timestamps: true });

  global.PreparedItem = sequelize.define('PreparedItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    price: { type: DataTypes.FLOAT, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    unit: { type: DataTypes.STRING, defaultValue: 'piece' },
    image: DataTypes.STRING,
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
    preparationDate: DataTypes.DATE,
    expiryDate: DataTypes.DATE
  }, { timestamps: true });

  // ---------- RELATIONSHIPS ----------
  Waiter.belongsTo(User, { foreignKey: 'userId' });
  User.hasOne(Waiter, { foreignKey: 'userId' });
  
  Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'categoryInfo' });
  Category.hasMany(Product, { foreignKey: 'categoryId' });
  
  PreparedItem.belongsTo(Category, { foreignKey: 'categoryId', as: 'categoryInfo' });
  Category.hasMany(PreparedItem, { foreignKey: 'categoryId' });

  console.log('✅ Models defined successfully');
}

// ---------- AUTHENTICATION MIDDLEWARE ----------
const authenticate = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user id' });
  }
  const user = await global.User.findByPk(userId);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'Unauthorized: User not found or inactive' });
  }
  req.user = user;
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

// ---------- SETUP ROUTES ----------
function setupRoutes(sequelize) {
  const { User, Waiter, Category, Product, Order, CafeSetting, PreparedItem } = global;

  // ============ AUTH ENDPOINTS ============
  // Seed default admin user (only first time)
  app.post('/api/auth/seed', async (req, res) => {
    try {
      const adminExists = await User.findOne({ where: { username: 'admin' } });
      if (adminExists) {
        return res.json({ message: 'Admin already exists', user: { id: adminExists.id, username: adminExists.username } });
      }
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        name: 'System Admin',
        isActive: true
      });
      res.json({ message: 'Admin created', user: { id: admin.id, username: admin.username, role: admin.role } });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------- LOGIN ENDPOINT (with debug logs) ----------
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(`🔐 Login attempt for username: "${username}"`);

      const user = await User.findOne({ where: { username, isActive: true } });
      if (!user) {
        console.log(`❌ User not found: ${username}`);
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      console.log(`✅ User found: ID=${user.id}, role=${user.role}, name=${user.name}`);
      console.log(`🔑 Stored password hash (first 20 chars): ${user.password.substring(0, 20)}...`);

      const isValid = await bcrypt.compare(password, user.password);
      console.log(`🔐 Password match? ${isValid}`);

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      });
    } catch (err) {
      console.error('❌ Login error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Change own password (authenticated user)
  app.put('/api/auth/change-password', authenticate, async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Old and new password are required' });
      }
      const user = await User.findByPk(req.user.id);
      const isValid = await bcrypt.compare(oldPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Incorrect old password' });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      await user.save();
      res.json({ message: 'Password changed successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============ USER MANAGEMENT (Admin only) ============
  app.get('/api/users', authenticate, isAdmin, async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'username', 'role', 'name', 'isActive', 'createdAt'],
        order: [['id', 'ASC']]
      });
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/users', authenticate, isAdmin, async (req, res) => {
    try {
      const { username, password, role, name, waiterCode } = req.body;
      if (!username || !password || !role || !name) {
        return res.status(400).json({ error: 'Username, password, role, name are required' });
      }
      const existing = await User.findOne({ where: { username } });
      if (existing) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({
        username,
        password: hashed,
        role,
        name,
        isActive: true
      });
      if (role === 'waiter' && waiterCode) {
        await Waiter.create({
          name,
          code: waiterCode,
          userId: user.id,
          isActive: true
        });
      }
      res.status(201).json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/users/:id', authenticate, isAdmin, async (req, res) => {
    try {
      const { username, password, role, name, isActive } = req.body;
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const updateData = {};
      if (username) updateData.username = username;
      if (name) updateData.name = name;
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (password && password.length > 0) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      await user.update(updateData);
      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        isActive: user.isActive
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/users/:id', authenticate, isAdmin, async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      await user.update({ isActive: false });
      res.json({ message: 'User deactivated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============ WAITER ENDPOINTS ============
  app.get('/api/waiters', authenticate, async (req, res) => {
  try {
    const waiters = await Waiter.findAll({
      include: [{ model: User, attributes: ['id', 'username', 'isActive'] }],
      order: [['id', 'ASC']]
    });
    res.json(waiters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
  // ---------- CREATE WAITER (with debug logs) ----------
  app.post('/api/waiters', authenticate, isAdmin, async (req, res) => {
    try {
      const { name, code, username, password } = req.body;
      console.log(`📝 Creating waiter: name="${name}", code="${code}", username="${username}"`);

      if (!name || !code || !username || !password) {
        console.log('❌ Missing required fields');
        return res.status(400).json({ error: 'Name, code, username, password required' });
      }

      // Check if username already exists
      const existing = await User.findOne({ where: { username } });
      if (existing) {
        console.log(`❌ Username "${username}" already exists`);
        return res.status(400).json({ error: 'Username already exists' });
      }

      const hashed = await bcrypt.hash(password, 10);
      console.log(`🔑 Generated hash: ${hashed.substring(0, 20)}...`);

      const user = await User.create({
        username,
        password: hashed,
        role: 'waiter',
        name: name,
        isActive: true
      });
      console.log(`✅ User created with ID: ${user.id}`);

      const waiter = await Waiter.create({
        name,
        code,
        userId: user.id,
        isActive: true
      });
      console.log(`✅ Waiter created with ID: ${waiter.id}`);

      res.status(201).json({ waiter, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
      console.error('❌ Error creating waiter:', err);
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/waiters/:id', authenticate, isAdmin, async (req, res) => {
    try {
      const { name, code, isActive } = req.body;
      const waiter = await Waiter.findByPk(req.params.id);
      if (!waiter) return res.status(404).json({ error: 'Waiter not found' });
      await waiter.update({ name, code, isActive });
      if (name && waiter.userId) {
        const user = await User.findByPk(waiter.userId);
        if (user) await user.update({ name });
      }
      const updated = await Waiter.findByPk(req.params.id, {
        include: [{ model: User, attributes: ['id', 'username', 'isActive'] }]
      });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/waiters/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const waiter = await Waiter.findByPk(req.params.id);
    if (!waiter) return res.status(404).json({ error: 'Waiter not found' });

    // Permanently delete the associated user
    if (waiter.userId) {
      await User.destroy({ where: { id: waiter.userId } });
    }

    // Permanently delete the waiter
    await waiter.destroy();

    res.json({ message: 'Waiter permanently deleted' });
  } catch (err) {
    console.error('Error deleting waiter:', err);
    res.status(500).json({ error: err.message });
  }
});
  // ============ CATEGORY ENDPOINTS ============
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await Category.findAll({ order: [['id', 'ASC']] });
      res.json(categories);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/categories', authenticate, isAdmin, async (req, res) => {
    try {
      const category = await Category.create(req.body);
      res.status(201).json(category);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/categories/:id', authenticate, isAdmin, async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) return res.status(404).json({ error: 'Category not found' });
      await category.update(req.body);
      res.json(category);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/categories/:id', authenticate, isAdmin, async (req, res) => {
    try {
      await Category.destroy({ where: { id: req.params.id } });
      res.json({ message: 'Category deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============ PRODUCT ENDPOINTS ============
  app.get('/api/products', async (req, res) => {
    try {
      const { categoryId } = req.query;
      const where = {};
      if (categoryId) where.categoryId = categoryId;
      const products = await Product.findAll({
        where,
        include: [{ model: Category, as: 'categoryInfo' }],
        order: [['id', 'ASC']]
      });
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/products', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const productData = JSON.parse(JSON.stringify(req.body));
    
    // If file uploaded, save the file path
    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }
    
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).json({ error: err.message });
  }
});app.put('/api/products/:id', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const productData = JSON.parse(JSON.stringify(req.body));
    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }
    await Product.update(productData, { where: { id: req.params.id } });
    const updated = await Product.findByPk(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
  app.delete('/api/products/:id', authenticate, isAdmin, async (req, res) => {
    try {
      await Product.destroy({ where: { id: req.params.id } });
      res.json({ message: 'Product deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============ ORDER ENDPOINTS ============
  app.get('/api/orders', authenticate, async (req, res) => {
    try {
      const { status, waiterId } = req.query;
      const where = {};
      if (status) where.status = status;
      if (waiterId) where.waiterId = waiterId;
      const orders = await Order.findAll({ where, order: [['createdAt', 'DESC']] });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/orders', authenticate, async (req, res) => {
    try {
      const { waiterId, waiterName, tableNumber, items, totalPrice } = req.body;
      const processedItems = [];
      for (const item of items) {
        if (item.isPrepared) {
          const preparedItem = await PreparedItem.findOne({
            where: { name: item.name, isAvailable: true }
          });
          if (preparedItem) {
            if (preparedItem.quantity < item.quantity) {
              return res.status(400).json({
                error: `Not enough ${item.name} in stock. Available: ${preparedItem.quantity}`
              });
            }
            await preparedItem.update({
              quantity: preparedItem.quantity - item.quantity
            });
          }
        }
        processedItems.push({
          ...item,
          targetDept: item.targetDept || 'kitchen',
          itemStatus: 'pending'
        });
      }
      const order = await Order.create({
        waiterId,
        waiterName,
        tableNumber,
        items: processedItems,
        totalPrice,
        status: 'PENDING_PAYMENT',
        isPaid: false
      });
      res.status(201).json(order);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/orders/:id/approve', authenticate, async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (order.status === 'CANCELLED') {
        return res.status(400).json({ error: 'Cannot approve a cancelled order' });
      }
      order.status = 'DISPATCHED';
      order.isPaid = true;
      order.dispatchedAt = new Date();
      await order.save();
      res.json({ message: 'Order approved and dispatched!', order });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/orders/:id/cancel', authenticate, async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (order.status !== 'PENDING_PAYMENT') {
        return res.status(400).json({
          error: 'Order cannot be cancelled after payment approval & dispatch to kitchen/barista!'
        });
      }
      order.status = 'CANCELLED';
      await order.save();
      res.json({ message: 'Order cancelled by Cashier', order });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/orders/:id/item-status', authenticate, async (req, res) => {
    try {
      const { itemId, dept, isReady } = req.body;
      const order = await Order.findByPk(req.params.id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      let updatedItems = [...order.items];
      if (itemId) {
        updatedItems = updatedItems.map(item =>
          item.id === itemId ? { ...item, itemStatus: isReady ? 'ready' : 'pending' } : item
        );
      } else if (dept) {
        updatedItems = updatedItems.map(item =>
          item.targetDept === dept ? { ...item, itemStatus: isReady ? 'ready' : 'pending' } : item
        );
      }
      const allReady = updatedItems.every(item => item.itemStatus === 'ready');
      if (allReady) {
        order.status = 'COMPLETED';
        order.completedAt = new Date();
      }
      order.items = updatedItems;
      await order.save();
      res.json({ message: 'Item status updated', order });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ============ PREPARED ITEMS ENDPOINTS ============
  app.get('/api/prepared-items', async (req, res) => {
    try {
      const { categoryId, targetDept } = req.query;
      const where = {};
      if (categoryId) where.categoryId = categoryId;
      const items = await PreparedItem.findAll({
        where,
        include: [{ model: Category, as: 'categoryInfo' }],
        order: [['name', 'ASC']]
      });
      let result = items;
      if (targetDept) {
        result = items.filter(item => item.categoryInfo && item.categoryInfo.targetDept === targetDept);
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/prepared-items/:id', async (req, res) => {
    try {
      const item = await PreparedItem.findByPk(req.params.id, {
        include: [{ model: Category, as: 'categoryInfo' }]
      });
      if (!item) return res.status(404).json({ error: 'Item not found' });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/prepared-items', authenticate, isAdmin, async (req, res) => {
    try {
      const item = await PreparedItem.create(req.body);
      const created = await PreparedItem.findByPk(item.id, {
        include: [{ model: Category, as: 'categoryInfo' }]
      });
      res.status(201).json(created);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/prepared-items/:id', authenticate, isAdmin, async (req, res) => {
    try {
      const item = await PreparedItem.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Item not found' });
      await item.update(req.body);
      const updated = await PreparedItem.findByPk(req.params.id, {
        include: [{ model: Category, as: 'categoryInfo' }]
      });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/prepared-items/:id/quantity', authenticate, isAdmin, async (req, res) => {
    try {
      const { quantity, action } = req.body;
      const item = await PreparedItem.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Item not found' });
      let newQuantity = item.quantity;
      if (action === 'add') newQuantity += quantity;
      else if (action === 'remove') newQuantity -= quantity;
      else if (action === 'set') newQuantity = quantity;
      if (newQuantity < 0) newQuantity = 0;
      await item.update({ quantity: newQuantity });
      const updated = await PreparedItem.findByPk(req.params.id, {
        include: [{ model: Category, as: 'categoryInfo' }]
      });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/prepared-items/:id', authenticate, isAdmin, async (req, res) => {
    try {
      const item = await PreparedItem.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Item not found' });
      await item.destroy();
      res.json({ message: 'Item deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/prepared-items/seed', authenticate, isAdmin, async (req, res) => {
    try {
      const [breadCategory, cakeCategory, pastryCategory, snackCategory, drinkCategory] = await Promise.all([
        Category.findOrCreate({ where: { name: 'Bread', defaults: { icon: '🍞', targetDept: 'kitchen' } } }),
        Category.findOrCreate({ where: { name: 'Cake', defaults: { icon: '🎂', targetDept: 'kitchen' } } }),
        Category.findOrCreate({ where: { name: 'Pastry', defaults: { icon: '🥐', targetDept: 'kitchen' } } }),
        Category.findOrCreate({ where: { name: 'Snack', defaults: { icon: '🍿', targetDept: 'kitchen' } } }),
        Category.findOrCreate({ where: { name: 'Drink', defaults: { icon: '🥤', targetDept: 'barista' } } })
      ]);

      const items = [
        { name: 'White Bread', price: 50, quantity: 10, unit: 'piece', categoryId: breadCategory[0].id },
        { name: 'Brown Bread', price: 60, quantity: 8, unit: 'piece', categoryId: breadCategory[0].id },
        { name: 'Baguette', price: 80, quantity: 5, unit: 'piece', categoryId: breadCategory[0].id },
        { name: 'Sourdough', price: 90, quantity: 4, unit: 'piece', categoryId: breadCategory[0].id },
        { name: 'Rye Bread', price: 70, quantity: 6, unit: 'piece', categoryId: breadCategory[0].id },
        { name: 'Chocolate Cake', price: 150, quantity: 6, unit: 'slice', categoryId: cakeCategory[0].id },
        { name: 'Vanilla Cake', price: 120, quantity: 8, unit: 'slice', categoryId: cakeCategory[0].id },
        { name: 'Red Velvet Cake', price: 180, quantity: 4, unit: 'slice', categoryId: cakeCategory[0].id },
        { name: 'Carrot Cake', price: 140, quantity: 5, unit: 'slice', categoryId: cakeCategory[0].id },
        { name: 'Cheesecake', price: 160, quantity: 6, unit: 'slice', categoryId: cakeCategory[0].id },
        { name: 'Croissant', price: 70, quantity: 12, unit: 'piece', categoryId: pastryCategory[0].id },
        { name: 'Danish Pastry', price: 90, quantity: 8, unit: 'piece', categoryId: pastryCategory[0].id },
        { name: 'Pain au Chocolat', price: 95, quantity: 6, unit: 'piece', categoryId: pastryCategory[0].id },
        { name: 'Cinnamon Roll', price: 80, quantity: 10, unit: 'piece', categoryId: pastryCategory[0].id },
        { name: 'Samosa', price: 40, quantity: 20, unit: 'piece', categoryId: snackCategory[0].id },
        { name: 'Spring Roll', price: 50, quantity: 15, unit: 'piece', categoryId: snackCategory[0].id },
        { name: 'Puff Puff', price: 30, quantity: 25, unit: 'piece', categoryId: snackCategory[0].id },
        { name: 'Fresh Juice', price: 100, quantity: 10, unit: 'glass', categoryId: drinkCategory[0].id },
        { name: 'Smoothie', price: 120, quantity: 8, unit: 'glass', categoryId: drinkCategory[0].id },
        { name: 'Milkshake', price: 110, quantity: 6, unit: 'glass', categoryId: drinkCategory[0].id },
        { name: 'Iced Tea', price: 80, quantity: 12, unit: 'glass', categoryId: drinkCategory[0].id },
        { name: 'Lemonade', price: 90, quantity: 10, unit: 'glass', categoryId: drinkCategory[0].id }
      ];
      const created = await PreparedItem.bulkCreate(items);
      const allItems = await PreparedItem.findAll({
        where: { id: created.map(item => item.id) },
        include: [{ model: Category, as: 'categoryInfo' }]
      });
      res.status(201).json({
        message: `${created.length} items seeded successfully`,
        items: allItems,
        categories: {
          bread: breadCategory[0],
          cake: cakeCategory[0],
          pastry: pastryCategory[0],
          snack: snackCategory[0],
          drink: drinkCategory[0]
        }
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // ============ SETTINGS ENDPOINTS ============
  app.get('/api/settings/:key', async (req, res) => {
    try {
      const setting = await CafeSetting.findOne({ where: { key: req.params.key } });
      if (!setting) return res.json({ key: req.params.key, value: null });
      res.json({ key: setting.key, value: setting.value });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/settings/:key', authenticate, isAdmin, async (req, res) => {
    try {
      const [setting, created] = await CafeSetting.findOrCreate({
        where: { key: req.params.key },
        defaults: { value: req.body.value }
      });
      if (!created) {
        setting.value = req.body.value;
        await setting.save();
      }
      res.json({ key: setting.key, value: setting.value });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      database: process.env.DB_NAME,
      timestamp: new Date().toISOString()
    });
  });

  console.log('✅ Routes setup complete');
}

// ---------- START THE SERVER ----------
function startServer(sequelize) {
  const PORT = process.env.PORT || 5000;
  sequelize.sync({ alter: true }).then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Cafe Backend running at http://localhost:${PORT}`);
      console.log(`📊 Database: ${process.env.DB_NAME}`);
      console.log('✨ All systems ready!');
    });
  }).catch(err => {
    console.error('❌ Error syncing database:', err);
  });
}