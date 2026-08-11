import React from 'react';
import { 
  Container, Typography, Paper, Box, Grid, Card, CardContent, 
  Button, Chip, Divider, List, ListItem, ListItemText, Alert, Tooltip 
} from '@mui/material';
import { PointOfSale, CheckCircle, Cancel, Lock, LocalShipping, Shield } from '@mui/icons-material';

function CashierDashboard({ orders, onApproveOrder, onCancelOrder, onLockCashier }) {
  const pendingOrders = orders.filter(o => o.status === 'PENDING_PAYMENT');
  const dispatchedOrders = orders.filter(o => o.status === 'DISPATCHED');
  const pastOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'CANCELLED');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Banner with Lock Session Button */}
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 4, mb: 4, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            💳 Cashier Checkout & Payment Approval
          </Typography>
          <Typography color="text.secondary">
            Receive orders from Waiters, collect payment, and dispatch items to Kitchen Chef and Barista.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            icon={<Shield />} 
            label="Cashier Authenticated" 
            color="success" 
            sx={{ fontWeight: 'bold', py: 2 }} 
          />
          <Button 
            variant="outlined" 
            color="warning" 
            startIcon={<Lock />}
            onClick={onLockCashier}
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
          >
            Lock Cashier Session
          </Button>
        </Box>
      </Paper>

      {/* SECTION 1: PENDING PAYMENT ORDERS */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PointOfSale color="warning" /> Incoming Pending Orders ({pendingOrders.length})
      </Typography>

      {pendingOrders.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
          No pending orders waiting for payment right now.
        </Alert>
      ) : (
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {pendingOrders.map(ord => (
            <Grid item xs={12} md={6} key={ord.id}>
              <Card 
                elevation={3} 
                sx={{ borderRadius: 3, borderLeft: '6px solid #f59e0b', background: '#fff' }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Order #{ord.id} - {ord.tableNumber}
                    </Typography>
                    <Chip label="Awaiting Payment" color="warning" sx={{ fontWeight: 'bold' }} />
                  </Box>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    👤 Submitted by Waiter: <strong>{ord.waiterName}</strong>
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1 }}>Order Items:</Typography>
                  <List dense sx={{ py: 0 }}>
                    {ord.items.map((item, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemText 
                          primary={`${item.name} (x${item.quantity})`}
                          secondary={`Price: $${(item.price * item.quantity).toFixed(2)} — Target: ${item.targetDept === 'barista' ? '☕ Barista' : '🍳 Kitchen'}`}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total Due:</Typography>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                      ${ord.totalPrice.toFixed(2)}
                    </Typography>
                  </Box>

                  {/* CASHIER ACTIONS */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      color="success" 
                      fullWidth
                      startIcon={<CheckCircle />}
                      onClick={() => onApproveOrder(ord.id)}
                      sx={{ py: 1.2, fontWeight: 'bold', borderRadius: 2 }}
                    >
                      Approve & Dispatch to Kitchen/Barista
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => onCancelOrder(ord.id)}
                      sx={{ fontWeight: 'bold', borderRadius: 2 }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* SECTION 2: DISPATCHED / IN PREP ORDERS (LOCKED CANCEL RULE DEMO) */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalShipping color="info" /> Dispatched & In-Prep Orders ({dispatchedOrders.length})
      </Typography>

      {dispatchedOrders.length === 0 ? (
        <Alert severity="success" sx={{ mb: 4, borderRadius: 2 }}>
          No active orders in prep queue.
        </Alert>
      ) : (
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {dispatchedOrders.map(ord => (
            <Grid item xs={12} md={6} key={ord.id}>
              <Card elevation={2} sx={{ borderRadius: 3, borderLeft: '6px solid #3b82f6', bgcolor: '#f8fafc' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Order #{ord.id} - {ord.tableNumber}
                    </Typography>
                    <Chip label="Dispatched (Paid)" color="info" sx={{ fontWeight: 'bold' }} />
                  </Box>

                  <Typography variant="subtitle2" color="text.secondary">
                    👤 Waiter: {ord.waiterName} | Paid: ${ord.totalPrice.toFixed(2)}
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  {/* CRITICAL RULE: CANCEL BUTTON IS LOCKED ONCE DISPATCHED */}
                  <Tooltip title="Cancellation is locked! Order has already been sent to Kitchen / Barista." arrowPlacement="top">
                    <span>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        disabled 
                        fullWidth 
                        startIcon={<Lock />}
                        sx={{ borderRadius: 2, fontWeight: 'bold' }}
                      >
                        Cancellation Locked (Sent to Kitchen/Barista)
                      </Button>
                    </span>
                  </Tooltip>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* SECTION 3: COMPLETED HISTORY */}
      {pastOrders.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            📜 Order History ({pastOrders.length})
          </Typography>
          <Grid container spacing={2}>
            {pastOrders.map(ord => (
              <Grid item xs={12} sm={6} md={4} key={ord.id}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Order #{ord.id} - {ord.tableNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Waiter: {ord.waiterName} | Total: ${ord.totalPrice.toFixed(2)}
                  </Typography>
                  <Chip 
                    label={ord.status} 
                    color={ord.status === 'COMPLETED' ? 'success' : 'error'} 
                    size="small" 
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
}

export default CashierDashboard;
