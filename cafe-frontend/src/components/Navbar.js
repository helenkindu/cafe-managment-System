import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Box, Button, Select, MenuItem, 
  FormControl, InputLabel, Chip
} from '@mui/material';
import { 
  AdminPanelSettings, LocalDining, PointOfSale, FreeBreakfast, 
  RestaurantMenu, Person, BakeryDining, Logout 
} from '@mui/icons-material';

function Navbar({ 
  activeRole, 
  onSelectRole, 
  waiters, 
  selectedWaiterId, 
  setSelectedWaiterId,
  pendingCashierCount,
  pendingBaristaCount,
  pendingKitchenCount,
  isAuthenticated,
  user,
  onLogout,
  onOpenLogin
}) {
  const allRoles = [
    { id: 'admin', label: 'Admin (Manager)', icon: <AdminPanelSettings sx={{ mr: 1 }} /> },
    { id: 'waiter', label: 'Waiter View', icon: <Person sx={{ mr: 1 }} /> },
    { 
      id: 'cashier', 
      label: 'Cashier', 
      icon: <PointOfSale sx={{ mr: 1 }} />, 
      badge: pendingCashierCount,
    },
    { id: 'barista', label: 'Barista (Drinks)', icon: <FreeBreakfast sx={{ mr: 1 }} />, badge: pendingBaristaCount },
    { id: 'kitchen', label: 'Kitchen Chef', icon: <LocalDining sx={{ mr: 1 }} />, badge: pendingKitchenCount },
    { id: 'prepared-items', label: 'Prepared Items', icon: <BakeryDining sx={{ mr: 1 }} /> }
  ];

  // Only show the role that matches the logged‑in user
  const visibleRoles = isAuthenticated && user?.role
    ? allRoles.filter(role => role.id === user.role)
    : [];

  return (
    <AppBar position="sticky" sx={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', boxShadow: 3 }}>
      <Toolbar sx={{ flexWrap: 'wrap', gap: 2, py: 1 }}>
        {/* Brand with double-click to open login */}
        <Box 
          sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2, cursor: 'pointer' }}
          onDoubleClick={onOpenLogin}
          title={isAuthenticated ? `Logged in as ${user?.name} (${user?.role})` : 'Double-click to login'}
        >
          <RestaurantMenu sx={{ fontSize: 32, color: '#f59e0b' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 0.5, color: '#fff' }}>
            Artisan Cafe System
          </Typography>
          {isAuthenticated && (
            <Chip 
              label={`${user?.name} (${user?.role})`} 
              size="small" 
              sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 'bold', ml: 1 }} 
            />
          )}
        </Box>

        {/* Role Switcher Tabs - only the user's role is shown */}
        {isAuthenticated && (
          <Box sx={{ display: 'flex', gap: 1, flexGrow: 1, overflowX: 'auto', py: 0.5 }}>
            {visibleRoles.map(role => (
              <Button
                key={role.id}
                variant={activeRole === role.id ? 'contained' : 'outlined'}
                onClick={() => onSelectRole(role.id)}
                sx={{
                  color: activeRole === role.id ? '#fff' : '#cbd5e1',
                  backgroundColor: activeRole === role.id ? '#3b82f6' : 'transparent',
                  borderColor: activeRole === role.id ? '#3b82f6' : '#475569',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    backgroundColor: activeRole === role.id ? '#2563eb' : 'rgba(255,255,255,0.08)',
                    borderColor: activeRole === role.id ? '#2563eb' : '#64748b'
                  }
                }}
              >
                {role.icon}
                {role.label}
                {role.badge > 0 && (
                  <Chip 
                    label={role.badge} 
                    size="small" 
                    color="error" 
                    sx={{ ml: 1, height: 20, fontSize: '0.75rem', fontWeight: 'bold' }} 
                  />
                )}
              </Button>
            ))}
          </Box>
        )}

        {/* ❌ Waiter selector and chip are REMOVED */}

        {/* Logout button */}
        {isAuthenticated && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={onLogout}
            startIcon={<Logout />}
            sx={{ 
              borderColor: '#ef4444', 
              color: '#ef4444',
              '&:hover': { borderColor: '#dc2626', color: '#dc2626', backgroundColor: 'rgba(239,68,68,0.1)' }
            }}
          >
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;