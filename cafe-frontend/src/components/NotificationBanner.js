import React from 'react';
import { Snackbar, Alert, Typography, Box } from '@mui/material';
import { NotificationsActive } from '@mui/icons-material';

function NotificationBanner({ notification, onClose }) {
  if (!notification) return null;

  return (
    <Snackbar
      open={Boolean(notification)}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        severity="success" 
        onClose={onClose}
        icon={<NotificationsActive sx={{ fontSize: 28 }} />}
        sx={{ 
          width: '100%', 
          bgcolor: '#15803d', 
          color: '#fff',
          boxShadow: 6,
          borderRadius: 3,
          py: 1.5,
          px: 2,
          '& .MuiAlert-icon': { color: '#fff' }
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            🔔 Notification for {notification.waiterName}!
          </Typography>
          <Typography variant="body2">
            {notification.message}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
}

export default NotificationBanner;
