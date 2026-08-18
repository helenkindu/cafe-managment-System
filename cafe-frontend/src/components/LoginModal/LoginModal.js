import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography, Alert,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText
} from '@mui/material';
import {
  Person, AdminPanelSettings, PointOfSale, LocalDining, FreeBreakfast
} from '@mui/icons-material';

function LoginModal({ open, onClose, onLogin, loading, error }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const roles = [
    { id: 'waiter', label: 'Waiter', icon: <Person />, color: '#3b82f6' },
    { id: 'cashier', label: 'Cashier', icon: <PointOfSale />, color: '#f59e0b' },
    { id: 'admin', label: 'Admin', icon: <AdminPanelSettings />, color: '#ef4444' },
    { id: 'kitchen', label: 'Kitchen Chef', icon: <LocalDining />, color: '#8b5cf6' },
    { id: 'barista', label: 'Barista', icon: <FreeBreakfast />, color: '#10b981' }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setUsername('');
    setPassword('');
  };

  const handleSubmit = () => {
    if (selectedRole && username && password) {
      onLogin(username, password, selectedRole);
    }
  };

  const handleClose = () => {
    setSelectedRole(null);
    setUsername('');
    setPassword('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          🔐 Login to System
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select your role and enter credentials
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!selectedRole ? (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Select Your Role:
            </Typography>
            <List sx={{ bgcolor: '#f8fafc', borderRadius: 2 }}>
              {roles.map(role => (
                <ListItem key={role.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleRoleSelect(role.id)}
                    sx={{
                      borderRadius: 1,
                      '&:hover': { bgcolor: role.color + '20' }
                    }}
                  >
                    <ListItemIcon sx={{ color: role.color }}>
                      {role.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={role.label}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {roles.find(r => r.id === selectedRole)?.icon} {roles.find(r => r.id === selectedRole)?.label}
              </Typography>
              <Button size="small" onClick={() => setSelectedRole(null)} sx={{ ml: 'auto' }}>
                Change Role
              </Button>
            </Box>

            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="dense"
              autoFocus
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="dense"
              disabled={loading}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Default credentials: {selectedRole}/{selectedRole}123
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleClose}>Cancel</Button>
        {selectedRole && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!username || !password || loading}
            sx={{
              bgcolor: roles.find(r => r.id === selectedRole)?.color,
              '&:hover': { opacity: 0.8 }
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default LoginModal;