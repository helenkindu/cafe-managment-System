import React from 'react';
import { 
  AppBar, Toolbar, Typography, Box, Button, Select, MenuItem, 
  FormControl, InputLabel, Chip
} from '@mui/material';
import { 
  AdminPanelSettings, LocalDining, PointOfSale, FreeBreakfast, 
  RestaurantMenu, Person, Lock 
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
  isCashierUnlocked
}) {
  const roles = [
    { id: 'admin', label: 'Admin (Manager)', icon: <AdminPanelSettings sx={{ mr: 1 }} /> },
    { id: 'waiter', label: 'Waiter View', icon: <Person sx={{ mr: 1 }} /> },
    { 
      id: 'cashier', 
      label: 'Cashier', 
      icon: <PointOfSale sx={{ mr: 1 }} />, 
      badge: pendingCashierCount,
      isLocked: !isCashierUnlocked 
    },
    { id: 'barista', label: 'Barista (Drinks)', icon: <FreeBreakfast sx={{ mr: 1 }} />, badge: pendingBaristaCount },
    { id: 'kitchen', label: 'Kitchen Chef', icon: <LocalDining sx={{ mr: 1 }} />, badge: pendingKitchenCount }
  ];

  const selectedWaiter = waiters.find(w => w.id === selectedWaiterId);

  return (
    <AppBar position="sticky" sx={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', boxShadow: 3 }}>
      <Toolbar sx={{ flexWrap: 'wrap', gap: 2, py: 1 }}>
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
          <RestaurantMenu sx={{ fontSize: 32, color: '#f59e0b' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 0.5, color: '#fff' }}>
            Artisan Cafe System
          </Typography>
        </Box>

        {/* Role Switcher Tabs */}
        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1, overflowX: 'auto', py: 0.5 }}>
          {roles.map(role => (
            <Button
              key={role.id}
              variant={activeRole === role.id ? 'contained' : 'outlined'}
              onClick={() => onSelectRole(role.id)}
              sx={{
                color: activeRole === role.id ? '#fff' : '#cbd5e1',
                backgroundColor: activeRole === role.id ? '#3b82f6' : 'transparent',
                borderColor: '#475569',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: activeRole === role.id ? '#2563eb' : 'rgba(255,255,255,0.08)',
                  borderColor: '#64748b'
                }
              }}
            >
              {role.icon}
              {role.label}
              {role.isLocked && <Lock sx={{ fontSize: 16, ml: 0.5, color: '#f59e0b' }} />}
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

        {/* Waiter Roster Selector (Active when Waiter Role is selected) */}
        {activeRole === 'waiter' && (
          <FormControl size="small" sx={{ minWidth: 180, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1.5 }}>
            <InputLabel sx={{ color: '#94a3b8' }}>Select Waiter</InputLabel>
            <Select
              value={selectedWaiterId || ''}
              onChange={(e) => setSelectedWaiterId(e.target.value)}
              label="Select Waiter"
              sx={{ color: '#fff', '.MuiSvgIcon-root': { color: '#fff' } }}
            >
              {waiters.map(w => (
                <MenuItem key={w.id} value={w.id}>
                  👤 {w.name} ({w.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Active Waiter Indicator Badge */}
        {activeRole === 'waiter' && selectedWaiter && (
          <Chip 
            label={`Active: ${selectedWaiter.name}`} 
            color="success" 
            variant="outlined" 
            sx={{ color: '#4ade80', borderColor: '#4ade80', fontWeight: 'bold' }} 
          />
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
