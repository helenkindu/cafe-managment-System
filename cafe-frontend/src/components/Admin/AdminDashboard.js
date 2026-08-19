import React, { useState } from 'react';
import { 
  Box, Container, Typography, Paper, Tabs, Tab, TextField, 
  Button, Grid, Card, CardContent, IconButton, List, ListItem, 
  ListItemText, ListItemSecondaryAction, Select, MenuItem, 
  FormControl, InputLabel, Divider, Chip, Alert, Avatar, Grow, Fade
} from '@mui/material';
import { 
  Delete, Add, PersonAdd, Category, Fastfood, Security, Key,
  Dashboard, People, Restaurant, FoodBank
} from '@mui/icons-material';

function AdminDashboard({ 
  waiters, 
  categories, 
  products, 
  onAddWaiter, 
  onDeleteWaiter, 
  onAddCategory, 
  onDeleteCategory, 
  onAddProduct, 
  onDeleteProduct,
  cashierPin,
  onChangeCashierPin
}) {
  const [tabIndex, setTabIndex] = useState(0);

  const [waiterName, setWaiterName] = useState('');
  const [waiterCode, setWaiterCode] = useState('');
  const [waiterUsername, setWaiterUsername] = useState('');
  const [waiterPassword, setWaiterPassword] = useState('');

  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('🍽️');
  const [catDept, setCatDept] = useState('kitchen');

  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImg, setProdImg] = useState('');
  const [prodCatId, setProdCatId] = useState('');
  const [prodDept, setProdDept] = useState('kitchen');

  const [newPin, setNewPin] = useState(cashierPin);
  const [pinSuccess, setPinSuccess] = useState(false);

  const handleCreateWaiter = (e) => {
    e.preventDefault();
    if (!waiterName || !waiterCode || !waiterUsername || !waiterPassword) {
      return alert('Please fill all waiter fields');
    }
    onAddWaiter({
      name: waiterName,
      code: waiterCode,
      username: waiterUsername,
      password: waiterPassword,
      isActive: true
    });
    setWaiterName('');
    setWaiterCode('');
    setWaiterUsername('');
    setWaiterPassword('');
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!catName) return alert('Enter category name');
    onAddCategory({ name: catName, icon: catIcon, targetDept: catDept });
    setCatName('');
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodCatId) return alert('Fill required product fields');
    
    const formData = new FormData();
    formData.append('name', prodName);
    formData.append('description', prodDesc);
    formData.append('price', parseFloat(prodPrice));
    formData.append('categoryId', parseInt(prodCatId));
    formData.append('targetDept', prodDept);
    
    if (prodImg && typeof prodImg === 'object') {
      formData.append('image', prodImg);
    }
    
    onAddProduct(formData);
    
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdImg('');
    setProdCatId('');
    setProdDept('kitchen');
  };

  const handleUpdatePin = (e) => {
    e.preventDefault();
    if (!newPin || newPin.trim().length === 0) return alert('Enter a valid PIN');
    onChangeCashierPin(newPin.trim());
    setPinSuccess(true);
    setTimeout(() => setPinSuccess(false), 4000);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      pt: 2,
      pb: 6
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Grow in timeout={500}>
          <Paper elevation={0} sx={{
            p: 3,
            mb: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                ⚙️ Admin Management Portal
              </Typography>
              <Typography sx={{ opacity: 0.8 }}>
                Manage cafe waiters, menu categories, product items, and security PINs
              </Typography>
            </Box>
            <Box sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.05)',
            }} />
          </Paper>
        </Grow>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}>
          <Tabs 
            value={tabIndex} 
            onChange={(e, val) => setTabIndex(val)} 
            sx={{ 
              mb: 3,
              '& .MuiTab-root': { 
                fontWeight: 'bold', 
                textTransform: 'none', 
                borderRadius: 2,
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
            <Tab icon={<People />} label={`Waiters (${waiters.length})`} iconPosition="start" />
            <Tab icon={<Category />} label={`Categories (${categories.length})`} iconPosition="start" />
            <Tab icon={<FoodBank />} label={`Products (${products.length})`} iconPosition="start" />
            <Tab icon={<Security />} label="Security" iconPosition="start" />
          </Tabs>

          {/* WAITERS TAB */}
          {tabIndex === 0 && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={5}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#fafafa' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>➕ Add Waiter</Typography>
                  <form onSubmit={handleCreateWaiter}>
                    <TextField 
                      label="Full Name" 
                      fullWidth 
                      margin="normal" 
                      value={waiterName} 
                      onChange={e => setWaiterName(e.target.value)} 
                      required 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField 
                      label="Employee Code" 
                      fullWidth 
                      margin="normal" 
                      value={waiterCode} 
                      onChange={e => setWaiterCode(e.target.value)} 
                      required 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField 
                      label="Username (login)" 
                      fullWidth 
                      margin="normal" 
                      value={waiterUsername} 
                      onChange={e => setWaiterUsername(e.target.value)} 
                      required 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField 
                      label="Password" 
                      type="password"
                      fullWidth 
                      margin="normal" 
                      value={waiterPassword} 
                      onChange={e => setWaiterPassword(e.target.value)} 
                      required 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <Button 
                      type="submit" 
                      variant="contained" 
                      fullWidth 
                      startIcon={<Add />} 
                      sx={{ 
                        mt: 2, 
                        py: 1.2, 
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': { boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }
                      }}
                    >
                      Add Waiter
                    </Button>
                  </form>
                </Paper>
              </Grid>
              <Grid item xs={12} md={7}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>📋 Waiters Roster</Typography>
                <Paper variant="outlined" sx={{ borderRadius: 3 }}>
                  <List>
                    {waiters.map(w => (
                      <React.Fragment key={w.id}>
                        <ListItem>
                          <Avatar sx={{ bgcolor: '#667eea', mr: 2 }}>{w.name.charAt(0)}</Avatar>
                          <ListItemText 
                            primary={<Typography sx={{ fontWeight: 'bold' }}>{w.name}</Typography>}
                            secondary={`ID: ${w.code} | Username: ${w.User?.username || '—'}`}
                          />
                          <ListItemSecondaryAction>
                            <Chip label="Active" color="success" size="small" sx={{ mr: 1 }} />
                            <IconButton color="error" onClick={() => onDeleteWaiter(w.id)}>
                              <Delete />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* CATEGORIES TAB */}
          {tabIndex === 1 && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={5}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#fafafa' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>➕ Add Category</Typography>
                  <form onSubmit={handleCreateCategory}>
                    <TextField 
                      label="Category Name" 
                      fullWidth 
                      margin="normal" 
                      value={catName} 
                      onChange={e => setCatName(e.target.value)} 
                      required 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField 
                      label="Icon (Emoji)" 
                      fullWidth 
                      margin="normal" 
                      value={catIcon} 
                      onChange={e => setCatIcon(e.target.value)} 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Department</InputLabel>
                      <Select value={catDept} onChange={e => setCatDept(e.target.value)} label="Department" sx={{ borderRadius: 2 }}>
                        <MenuItem value="barista">☕ Barista (Drinks)</MenuItem>
                        <MenuItem value="kitchen">🍳 Kitchen (Food)</MenuItem>
                      </Select>
                    </FormControl>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      fullWidth 
                      startIcon={<Add />} 
                      sx={{ 
                        mt: 2, 
                        py: 1.2, 
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': { boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }
                      }}
                    >
                      Create Category
                    </Button>
                  </form>
                </Paper>
              </Grid>
              <Grid item xs={12} md={7}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>📁 Categories</Typography>
                <Grid container spacing={2}>
                  {categories.map(cat => (
                    <Grid item xs={12} sm={6} key={cat.id}>
                      <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6">{cat.icon} {cat.name}</Typography>
                            <Chip 
                              label={`→ ${cat.targetDept === 'barista' ? '☕ Barista' : '🍳 Kitchen'}`} 
                              size="small" 
                              color={cat.targetDept === 'barista' ? 'info' : 'warning'} 
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                          <IconButton color="error" onClick={() => onDeleteCategory(cat.id)}>
                            <Delete />
                          </IconButton>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          )}

          {/* PRODUCTS TAB */}
          {tabIndex === 2 && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#fafafa' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>➕ Add Menu Item</Typography>
                  <form onSubmit={handleCreateProduct}>
                    <TextField 
                      label="Item Name" 
                      fullWidth 
                      margin="dense" 
                      value={prodName} 
                      onChange={e => setProdName(e.target.value)} 
                      required 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField 
                      label="Description" 
                      fullWidth 
                      margin="dense" 
                      multiline 
                      rows={2} 
                      value={prodDesc} 
                      onChange={e => setProdDesc(e.target.value)} 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <TextField 
                      label="Price ($)" 
                      type="number" 
                      fullWidth 
                      margin="dense" 
                      value={prodPrice} 
                      onChange={e => setProdPrice(e.target.value)} 
                      required 
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ mt: 1, mb: 1, borderRadius: 2 }}
                    >
                      📁 Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) setProdImg(file);
                        }}
                      />
                    </Button>
                    {prodImg && typeof prodImg === 'object' && (
                      <Typography variant="caption" display="block" sx={{ color: 'success.main' }}>
                        ✅ {prodImg.name}
                      </Typography>
                    )}
                    <FormControl fullWidth margin="dense" required>
                      <InputLabel>Category</InputLabel>
                      <Select value={prodCatId} onChange={e => {
                        const selectedCat = categories.find(c => c.id === e.target.value);
                        setProdCatId(e.target.value);
                        if (selectedCat) setProdDept(selectedCat.targetDept);
                      }} label="Category" sx={{ borderRadius: 2 }}>
                        {categories.map(c => (
                          <MenuItem key={c.id} value={c.id}>{c.icon} {c.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense">
                      <InputLabel>Department</InputLabel>
                      <Select value={prodDept} onChange={e => setProdDept(e.target.value)} label="Department" sx={{ borderRadius: 2 }}>
                        <MenuItem value="barista">☕ Barista</MenuItem>
                        <MenuItem value="kitchen">🍳 Kitchen</MenuItem>
                      </Select>
                    </FormControl>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      fullWidth 
                      startIcon={<Add />} 
                      sx={{ 
                        mt: 2, 
                        py: 1.2, 
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        '&:hover': { boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }
                      }}
                    >
                      Add Product
                    </Button>
                  </form>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>📦 Products</Typography>
                <Grid container spacing={2}>
                  {products.map(prod => (
                    <Grid item xs={12} sm={6} key={prod.id}>
                      <Card variant="outlined" sx={{ display: 'flex', borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ width: 80, height: 80, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img 
                            src={prod.image ? `http://localhost:5000${prod.image}` : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} 
                            alt={prod.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                        <Box sx={{ p: 2, flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{prod.name}</Typography>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                            ${prod.price.toFixed(2)}
                          </Typography>
                          <Chip 
                            label={prod.targetDept === 'barista' ? '☕ Barista' : '🍳 Kitchen'} 
                            size="small" 
                            color={prod.targetDept === 'barista' ? 'info' : 'warning'} 
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                        <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
                          <IconButton color="error" onClick={() => onDeleteProduct(prod.id)}>
                            <Delete />
                          </IconButton>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          )}

          {/* SECURITY TAB */}
          {tabIndex === 3 && (
            <Box sx={{ maxWidth: 500, mx: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>🔐 Cashier Security</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Configure the secret PIN required to access the Cashier Dashboard.
              </Typography>

              {pinSuccess && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
                  ✅ PIN successfully updated!
                </Alert>
              )}

              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#fafafa' }}>
                <form onSubmit={handleUpdatePin}>
                  <TextField 
                    label="Cashier PIN" 
                    type="password"
                    fullWidth 
                    margin="normal" 
                    value={newPin} 
                    onChange={e => setNewPin(e.target.value)} 
                    InputProps={{
                      startAdornment: <Key sx={{ color: 'action.active', mr: 1 }} />
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    required 
                  />
                  <Button 
                    type="submit" 
                    variant="contained" 
                    fullWidth 
                    sx={{ 
                      mt: 2, 
                      py: 1.2, 
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      '&:hover': { boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' }
                    }}
                  >
                    Save PIN
                  </Button>
                </form>
              </Paper>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default AdminDashboard;