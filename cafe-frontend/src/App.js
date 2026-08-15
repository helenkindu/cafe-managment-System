import React, { useState, useEffect, useCallback } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navbar from './components/Navbar';
import AdminDashboard from './components/Admin/AdminDashboard';
import WaiterDashboard from './components/Waiter/WaiterDashboard';
import CashierDashboard from './components/Cashier/CashierDashboard';
import CashierAuthModal from './components/Cashier/CashierAuthModal';
import BaristaDashboard from './components/Barista/BaristaDashboard';
import KitchenDashboard from './components/Kitchen/KitchenDashboard';
import PreparedItemsDashboard from './components/prepared-item/PreparedItemsDashboard';
import NotificationBanner from './components/NotificationBanner';
import { 
  getWaiters, addWaiter, deleteWaiter, 
  getCategories, addCategory, deleteCategory, 
  getProducts, addProduct, deleteProduct, 
  getOrders, createOrder, approveOrder, cancelOrder, updateOrderItemStatus,
  getSetting, updateSetting,
  // Prepared Items API functions
  getPreparedItems, addPreparedItem, updatePreparedItem, deletePreparedItem, updatePreparedItemQuantity, seedPreparedItems
} from './services/api';

const theme = createTheme({
  palette: {
    primary: { main: '#2563eb' },
    secondary: { main: '#7c3aed' },
    background: { default: '#f1f5f9' }
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", sans-serif'
  }
});

function App() {
  const [activeRole, setActiveRole] = useState('waiter');
  const [waiters, setWaiters] = useState([]);
  const [selectedWaiterId, setSelectedWaiterId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [preparedItems, setPreparedItems] = useState([]);

  const [notification, setNotification] = useState(null);

  // Security Passcode State — loaded from database
  const [cashierPin, setCashierPin] = useState('1234'); // default until DB loads
  const [isCashierUnlocked, setIsCashierUnlocked] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Load Cashier PIN from DB on startup
  useEffect(() => {
    getSetting('cashier_pin').then(res => {
      if (res.data.value) setCashierPin(res.data.value);
    }).catch(() => {}); // silently fallback to default '1234'
  }, []);

  // Refresh all state from backend
  const loadData = useCallback(async () => {
    try {
      const [wRes, cRes, pRes, oRes, piRes] = await Promise.all([
        getWaiters(),
        getCategories(),
        getProducts(),
        getOrders(),
        getPreparedItems()
      ]);

      setWaiters(wRes.data);
      if (!selectedWaiterId && wRes.data.length > 0) {
        setSelectedWaiterId(wRes.data[0].id);
      }

      setCategories(cRes.data);
      setProducts(pRes.data);
      setOrders(oRes.data);
      setPreparedItems(piRes.data);
    } catch (err) {
      console.error('Error loading cafe data:', err);
    }
  }, [selectedWaiterId]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000); // 3-second live poll
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle Role Switching with Security Check
  const handleSelectRole = (roleId) => {
    if (roleId === 'cashier' && !isCashierUnlocked) {
      setAuthModalOpen(true);
    } else {
      setActiveRole(roleId);
    }
  };

  const handleUnlockCashier = () => {
    setIsCashierUnlocked(true);
    setAuthModalOpen(false);
    setActiveRole('cashier');
  };

  const handleLockCashier = () => {
    setIsCashierUnlocked(false);
    setActiveRole('waiter');
  };

  // Save PIN to database when Admin changes it
  const handleChangeCashierPin = async (newPin) => {
    setCashierPin(newPin);
    try {
      await updateSetting('cashier_pin', newPin);
    } catch (err) {
      console.error('Failed to save PIN to database:', err);
    }
  };

  // ---------- WAITER HANDLERS ----------
  const handleAddWaiter = async (data) => {
    try {
      await addWaiter(data);
      loadData();
    } catch (err) {
      alert('Failed to add waiter');
    }
  };

  const handleDeleteWaiter = async (id) => {
    try {
      await deleteWaiter(id);
      loadData();
    } catch (err) {
      alert('Failed to delete waiter');
    }
  };

  // ---------- CATEGORY HANDLERS ----------
  const handleAddCategory = async (data) => {
    try {
      await addCategory(data);
      loadData();
    } catch (err) {
      alert('Failed to add category');
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteCategory(id);
      loadData();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  // ---------- PRODUCT HANDLERS ----------
  const handleAddProduct = async (data) => {
    try {
      await addProduct(data);
      loadData();
    } catch (err) {
      alert('Failed to add product');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      loadData();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  // ---------- PREPARED ITEMS HANDLERS ----------
  const handleAddPreparedItem = async (data) => {
    try {
      await addPreparedItem(data);
      loadData();
      setNotification({
        waiterName: 'System',
        message: `✅ Prepared item "${data.name}" added successfully!`
      });
    } catch (err) {
      alert('Failed to add prepared item');
    }
  };

  const handleUpdatePreparedItem = async (id, data) => {
    try {
      await updatePreparedItem(id, data);
      loadData();
      setNotification({
        waiterName: 'System',
        message: `✅ Prepared item updated successfully!`
      });
    } catch (err) {
      alert('Failed to update prepared item');
    }
  };

  const handleDeletePreparedItem = async (id) => {
    try {
      await deletePreparedItem(id);
      loadData();
      setNotification({
        waiterName: 'System',
        message: `🗑️ Prepared item deleted successfully!`
      });
    } catch (err) {
      alert('Failed to delete prepared item');
    }
  };

  const handleUpdatePreparedItemQuantity = async (id, quantity, action) => {
    try {
      await updatePreparedItemQuantity(id, quantity, action);
      loadData();
    } catch (err) {
      alert('Failed to update quantity');
    }
  };

  const handleSeedPreparedItems = async () => {
    try {
      await seedPreparedItems();
      loadData();
      setNotification({
        waiterName: 'System',
        message: `🌱 Sample prepared items seeded successfully!`
      });
    } catch (err) {
      alert('Failed to seed prepared items');
    }
  };

  // ---------- ORDER HANDLERS ----------
  const handleSubmitOrder = async (orderData) => {
    try {
      await createOrder(orderData);
      alert('✅ Order sent to Cashier! Status: PENDING PAYMENT');
      loadData();
    } catch (err) {
      alert('Failed to place order');
    }
  };

  const handleApproveOrder = async (orderId) => {
    try {
      await approveOrder(orderId);
      loadData();
    } catch (err) {
      alert('Failed to approve order');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel order');
    }
  };

  const handleUpdateItemStatus = async (orderId, itemId, dept, isReady) => {
    try {
      const res = await updateOrderItemStatus(orderId, itemId, dept, isReady);
      const updatedOrder = res.data.order;

      setNotification({
        waiterName: updatedOrder.waiterName,
        message: `Order #${updatedOrder.id} for ${updatedOrder.tableNumber} (${dept === 'barista' ? '☕ Barista Drinks' : '🍳 Kitchen Food'}) has been marked READY!`
      });

      loadData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Filter orders for active Waiter
  const myOrders = orders.filter(o => o.waiterId === selectedWaiterId);

  // Counts for badges
  const pendingCashierCount = orders.filter(o => o.status === 'PENDING_PAYMENT').length;
  const pendingBaristaCount = orders.filter(o => 
    o.status === 'DISPATCHED' && o.items?.some(i => i.targetDept === 'barista' && i.itemStatus !== 'ready')
  ).length;
  const pendingKitchenCount = orders.filter(o => 
    o.status === 'DISPATCHED' && o.items?.some(i => i.targetDept === 'kitchen' && i.itemStatus !== 'ready')
  ).length;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Navigation Bar */}
        <Navbar 
          activeRole={activeRole} 
          onSelectRole={handleSelectRole} 
          waiters={waiters} 
          selectedWaiterId={selectedWaiterId} 
          setSelectedWaiterId={setSelectedWaiterId} 
          pendingCashierCount={pendingCashierCount}
          pendingBaristaCount={pendingBaristaCount}
          pendingKitchenCount={pendingKitchenCount}
          isCashierUnlocked={isCashierUnlocked}
        />

        {/* Security PIN Authorization Modal */}
        <CashierAuthModal 
          open={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
          onSuccess={handleUnlockCashier} 
          cashierPin={cashierPin} 
        />

        {/* Live Notification Banner */}
        <NotificationBanner 
          notification={notification} 
          onClose={() => setNotification(null)} 
        />

        {/* Main Role Content Views */}
        <Box sx={{ pb: 6 }}>
          {activeRole === 'admin' && (
            <AdminDashboard 
              waiters={waiters} 
              categories={categories} 
              products={products} 
              onAddWaiter={handleAddWaiter} 
              onDeleteWaiter={handleDeleteWaiter} 
              onAddCategory={handleAddCategory} 
              onDeleteCategory={handleDeleteCategory} 
              onAddProduct={handleAddProduct} 
              onDeleteProduct={handleDeleteProduct} 
              cashierPin={cashierPin}
              onChangeCashierPin={handleChangeCashierPin}
            />
          )}

          {activeRole === 'waiter' && (
            <WaiterDashboard 
              waiters={waiters} 
              selectedWaiterId={selectedWaiterId} 
              setSelectedWaiterId={setSelectedWaiterId} 
              categories={categories} 
              products={products} 
              myOrders={myOrders} 
              onSubmitOrder={handleSubmitOrder} 
            />
          )}

          {activeRole === 'cashier' && isCashierUnlocked && (
            <CashierDashboard 
              orders={orders} 
              onApproveOrder={handleApproveOrder} 
              onCancelOrder={handleCancelOrder} 
              onLockCashier={handleLockCashier}
            />
          )}

          {activeRole === 'barista' && (
            <BaristaDashboard 
              orders={orders} 
              onUpdateItemStatus={handleUpdateItemStatus} 
            />
          )}

          {activeRole === 'kitchen' && (
            <KitchenDashboard 
              orders={orders} 
              onUpdateItemStatus={handleUpdateItemStatus} 
            />
          )}

          {/* Prepared Items Dashboard - Accessible from Navbar */}
          {activeRole === 'prepared-items' && (
            <PreparedItemsDashboard 
              items={preparedItems}
              onAddItem={handleAddPreparedItem}
              onUpdateItem={handleUpdatePreparedItem}
              onDeleteItem={handleDeletePreparedItem}
              onUpdateQuantity={handleUpdatePreparedItemQuantity}
              onSeedItems={handleSeedPreparedItems}
            />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;