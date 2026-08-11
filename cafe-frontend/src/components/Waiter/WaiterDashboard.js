import React, { useState } from 'react';
import { 
  Container, Grid, Tabs, Tab, Typography, Box, Card, CardContent, 
  CardMedia, TextField, Button, Badge, IconButton, Drawer, 
  List, ListItem, ListItemText, ListItemSecondaryAction, Divider, 
  Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, 
  Alert, InputAdornment, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import { 
  ShoppingCart, Delete, Close, Search, TableRestaurant, 
  ReceiptLong, CheckCircle, HourglassEmpty, LocalShipping 
} from '@mui/icons-material';

function WaiterDashboard({ 
  waiters, 
  selectedWaiterId, 
  setSelectedWaiterId,
  categories, 
  products, 
  myOrders, 
  onSubmitOrder 
}) {
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [tableNumber, setTableNumber] = useState('Table 1');
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);

  const activeWaiter = waiters.find(w => w.id === selectedWaiterId);

  // Cart operations
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty <= 0 ? null : { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const getTotalItemsCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handlePlaceOrder = () => {
    if (!selectedWaiterId) {
      alert('Please select your Waiter ID first!');
      return;
    }
    if (!tableNumber) {
      alert('Please specify a Table Number!');
      return;
    }
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const orderData = {
      waiterId: activeWaiter.id,
      waiterName: activeWaiter.name,
      tableNumber: tableNumber,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        targetDept: item.targetDept || 'kitchen'
      })),
      totalPrice: parseFloat(getTotalPrice())
    };

    onSubmitOrder(orderData);
    setCart([]);
    setCartOpen(false);
  };

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCatId === 'all' || p.categoryId === selectedCatId;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Waiter Selection Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 220, bgcolor: '#fff', borderRadius: 1.5 }}>
            <InputLabel>Active Waiter Profile</InputLabel>
            <Select
              value={selectedWaiterId || ''}
              onChange={(e) => setSelectedWaiterId(e.target.value)}
              label="Active Waiter Profile"
            >
              {waiters.map(w => (
                <MenuItem key={w.id} value={w.id}>
                  👤 {w.name} ({w.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {activeWaiter ? (
            <Chip 
              label={`Logged in as: ${activeWaiter.name} (${activeWaiter.code})`} 
              color="primary" 
              sx={{ fontWeight: 'bold', fontSize: '0.9rem', py: 2 }} 
            />
          ) : (
            <Alert severity="warning" sx={{ py: 0 }}>Please select your Waiter ID to place orders</Alert>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button 
            variant="outlined" 
            color="info" 
            startIcon={<ReceiptLong />}
            onClick={() => setOrdersModalOpen(true)}
            sx={{ borderRadius: 2, fontWeight: 'bold' }}
          >
            My Orders ({myOrders.length})
          </Button>

          <Button 
            variant="contained" 
            color="warning" 
            startIcon={
              <Badge badgeContent={getTotalItemsCount()} color="error">
                <ShoppingCart />
              </Badge>
            }
            onClick={() => setCartOpen(true)}
            sx={{ borderRadius: 2, fontWeight: 'bold', px: 3 }}
          >
            Order Cart
          </Button>
        </Box>
      </Paper>

      {/* Search & Categories Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField 
          fullWidth 
          variant="outlined" 
          placeholder="Search hot drinks, breakfast, pizza, cake, desserts..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2, bgcolor: '#fff', borderRadius: 2 }}
        />

        <Tabs 
          value={selectedCatId} 
          onChange={(e, val) => setSelectedCatId(val)} 
          variant="scrollable" 
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': { fontWeight: 'bold', fontSize: '0.95rem', textTransform: 'none' }
          }}
        >
          <Tab value="all" label="✨ All Categories" />
          {categories.map(cat => (
            <Tab key={cat.id} value={cat.id} label={`${cat.icon || '🍽️'} ${cat.name}`} />
          ))}
        </Tabs>
      </Box>

      {/* Product Cards Grid */}
      <Grid container spacing={3}>
        {filteredProducts.map(prod => (
          <Grid item xs={12} sm={6} md={4} key={prod.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
              <CardMedia 
                component="img" 
                height="170" 
                image={prod.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} 
                alt={prod.name} 
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{prod.name}</Typography>
                    <Chip 
                      label={prod.targetDept === 'barista' ? '☕ Barista' : '🍳 Kitchen'} 
                      size="small" 
                      color={prod.targetDept === 'barista' ? 'info' : 'warning'} 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {prod.description}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    ${prod.price.toFixed(2)}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="small"
                    onClick={() => addToCart(prod)}
                    sx={{ borderRadius: 2, fontWeight: 'bold' }}
                  >
                    + Add to Order
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* CART DRAWER */}
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Box sx={{ width: 380, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>🛒 Table Order Cart</Typography>
            <IconButton onClick={() => setCartOpen(false)}><Close /></IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {/* Table Selector */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: '#f8fafc' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TableRestaurant color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Table Selection</Typography>
            </Box>
            <FormControl fullWidth size="small">
              <Select value={tableNumber} onChange={e => setTableNumber(e.target.value)}>
                <MenuItem value="Table 1">Table 1</MenuItem>
                <MenuItem value="Table 2">Table 2</MenuItem>
                <MenuItem value="Table 3">Table 3</MenuItem>
                <MenuItem value="Table 4">Table 4</MenuItem>
                <MenuItem value="Table 5">Table 5</MenuItem>
                <MenuItem value="Table 6">Table 6</MenuItem>
                <MenuItem value="Takeaway / Counter">Takeaway / Counter</MenuItem>
              </Select>
            </FormControl>
          </Paper>

          {cart.length === 0 ? (
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <Typography color="text.secondary">No items in cart</Typography>
            </Box>
          ) : (
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              <List>
                {cart.map(item => (
                  <React.Fragment key={item.id}>
                    <ListItem sx={{ py: 1, px: 0 }}>
                      <ListItemText 
                        primary={<Typography sx={{ fontWeight: 'bold' }}>{item.name}</Typography>}
                        secondary={`$${item.price.toFixed(2)} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)} (${item.targetDept === 'barista' ? '☕ Barista' : '🍳 Kitchen'})`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton size="small" onClick={() => updateQuantity(item.id, -1)}>-</IconButton>
                        <span style={{ fontWeight: 'bold', margin: '0 8px' }}>{item.quantity}</span>
                        <IconButton size="small" onClick={() => updateQuantity(item.id, 1)}>+</IconButton>
                        <IconButton size="small" color="error" onClick={() => removeFromCart(item.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}

          {cart.length > 0 && (
            <Box sx={{ pt: 2, borderTop: '2px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total Price:</Typography>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>${getTotalPrice()}</Typography>
              </Box>
              <Button 
                variant="contained" 
                color="success" 
                fullWidth 
                size="large"
                onClick={handlePlaceOrder}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold', fontSize: '1.05rem' }}
              >
                Send Order to Cashier
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* MY SENT ORDERS TRACKING DIALOG */}
      <Dialog open={ordersModalOpen} onClose={() => setOrdersModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          📋 Orders Sent by {activeWaiter ? activeWaiter.name : 'Waiter'}
          <IconButton onClick={() => setOrdersModalOpen(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {myOrders.length === 0 ? (
            <Typography sx={{ py: 3, textAlign: 'center' }} color="text.secondary">
              No orders sent yet.
            </Typography>
          ) : (
            <List>
              {myOrders.map(ord => (
                <Paper key={ord.id} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Order #{ord.id} - {ord.tableNumber}
                    </Typography>
                    {ord.status === 'PENDING_PAYMENT' && (
                      <Chip icon={<HourglassEmpty />} label="Waiting Cashier Approval" color="warning" />
                    )}
                    {ord.status === 'DISPATCHED' && (
                      <Chip icon={<LocalShipping />} label="In Kitchen / Barista Prep" color="info" />
                    )}
                    {ord.status === 'COMPLETED' && (
                      <Chip icon={<CheckCircle />} label="Ready / Finished!" color="success" />
                    )}
                    {ord.status === 'CANCELLED' && (
                      <Chip label="Cancelled" color="error" />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Items: {ord.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold', color: '#2563eb' }}>
                    Total Price: ${ord.totalPrice.toFixed(2)}
                  </Typography>
                </Paper>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrdersModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default WaiterDashboard;
