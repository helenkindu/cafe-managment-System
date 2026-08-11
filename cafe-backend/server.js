const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ---------- CONNECT TO MYSQL (Enatcafe-db) ----------
const sequelize = new Sequelize('enatcafe_db', 'root', '1234', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

sequelize.authenticate()
  .then(() => console.log('✅ MySQL (enatcafe_db) connected successfully!'))
  .catch(err => console.error('❌ Connection error:', err));

// ---------- DEFINE MODELS ----------
const Waiter = sequelize.define('Waiter', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  icon: { type: DataTypes.STRING, defaultValue: '🍽️' },
  targetDept: { type: DataTypes.STRING, defaultValue: 'kitchen' } // 'barista' or 'kitchen'
}, { timestamps: true });

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  price: { type: DataTypes.FLOAT, allowNull: false },
  image: DataTypes.STRING,
  targetDept: { type: DataTypes.STRING, defaultValue: 'kitchen' }, // 'barista' or 'kitchen'
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  waiterId: { type: DataTypes.INTEGER, allowNull: false },
  waiterName: { type: DataTypes.STRING, allowNull: false },
  tableNumber: { type: DataTypes.STRING, allowNull: false },
  items: { type: DataTypes.JSON, allowNull: false },
  totalPrice: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'PENDING_PAYMENT' }, // PENDING_PAYMENT, DISPATCHED, COMPLETED, CANCELLED
  isPaid: { type: DataTypes.BOOLEAN, defaultValue: false },
  dispatchedAt: DataTypes.DATE,
  completedAt: DataTypes.DATE
}, { timestamps: true });

// Relationships
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId' });

// ---------- API ROUTES ----------

// 1. WAITER ENDPOINTS
app.get('/api/waiters', async (req, res) => {
  try {
    const waiters = await Waiter.findAll({ order: [['id', 'ASC']] });
    res.json(waiters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/waiters', async (req, res) => {
  try {
    const waiter = await Waiter.create(req.body);
    res.status(201).json(waiter);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/waiters/:id', async (req, res) => {
  try {
    await Waiter.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Waiter deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. CATEGORY ENDPOINTS
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['id', 'ASC']] });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await Category.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. PRODUCT ENDPOINTS
app.get('/api/products', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    const products = await Product.findAll({ where, include: [{ model: Category, as: 'category' }], order: [['id', 'ASC']] });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    await Product.update(req.body, { where: { id: req.params.id } });
    const updated = await Product.findByPk(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. ORDER ENDPOINTS
app.get('/api/orders', async (req, res) => {
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

// Waiter places order (Status: PENDING_PAYMENT)
app.post('/api/orders', async (req, res) => {
  try {
    const { waiterId, waiterName, tableNumber, items, totalPrice } = req.body;

    // Attach initial targetDept and status to each item inside items array
    const processedItems = items.map(item => ({
      ...item,
      targetDept: item.targetDept || 'kitchen',
      itemStatus: 'pending' // 'pending' | 'ready'
    }));

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

// Cashier Approves Order & Dispatches to Kitchen / Barista (Lock Cancellation)
app.put('/api/orders/:id/approve', async (req, res) => {
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

// Cashier Cancels Order (ALLOWED ONLY WHEN STATUS IS PENDING_PAYMENT)
app.put('/api/orders/:id/cancel', async (req, res) => {
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

// Barista / Chef updates item status or completes ticket
app.put('/api/orders/:id/item-status', async (req, res) => {
  try {
    const { itemId, dept, isReady } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    let updatedItems = [...order.items];

    if (itemId) {
      // Mark specific item
      updatedItems = updatedItems.map(item => 
        item.id === itemId ? { ...item, itemStatus: isReady ? 'ready' : 'pending' } : item
      );
    } else if (dept) {
      // Mark all items for that department
      updatedItems = updatedItems.map(item => 
        item.targetDept === dept ? { ...item, itemStatus: isReady ? 'ready' : 'pending' } : item
      );
    }

    // Check if ALL items in order are ready
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

// ---------- CAFE SETTINGS (Cashier PIN stored in DB) ----------
const CafeSetting = sequelize.define('CafeSetting', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  key: { type: DataTypes.STRING, allowNull: false, unique: true },
  value: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true });

// Get a setting
app.get('/api/settings/:key', async (req, res) => {
  try {
    const setting = await CafeSetting.findOne({ where: { key: req.params.key } });
    if (!setting) return res.json({ key: req.params.key, value: null });
    res.json({ key: setting.key, value: setting.value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update a setting
app.put('/api/settings/:key', async (req, res) => {
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

// Update a waiter
app.put('/api/waiters/:id', async (req, res) => {
  try {
    await Waiter.update(req.body, { where: { id: req.params.id } });
    const updated = await Waiter.findByPk(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- START THE SERVER (No hardcoded seed — Admin manages everything) ----------
const PORT = 5000;
sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => console.log(`🚀 Cafe Backend running at http://localhost:${PORT} — Database ready, no hardcoded data!`));
});