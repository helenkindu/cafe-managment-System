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
import LandingPage from './components/landingpage/LandingPage';
import MenuOnlyPage from './components/menuOnlyPage/MenuOnlyPage';
import {
  getWaiters, addWaiter, deleteWaiter,
  getCategories, addCategory, deleteCategory,
  getProducts, addProduct, deleteProduct,
  getOrders, createOrder, approveOrder, cancelOrder, updateOrderItemStatus,
  getPreparedItems, addPreparedItem, updatePreparedItem,
  deletePreparedItem, updatePreparedItemQuantity, seedPreparedItems,
  loginUser, seedUsers,
  setAuthHeader, changePassword
} from './services/api';
import ChangePasswordModal from './components/ChangePasswordModal';

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

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Landing Page & Menu Only state
  const [showMenuOnly, setShowMenuOnly] = useState(false);

  // Password Change State
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  useEffect(() => {
    seedUsers().catch(() => {});
  }, []);

  // Load public data (categories + products) – always loaded
  const loadPublicData = useCallback(async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        getCategories(),
        getProducts(),
      ]);
      setCategories(cRes.data);
      setProducts(pRes.data);
    } catch (err) {
      console.error('Error loading public data:', err);
    }
  }, []);

  // Load full data (for authenticated users)
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

  // Load public data on mount
  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  // Auto-select waiter when logged in
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

  // Load full data and poll when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const interval = setInterval(loadData, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, loadData]);

  // ---------- NAVIGATION HANDLERS ----------
  const handleViewMenu = () => setShowMenuOnly(true);
  const handleBackToLanding = () => setShowMenuOnly(false);

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

      setAuthHeader(userData.id);

      setUser(userData);
      setIsAuthenticated(true);
      setActiveRole(userData.role);
      setLoginModalOpen(false);
      setLoginLoading(false);
      
      // Reset menu view when logged in
      setShowMenuOnly(false);
      
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
    setAuthHeader(null);
    setIsAuthenticated(false);
    setUser(null);
    setActiveRole(null);
    setSelectedWaiterId(null);
    setShowMenuOnly(false);
    setNotification({
      waiterName: 'System',
      message: '👋 Logged out successfully'
    });
  };

  // ---------- PASSWORD CHANGE HANDLER ----------
  const handleChangePassword = async (oldPassword, newPassword) => {
    setChangePasswordLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setChangePasswordLoading(false);
      setNotification({
        waiterName: 'System',
        message: '✅ Password changed successfully!'
      });
      return Promise.resolve();
    } catch (err) {
      setChangePasswordLoading(false);
      throw err;
    }
  };

  const handleOpenChangePassword = () => setChangePasswordOpen(true);
  const handleCloseChangePassword = () => setChangePasswordOpen(false);

  // ---------- WAITER HANDLERS ----------
  const handleAddWaiter = async (data) => {
    try {
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

  // ---------- FILTERED DATA ----------
  const myOrders = orders.filter(o => o.waiterId === selectedWaiterId);

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
          onOpenChangePassword={handleOpenChangePassword}
        />

        <LoginModal
          open={loginModalOpen}
          onClose={handleCloseLogin}
          onLogin={handleLogin}
          loading={loginLoading}
          error={loginError}
        />

        <ChangePasswordModal
          open={changePasswordOpen}
          onClose={handleCloseChangePassword}
          onChangePassword={handleChangePassword}
          loading={changePasswordLoading}
        />

        <NotificationBanner
          notification={notification}
          onClose={() => setNotification(null)}
        />

        <Box sx={{ pb: 6 }}>
          {!isAuthenticated ? (
            showMenuOnly ? (
              <MenuOnlyPage 
                categories={categories} 
                products={products} 
                onBack={handleBackToLanding}
              />
            ) : (
              <LandingPage onViewMenu={handleViewMenu} />
            )
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