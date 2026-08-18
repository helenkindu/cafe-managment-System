import React, { useState, useEffect, useCallback } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navbar from './components/Navbar';
import AdminDashboard from './components/Admin/AdminDashboard';
import WaiterDashboard from './components/Waiter/WaiterDashboard';
import CashierDashboard from './components/Cashier/CashierDashboard';
import BaristaDashboard from './components/Barista/BaristaDashboard';
import KitchenDashboard from './components/Kitchen/KitchenDashboard';
import PreparedItemsDashboard from './components/prepared-item/PreparedItemsDashboard';
import LoginModal from './components/LoginModal/LoginModal';
import NotificationBanner from './components/NotificationBanner';
import MenuDisplay from './components/MenuDisplay/MenuDisplay';
import {
  getWaiters, addWaiter, deleteWaiter,
  getCategories, addCategory, deleteCategory,
  getProducts, addProduct, deleteProduct,
  getOrders, createOrder, approveOrder, cancelOrder, updateOrderItemStatus,
  getPreparedItems, addPreparedItem, updatePreparedItem,
  deletePreparedItem, updatePreparedItemQuantity, seedPreparedItems,
  loginUser, seedUsers,
  setAuthHeader  // 👈 import the header setter
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
  const [activeRole, setActiveRole] = useState(null);
  const [waiters, setWaiters] = useState([]);
  const [selectedWaiterId, setSelectedWaiterId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [preparedItems, setPreparedItems] = useState([]);
  const [notification, setNotification] = useState(null);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Seed users on first run
  useEffect(() => {
    seedUsers().catch(() => {});
  }, []);

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
      setCategories(cRes.data);
      setProducts(pRes.data);
      setOrders(oRes.data);
      setPreparedItems(piRes.data);
    } catch (err) {
      console.error('Error loading cafe data:', err);
    }
  }, []);

  // Auto‑select waiter when logged in as waiter and waiters are loaded
  useEffect(() => {
    if (isAuthenticated && user?.role === 'waiter' && waiters.length > 0) {
      const matched = waiters.find(w =>
        w.username?.toLowerCase() === user.username?.toLowerCase() ||
        w.code?.toLowerCase() === user.username?.toLowerCase()
      );
      if (matched) {
        setSelectedWaiterId(matched.id);
      } else {
        setSelectedWaiterId(waiters[0]?.id || null);
      }
    }
  }, [isAuthenticated, user, waiters]);

  // Load data periodically when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const interval = setInterval(loadData, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, loadData]);

  // ---------- AUTH HANDLERS ----------
  const handleOpenLogin = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      setLoginError(null);
    }
  };

  const handleCloseLogin = () => {
    setLoginModalOpen(false);
    setLoginError(null);
    setLoginLoading(false);
  };

  const handleLogin = async (username, password, role) => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const response = await loginUser(username, password);
      const userData = response.data;
      
      if (userData.role !== role) {
        setLoginError(`This account is not a ${role}. Please select correct role.`);
        setLoginLoading(false);
        return;
      }

      // 🔥 Set the auth header for all future requests
      setAuthHeader(userData.id);

      setUser(userData);
      setIsAuthenticated(true);
      setActiveRole(userData.role);
      setLoginModalOpen(false);
      setLoginLoading(false);
      
      setNotification({
        waiterName: 'System',
        message: `✅ Welcome ${userData.name}! Logged in as ${userData.role}`
      });
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    // 🔥 Remove the auth header
    setAuthHeader(null);
    setIsAuthenticated(false);
    setUser(null);
    setActiveRole(null);
    setSelectedWaiterId(null);
    setNotification({
      waiterName: 'System',
      message: '👋 Logged out successfully'
    });
  };

  // ---------- WAITER HANDLERS ----------
  const handleAddWaiter = async (data) => {
    try {
      // The backend already creates the user – no extra call needed
      await addWaiter(data);
      await loadData();
      setNotification({
        waiterName: 'System',
        message: `✅ Waiter "${data.name}" added with username "${data.username}"`
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      alert(`Failed to add waiter: ${errorMsg}`);
    }
  };

  const handleDeleteWaiter = async (id) => {
  try {
    console.log(`Deleting waiter with ID: ${id}`);
    await deleteWaiter(id);
    await loadData();
    setNotification({
      waiterName: 'System',
      message: `🗑️ Waiter deleted successfully!`
    });
  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message;
    alert(`Failed to delete waiter: ${errorMsg}`);
    console.error('Delete error:', err);
  }
};;

  // ---------- CATEGORY, PRODUCT, PREPARED ITEM, ORDER HANDLERS ----------
  // (All other handlers remain exactly as before – they are already defined)
  // For completeness, I include them all.

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
        <Navbar
          activeRole={activeRole}
          onSelectRole={setActiveRole}
          waiters={waiters}
          selectedWaiterId={selectedWaiterId}
          setSelectedWaiterId={setSelectedWaiterId}
          pendingCashierCount={pendingCashierCount}
          pendingBaristaCount={pendingBaristaCount}
          pendingKitchenCount={pendingKitchenCount}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
          onOpenLogin={handleOpenLogin}
        />

        <LoginModal
          open={loginModalOpen}
          onClose={handleCloseLogin}
          onLogin={handleLogin}
          loading={loginLoading}
          error={loginError}
        />

        <NotificationBanner
          notification={notification}
          onClose={() => setNotification(null)}
        />

        <Box sx={{ pb: 6 }}>
          {!isAuthenticated ? (
            <MenuDisplay categories={categories} products={products} />
          ) : (
            <>
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
                />
              )}
              {activeRole === 'waiter' && (
                <WaiterDashboard
                  waiters={waiters}
                  selectedWaiterId={selectedWaiterId}
                  categories={categories}
                  products={products}
                  myOrders={myOrders}
                  onSubmitOrder={handleSubmitOrder}
                />
              )}
              {activeRole === 'cashier' && (
                <CashierDashboard
                  orders={orders}
                  onApproveOrder={handleApproveOrder}
                  onCancelOrder={handleCancelOrder}
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
              {activeRole === 'prepared-items' && (
                <PreparedItemsDashboard
                  items={preparedItems}
                  categories={categories}
                  onAddItem={handleAddPreparedItem}
                  onUpdateItem={handleUpdatePreparedItem}
                  onDeleteItem={handleDeletePreparedItem}
                  onUpdateQuantity={handleUpdatePreparedItemQuantity}
                  onSeedItems={handleSeedPreparedItems}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;