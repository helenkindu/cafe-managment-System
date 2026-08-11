import React, { useState, useEffect, useCallback } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navbar from './components/Navbar';
import AdminDashboard from './components/Admin/AdminDashboard';
import WaiterDashboard from './components/Waiter/WaiterDashboard';
import CashierDashboard from './components/Cashier/CashierDashboard';
import CashierAuthModal from './components/Cashier/CashierAuthModal';
import BaristaDashboard from './components/Barista/BaristaDashboard';
import KitchenDashboard from './components/Kitchen/KitchenDashboard';
import NotificationBanner from './components/NotificationBanner';
import { 
  getWaiters, addWaiter, deleteWaiter, 
  getCategories, addCategory, deleteCategory, 
  getProducts, addProduct, deleteProduct, 
  getOrders, createOrder, approveOrder, cancelOrder, updateOrderItemStatus,
  getSetting, updateSetting
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
      const [wRes, cRes, pRes, oRes] = await Promise.all([
        getWaiters(),
        getCategories(),
        getProducts(),
        getOrders()
      ]);

      setWaiters(wRes.data);
      if (!selectedWaiterId && wRes.data.length > 0) {
        setSelectedWaiterId(wRes.data[0].id);
      }

      setCategories(cRes.data);
      setProducts(pRes.data);
      setOrders(oRes.data);
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

  // Handler: Add Waiter
  const handleAddWaiter = async (data) => {
    try {
      await addWaiter(data);
      loadData();
    } catch (err) {
      alert('Failed to add waiter');
    }
  };

  // Handler: Delete Waiter
  const handleDeleteWaiter = async (id) => {
    try {
      await deleteWaiter(id);
      loadData();
    } catch (err) {
      alert('Failed to delete waiter');
    }
  };

  // Handler: Add Category
  const handleAddCategory = async (data) => {
    try {
      await addCategory(data);
      loadData();
    } catch (err) {
      alert('Failed to add category');
    }
  };

  // Handler: Delete Category
  const handleDeleteCategory = async (id) => {
    try {
      await deleteCategory(id);
      loadData();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  // Handler: Add Product
  const handleAddProduct = async (data) => {
    try {
      await addProduct(data);
      loadData();
    } catch (err) {
      alert('Failed to add product');
    }
  };

  // Handler: Delete Product
  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      loadData();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  // Handler: Submit Order (Waiter)
  const handleSubmitOrder = async (orderData) => {
    try {
      await createOrder(orderData);
      alert('✅ Order sent to Cashier! Status: PENDING PAYMENT');
      loadData();
    } catch (err) {
      alert('Failed to place order');
    }
  };

  // Handler: Approve Order (Cashier)
  const handleApproveOrder = async (orderId) => {
    try {
      await approveOrder(orderId);
      loadData();
    } catch (err) {
      alert('Failed to approve order');
    }
  };

  // Handler: Cancel Order (Cashier - Only allowed before dispatch)
  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel order');
    }
  };

  // Handler: Update Item Status (Barista / Kitchen Chef)
  const handleUpdateItemStatus = async (orderId, itemId, dept, isReady) => {
    try {
      const res = await updateOrderItemStatus(orderId, itemId, dept, isReady);
      const updatedOrder = res.data.order;

      // Trigger Waiter notification
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
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;