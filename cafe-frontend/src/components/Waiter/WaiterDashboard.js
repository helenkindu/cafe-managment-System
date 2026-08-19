import React, { useState } from 'react';
import { 
  Container, Grid, Tabs, Tab, Typography, Box, Card, CardContent, 
  CardMedia, TextField, Button, Badge, IconButton, Drawer, 
  List, ListItem, ListItemText, ListItemSecondaryAction, Divider, 
  Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, 
  Alert, InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Avatar, Fade, Grow
} from '@mui/material';
import { 
  ShoppingCart, Delete, Close, Search, TableRestaurant, 
  ReceiptLong, CheckCircle, HourglassEmpty, LocalShipping,
  Restaurant, Person, Coffee, Kitchen, Logout
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
  
  const [cart, setCart] = useState([]);
  const [tableNumber, setTableNumber] = useState('Table 1');
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);

  const activeWaiter = waiters.find(w => w.id === selectedWaiterId);

  const getImageUrl = (image) => {
    if (!image) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
    if (image.startsWith('http')) return image;
    return `http://localhost:5000${image}`;
  };

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

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCatId === 'all' || p.categoryId === selectedCatId;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      pt: 2,
      pb: 6
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Header */}
        <Grow in timeout={500}>
          <Paper elevation={0} sx={{
            p: 3,
            mb: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    ☕ Welcome, {activeWaiter?.name || 'Guest'}!
                  </Typography>
                  <Typography sx={{ opacity: 0.9 }}>
                    {activeWaiter ? `ID: ${activeWaiter.code}` : 'Please select your profile'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      color: '#fff',
                      borderRadius: 3,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                    startIcon={<ReceiptLong />}
                    onClick={() => setOrdersModalOpen(true)}
                  >
                    My Orders ({myOrders.length})
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: '#f59e0b',
                      borderRadius: 3,
                      px: 3,
                      '&:hover': { bgcolor: '#d97706' }
                    }}
                    startIcon={
                      <Badge badgeContent={getTotalItemsCount()} color="error" sx={{ '& .MuiBadge-badge': { right: -10 } }}>
                        <ShoppingCart />
                      </Badge>
                    }
                    onClick={() => setCartOpen(true)}
                  >
                    Cart
                  </Button>
                </Box>
              </Box>
            </Box>
            {/* Decorative circles */}
            <Box sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)',
            }} />
            <Box sx={{
              position: 'absolute',
              bottom: -80,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.08)',
            }} />
          </Paper>
        </Grow>

        {/* Search & Categories */}
        <Fade in timeout={700}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 4, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}>
            <TextField 
              fullWidth 
              variant="outlined" 
              placeholder="🔍 Search menu items..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#fff',
                  '&:hover fieldset': { borderColor: '#667eea' },
                  '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 }
                }
              }}
            />

            <Tabs 
              value={selectedCatId} 
              onChange={(e, val) => setSelectedCatId(val)} 
              variant="scrollable" 
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': { 
                  fontWeight: 'bold', 
                  fontSize: '0.9rem', 
                  textTransform: 'none',
                  borderRadius: 2,
                  minHeight: 40,
                  '&.Mui-selected': {
                    color: '#667eea',
                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                  }
                },
                '& .MuiTabs-indicator': {
                  bgcolor: '#667eea',
                  height: 3,
                  borderRadius: 3
                }
              }}
            >
              <Tab value="all" label="✨ All Categories" />
              {categories.map(cat => (
                <Tab key={cat.id} value={cat.id} label={`${cat.icon || '🍽️'} ${cat.name}`} />
              ))}
            </Tabs>
          </Paper>
        </Fade>

        {/* Product Cards Grid */}
        <Grid container spacing={3}>
          {filteredProducts.map((prod, index) => (
            <Grid item xs={12} sm={6} md={4} key={prod.id}>
              <Grow in timeout={800 + index * 100}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  borderRadius: 4, 
                  boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 60px rgba(102, 126, 234, 0.2)'
                  },
                  overflow: 'hidden',
                  bgcolor: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)'
                }}>
                  {/* Image Container */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    height: 140,
                    width: '100%',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
                    p: 1,
                    flexShrink: 0,
                    position: 'relative'
                  }}>
                    <CardMedia 
                      component="img" 
                      image={getImageUrl(prod.image)}
                      alt={prod.name}
                      sx={{ 
                        height: '100%',
                        width: 'auto',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'scale(1.05)' }
                      }}
                    />
                    <Chip 
                      label={prod.targetDept === 'barista' ? '☕ Barista' : '🍳 Kitchen'} 
                      size="small" 
                      color={prod.targetDept === 'barista' ? 'info' : 'warning'} 
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    />
                  </Box>
                  
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    p: 2.5,
                    '&:last-child': { pb: 2.5 }
                  }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        mb: 0.5,
                        color: '#1a1a2e'
                      }}>
                        {prod.name}
                      </Typography>
                      {prod.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          mb: 1.5,
                          fontSize: '0.85rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.5
                        }}>
                          {prod.description}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      mt: 1,
                      pt: 1.5,
                      borderTop: '2px solid #f0f0f0'
                    }}>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 'bold', 
                        color: '#667eea',
                        fontSize: '1.3rem'
                      }}>
                        ${prod.price.toFixed(2)}
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => addToCart(prod)}
                        sx={{ 
                          borderRadius: 3, 
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          py: 0.8,
                          px: 2.5,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                          '&:hover': {
                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        + Add to Order
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Cart Drawer - same as before */}
        <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
          <Box sx={{ width: 400, p: 3, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f8f9fa' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a1a2e' }}>🛒 Your Cart</Typography>
              <IconButton onClick={() => setCartOpen(false)} sx={{ bgcolor: '#fff', boxShadow: 1 }}>
                <Close />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3, bgcolor: '#fff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TableRestaurant color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Table</Typography>
              </Box>
              <FormControl fullWidth size="small">
                <Select value={tableNumber} onChange={e => setTableNumber(e.target.value)} sx={{ borderRadius: 2 }}>
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
                <Typography color="text.secondary" sx={{ fontSize: '1.1rem' }}>Your cart is empty</Typography>
                <Typography variant="body2" color="text.secondary">Add some delicious items!</Typography>
              </Box>
            ) : (
              <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <List>
                  {cart.map(item => (
                    <React.Fragment key={item.id}>
                      <ListItem sx={{ py: 1.5, px: 0 }}>
                        <ListItemText 
                          primary={<Typography sx={{ fontWeight: 'bold' }}>{item.name}</Typography>}
                          secondary={`$${item.price.toFixed(2)} x ${item.quantity}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton size="small" onClick={() => updateQuantity(item.id, -1)} sx={{ border: '1px solid #e0e0e0', mr: 0.5 }}>-</IconButton>
                          <span style={{ fontWeight: 'bold', margin: '0 8px', minWidth: '20px', display: 'inline-block', textAlign: 'center' }}>{item.quantity}</span>
                          <IconButton size="small" onClick={() => updateQuantity(item.id, 1)} sx={{ border: '1px solid #e0e0e0', mr: 0.5 }}>+</IconButton>
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
              <Box sx={{ pt: 2, borderTop: '2px solid #e0e0e0', bgcolor: '#fff', borderRadius: 3, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total:</Typography>
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>${getTotalPrice()}</Typography>
                </Box>
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth 
                  size="large"
                  onClick={handlePlaceOrder}
                  sx={{ 
                    py: 1.8, 
                    borderRadius: 3, 
                    fontWeight: 'bold', 
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                    '&:hover': { boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)' }
                  }}
                >
                  Send Order to Cashier 🚀
                </Button>
              </Box>
            )}
          </Box>
        </Drawer>

        {/* Orders Dialog */}
        <Dialog open={ordersModalOpen} onClose={() => setOrdersModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            📋 My Orders
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
                  <Paper key={ord.id} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Order #{ord.id} - {ord.tableNumber}
                      </Typography>
                      {ord.status === 'PENDING_PAYMENT' && (
                        <Chip icon={<HourglassEmpty />} label="Waiting Approval" color="warning" />
                      )}
                      {ord.status === 'DISPATCHED' && (
                        <Chip icon={<LocalShipping />} label="In Prep" color="info" />
                      )}
                      {ord.status === 'COMPLETED' && (
                        <Chip icon={<CheckCircle />} label="Ready!" color="success" />
                      )}
                      {ord.status === 'CANCELLED' && (
                        <Chip label="Cancelled" color="error" />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Items: {ord.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold', color: '#667eea' }}>
                      Total: ${ord.totalPrice.toFixed(2)}
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
    </Box>
  );
}

export default WaiterDashboard;