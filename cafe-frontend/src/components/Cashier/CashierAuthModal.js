import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Typography, Box, Alert, IconButton 
} from '@mui/material';
import { Lock, Close, Key } from '@mui/icons-material';

function CashierAuthModal({ open, onClose, onSuccess, cashierPin }) {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pinInput === cashierPin) {
      setErrorMsg('');
      setPinInput('');
      onSuccess();
    } else {
      setErrorMsg('❌ Incorrect Cashier Passcode / PIN! Access denied.');
    }
  };

  const handleClose = () => {
    setPinInput('');
    setErrorMsg('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Lock color="warning" /> Cashier Security Authorization
        </Box>
        <IconButton onClick={handleClose}><Close /></IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            🔒 Payment approval is restricted to authorized Cashiers. Please enter your Cashier PIN to unlock payment controls.
          </Typography>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <TextField 
            label="Cashier Passcode / PIN" 
            type="password" 
            fullWidth 
            autoFocus
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="Default PIN: 1234"
            InputProps={{
              startAdornment: <Key sx={{ color: 'action.active', mr: 1 }} />
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" color="warning" sx={{ fontWeight: 'bold', px: 3 }}>
            Unlock Cashier Access
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default CashierAuthModal;
