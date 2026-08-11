import { useState, useEffect } from 'react';
import { 
  Container, Grid, Tabs, Tab, Typography, Box, Card, CardContent, 
  CardMedia, Rating, TextField, Button, Badge, IconButton, Drawer, 
  List, ListItem, ListItemText, ListItemSecondaryAction, Divider, 
  Alert, Snackbar
} from '@mui/material';
import { ShoppingCart, Delete, Close } from '@mui/icons-material';
import { fetchCategories, fetchProducts, submitFeedback, fetchFeedback } from '../services/api';
import axios from 'axios';

function MenuPage() {
  const restaurantId = 'cafe123';
  
  // Existing states
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState({ customerName: '', rating: 0, comment: '' });

  // NEW CART STATES
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState({ customerName: '', customerPhone: '' });
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Load categories on page load
  useEffect(() => {
    fetchCategories(restaurantId).then(res => {
      setCategories(res.data);
      if (res.data.length > 0) setSelectedCategory(res.data[0].id);
    });
  }, []);

  // Load products when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(restaurantId, selectedCategory).then(res => setProducts(res.data));
      fetchFeedback(restaurantId).then(res => setFeedbacks(res.data));
    }
  }, [selectedCategory]);

  // ---------- CART FUNCTIONS ----------
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => 
      prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean)
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  // ---------- PLACE ORDER ----------
  const placeOrder = async () => {
    if (!checkout.customerName || !checkout.customerPhone) {
      alert('Please enter your name and phone number!');
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const orderData = {
      customerName: checkout.customerName,
      customerPhone: checkout.customerPhone,
      items: cart.map(item => ({ 
        id: item.id, 
        name: item.name, 
        price: item.price, 
        quantity: item.quantity 
      })),
      totalPrice: parseFloat(getTotalPrice()),
      restaurantId: restaurantId,
      status: 'Pending'
    };

    try {
      await axios.post('http://localhost:5000/api/orders', orderData);
      setOrderSuccess(true);
      setCart([]);
      setCheckout({ customerName: '', customerPhone: '' });
      setCartOpen(false);
    } catch (err) {
      alert('Failed to place order. Please try again.');
      console.error(err);
    }
  };

  // ---------- FEEDBACK SUBMIT (unchanged) ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newFeedback.rating === 0) return alert('Please give a star rating!');
    await submitFeedback({ ...newFeedback, productId: null, restaurantId });
    setNewFeedback({ customerName: '', rating: 0, comment: '' });
    alert('Thank you for your feedback!');
    fetchFeedback(restaurantId).then(res => setFeedbacks(res.data));
  };

  // ---------- RENDER ----------
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>

      {/* HEADER WITH CART ICON */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h3">☕ Our Cafe Menu</Typography>
        <IconButton color="primary" onClick={() => setCartOpen(true)}>
          <Badge badgeContent={getTotalItems()} color="error">
            <ShoppingCart />
          </Badge>
        </IconButton>
      </Box>
      
      {/* Category Tabs */}
      <Tabs 
        value={selectedCategory} 
        onChange={(e, val) => setSelectedCategory(val)} 
        variant="scrollable" 
        sx={{ mb: 3 }}
      >
        {categories.map(cat => (
          <Tab key={cat.id} label={cat.name} value={cat.id} />
        ))}
      </Tabs>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {products.map(prod => (
          <Grid item xs={12} sm={6} key={prod.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia 
                component="img" 
                height="140" 
                image={prod.image || 'https://via.placeholder.com/150'} 
                alt={prod.name} 
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{prod.name}</Typography>
                <Typography variant="body2" color="text.secondary">{prod.description}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="h6" color="primary">${prod.price}</Typography>
                  <Button 
                    size="small" 
                    variant="contained" 
                    onClick={() => addToCart(prod)}
                  >
                    Add to Cart
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ========== CART DRAWER ========== */}
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Box sx={{ width: 350, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Your Cart</Typography>
            <IconButton onClick={() => setCartOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Divider />

          {cart.length === 0 ? (
            <Typography sx={{ mt: 3, textAlign: 'center' }}>Your cart is empty.</Typography>
          ) : (
            <>
              <List>
                {cart.map(item => (
                  <ListItem key={item.id}>
                    <ListItemText 
                      primary={item.name}
                      secondary={`$${item.price} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton size="small" onClick={() => updateQuantity(item.id, -1)}>-</IconButton>
                      <span style={{ margin: '0 8px' }}>{item.quantity}</span>
                      <IconButton size="small" onClick={() => updateQuantity(item.id, 1)}>+</IconButton>
                      <IconButton size="small" color="error" onClick={() => removeFromCart(item.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Divider />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Total: ${getTotalPrice()}
              </Typography>

              {/* Checkout Form */}
              <Box sx={{ mt: 2 }}>
                <TextField 
                  label="Your Name" 
                  fullWidth 
                  margin="normal" 
                  value={checkout.customerName}
                  onChange={(e) => setCheckout({...checkout, customerName: e.target.value})}
                  required
                />
                <TextField 
                  label="Phone Number" 
                  fullWidth 
                  margin="normal" 
                  value={checkout.customerPhone}
                  onChange={(e) => setCheckout({...checkout, customerPhone: e.target.value})}
                  required
                />
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  onClick={placeOrder}
                >
                  Place Order
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      {/* ========== FEEDBACK SECTION ========== */}
      <Box sx={{ mt: 6, borderTop: '2px solid #eee', pt: 4 }}>
        <Typography variant="h5" gutterBottom>📝 Leave a Review</Typography>
        <form onSubmit={handleSubmit}>
          <TextField 
            label="Your Name" 
            fullWidth 
            margin="normal" 
            value={newFeedback.customerName} 
            onChange={(e) => setNewFeedback({...newFeedback, customerName: e.target.value})} 
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
            <Typography>Rating:</Typography>
            <Rating 
              value={newFeedback.rating} 
              onChange={(e, val) => setNewFeedback({...newFeedback, rating: val})} 
            />
          </Box>
          <TextField 
            label="Comment" 
            multiline 
            rows={3} 
            fullWidth 
            margin="normal" 
            value={newFeedback.comment} 
            onChange={(e) => setNewFeedback({...newFeedback, comment: e.target.value})} 
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Submit Feedback
          </Button>
        </form>

        <Typography variant="h6" sx={{ mt: 4 }}>Recent Reviews</Typography>
        {feedbacks.map(fb => (
          <Box key={fb.id} sx={{ borderBottom: '1px solid #ddd', py: 1 }}>
            <Rating value={fb.rating} readOnly size="small" />
            <Typography variant="body2">
              <strong>{fb.customerName || 'Anonymous'}</strong>: {fb.comment}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Order Success Snackbar */}
      <Snackbar 
        open={orderSuccess} 
        autoHideDuration={4000} 
        onClose={() => setOrderSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setOrderSuccess(false)}>
          ✅ Order placed successfully! We'll prepare it shortly.
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default MenuPage;