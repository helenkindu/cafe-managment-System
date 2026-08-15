require('dotenv').config();
const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

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

  global.Waiter = sequelize.define('Waiter', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
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

  // ---------- PREPARED ITEMS MODEL ----------
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
  Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'categoryInfo' });
  Category.hasMany(Product, { foreignKey: 'categoryId' });
  
  PreparedItem.belongsTo(Category, { foreignKey: 'categoryId', as: 'categoryInfo' });
  Category.hasMany(PreparedItem, { foreignKey: 'categoryId' });

  console.log('✅ Models defined successfully');
}

// ---------- SETUP ROUTES ----------
function setupRoutes(sequelize) {
  const { Waiter, Category, Product, Order, CafeSetting, PreparedItem } = global;

  // ============ WAITER ENDPOINTS ============
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

  app.put('/api/waiters/:id', async (req, res) => {
    try {
      await Waiter.update(req.body, { where: { id: req.params.id } });
      const updated = await Waiter.findByPk(req.params.id);
      res.json(updated);
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

  // ============ CATEGORY ENDPOINTS ============
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

  app.put('/api/categories/:id', async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) return res.status(404).json({ error: 'Category not found' });
      
      await category.update(req.body);
      res.json(category);
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

  // ============ ORDER ENDPOINTS ============
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

  app.post('/api/orders', async (req, res) => {
    try {
      const { waiterId, waiterName, tableNumber, items, totalPrice } = req.body;

      // Check if any items are prepared items and reduce quantity
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

  app.put('/api/orders/:id/item-status', async (req, res) => {
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
  
  // Get all prepared items
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
      
      // If targetDept filter is applied, filter after join
      let result = items;
      if (targetDept) {
        result = items.filter(item => item.categoryInfo && item.categoryInfo.targetDept === targetDept);
      }
      
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get a single prepared item
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

  // Create a new prepared item
  app.post('/api/prepared-items', async (req, res) => {
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

  // Update a prepared item
  app.put('/api/prepared-items/:id', async (req, res) => {
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

  // Update quantity (for when items are taken/sold)
  app.put('/api/prepared-items/:id/quantity', async (req, res) => {
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

  // Delete a prepared item
  app.delete('/api/prepared-items/:id', async (req, res) => {
    try {
      const item = await PreparedItem.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Item not found' });
      
      await item.destroy();
      res.json({ message: 'Item deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Seed prepared items with categories
  app.post('/api/prepared-items/seed', async (req, res) => {
    try {
      // First, get or create categories
      const [breadCategory, cakeCategory, pastryCategory, snackCategory, drinkCategory] = await Promise.all([
        Category.findOrCreate({ where: { name: 'Bread', defaults: { icon: '🍞', targetDept: 'kitchen' } } }),
        Category.findOrCreate({ where: { name: 'Cake', defaults: { icon: '🎂', targetDept: 'kitchen' } } }),
        Category.findOrCreate({ where: { name: 'Pastry', defaults: { icon: '🥐', targetDept: 'kitchen' } } }),
        Category.findOrCreate({ where: { name: 'Snack', defaults: { icon: '🍿', targetDept: 'kitchen' } } }),
        Category.findOrCreate({ where: { name: 'Drink', defaults: { icon: '🥤', targetDept: 'barista' } } })
      ]);

      const items = [
        // Breads (Kitchen)
        { name: 'White Bread', price: 50, quantity: 10, unit: 'piece', categoryId: breadCategory[0].id },
        { name: 'Brown Bread', price: 60, quantity: 8, unit: 'piece', categoryId: breadCategory[0].id },
        { name: 'Baguette', price: 80, quantity: 5, unit: 'piece', categoryId: breadCategory[0].id },
        { name: 'Sourdough', price: 90, quantity: 4, unit: 'piece', categoryId: breadCategory[0].id },
        { name: 'Rye Bread', price: 70, quantity: 6, unit: 'piece', categoryId: breadCategory[0].id },
        
        // Cakes (Kitchen)
        { name: 'Chocolate Cake', price: 150, quantity: 6, unit: 'slice', categoryId: cakeCategory[0].id },
        { name: 'Vanilla Cake', price: 120, quantity: 8, unit: 'slice', categoryId: cakeCategory[0].id },
        { name: 'Red Velvet Cake', price: 180, quantity: 4, unit: 'slice', categoryId: cakeCategory[0].id },
        { name: 'Carrot Cake', price: 140, quantity: 5, unit: 'slice', categoryId: cakeCategory[0].id },
        { name: 'Cheesecake', price: 160, quantity: 6, unit: 'slice', categoryId: cakeCategory[0].id },
        
        // Pastries (Kitchen)
        { name: 'Croissant', price: 70, quantity: 12, unit: 'piece', categoryId: pastryCategory[0].id },
        { name: 'Danish Pastry', price: 90, quantity: 8, unit: 'piece', categoryId: pastryCategory[0].id },
        { name: 'Pain au Chocolat', price: 95, quantity: 6, unit: 'piece', categoryId: pastryCategory[0].id },
        { name: 'Cinnamon Roll', price: 80, quantity: 10, unit: 'piece', categoryId: pastryCategory[0].id },
        
        // Snacks (Kitchen)
        { name: 'Samosa', price: 40, quantity: 20, unit: 'piece', categoryId: snackCategory[0].id },
        { name: 'Spring Roll', price: 50, quantity: 15, unit: 'piece', categoryId: snackCategory[0].id },
        { name: 'Puff Puff', price: 30, quantity: 25, unit: 'piece', categoryId: snackCategory[0].id },
        
        // Drinks (Barista)
        { name: 'Fresh Juice', price: 100, quantity: 10, unit: 'glass', categoryId: drinkCategory[0].id },
        { name: 'Smoothie', price: 120, quantity: 8, unit: 'glass', categoryId: drinkCategory[0].id },
        { name: 'Milkshake', price: 110, quantity: 6, unit: 'glass', categoryId: drinkCategory[0].id },
        { name: 'Iced Tea', price: 80, quantity: 12, unit: 'glass', categoryId: drinkCategory[0].id },
        { name: 'Lemonade', price: 90, quantity: 10, unit: 'glass', categoryId: drinkCategory[0].id }
      ];
      
      const created = await PreparedItem.bulkCreate(items);
      
      // Get all created items with their categories
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

  // ============ DASHBOARD ENDPOINTS ============
  
  // Get dashboard overview
  app.get('/api/dashboard/overview', async (req, res) => {
    try {
      const [totalOrders, pendingOrders, completedOrders, preparedItems, lowStockItems] = await Promise.all([
        Order.count(),
        Order.count({ where: { status: 'PENDING_PAYMENT' } }),
        Order.count({ where: { status: 'COMPLETED' } }),
        PreparedItem.count({ where: { isAvailable: true } }),
        PreparedItem.findAll({ 
          where: { quantity: { [Op.lt]: 5 }, isAvailable: true },
          include: [{ model: Category, as: 'categoryInfo' }],
          attributes: ['id', 'name', 'quantity']
        })
      ]);

      const categorySummary = await PreparedItem.findAll({
        attributes: [
          'categoryId',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity']
        ],
        group: ['categoryId']
      });

      // Get category names for the summary
      const categoryIds = categorySummary.map(item => item.categoryId);
      const categories = await Category.findAll({
        where: { id: categoryIds },
        attributes: ['id', 'name', 'targetDept']
      });

      const summaryWithNames = categorySummary.map(summary => {
        const cat = categories.find(c => c.id === summary.categoryId);
        return {
          categoryName: cat ? cat.name : 'Unknown',
          targetDept: cat ? cat.targetDept : 'unknown',
          totalQuantity: summary.get('totalQuantity')
        };
      });

      res.json({
        stats: {
          totalOrders,
          pendingOrders,
          completedOrders,
          preparedItems,
          lowStockItems: lowStockItems.length
        },
        lowStock: lowStockItems,
        categorySummary: summaryWithNames
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get prepared items summary grouped by category
  app.get('/api/dashboard/prepared-items-summary', async (req, res) => {
    try {
      const items = await PreparedItem.findAll({
        where: { isAvailable: true },
        include: [{ model: Category, as: 'categoryInfo' }],
        attributes: [
          'categoryId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity']
        ],
        group: ['categoryId', 'categoryInfo.id']
      });
      
      const result = items.map(item => ({
        categoryName: item.categoryInfo ? item.categoryInfo.name : 'Unknown',
        targetDept: item.categoryInfo ? item.categoryInfo.targetDept : 'unknown',
        count: item.get('count'),
        totalQuantity: item.get('totalQuantity')
      }));
      
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
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

  // ============ HEALTH CHECK ============
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