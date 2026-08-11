import React, { useState } from 'react';
import { 
  Box, Container, Typography, Paper, Tabs, Tab, TextField, 
  Button, Grid, Card, CardContent, IconButton, List, ListItem, 
  ListItemText, ListItemSecondaryAction, Select, MenuItem, 
  FormControl, InputLabel, Divider, Chip, Alert 
} from '@mui/material';
import { Delete, Add, PersonAdd, Category, Fastfood, Security, Key } from '@mui/icons-material';

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

  // New Waiter Form State
  const [waiterName, setWaiterName] = useState('');
  const [waiterCode, setWaiterCode] = useState('');

  // New Category Form State
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('🍽️');
  const [catDept, setCatDept] = useState('kitchen');

  // New Product Form State
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImg, setProdImg] = useState('');
  const [prodCatId, setProdCatId] = useState('');
  const [prodDept, setProdDept] = useState('kitchen');

  // Security Form State
  const [newPin, setNewPin] = useState(cashierPin);
  const [pinSuccess, setPinSuccess] = useState(false);

  // Handlers
  const handleCreateWaiter = (e) => {
    e.preventDefault();
    if (!waiterName || !waiterCode) return alert('Enter waiter name and code');
    onAddWaiter({ name: waiterName, code: waiterCode, isActive: true });
    setWaiterName('');
    setWaiterCode('');
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
    onAddProduct({
      name: prodName,
      description: prodDesc,
      price: parseFloat(prodPrice),
      image: prodImg || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      categoryId: parseInt(prodCatId),
      targetDept: prodDept
    });
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdImg('');
  };

  const handleUpdatePin = (e) => {
    e.preventDefault();
    if (!newPin || newPin.trim().length === 0) return alert('Enter a valid PIN');
    onChangeCashierPin(newPin.trim());
    setPinSuccess(true);
    setTimeout(() => setPinSuccess(false), 4000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          ⚙️ Admin Management Portal
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Manage cafe waiters, menu categories, product items, and Cashier security PINs.
        </Typography>

        <Tabs 
          value={tabIndex} 
          onChange={(e, val) => setTabIndex(val)} 
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab icon={<PersonAdd />} label={`Waiters Roster (${waiters.length})`} iconPosition="start" />
          <Tab icon={<Category />} label={`Categories (${categories.length})`} iconPosition="start" />
          <Tab icon={<Fastfood />} label={`Menu Products (${products.length})`} iconPosition="start" />
          <Tab icon={<Security />} label="Security & Passcode" iconPosition="start" />
        </Tabs>

        {/* TAB 0: WAITERS MANAGEMENT */}
        {tabIndex === 0 && (
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>➕ Add New Waiter</Typography>
                <form onSubmit={handleCreateWaiter}>
                  <TextField 
                    label="Waiter Full Name" 
                    fullWidth 
                    margin="normal" 
                    value={waiterName} 
                    onChange={e => setWaiterName(e.target.value)} 
                    placeholder="e.g. Michael Scott" 
                    required 
                  />
                  <TextField 
                    label="Waiter Employee Code / ID" 
                    fullWidth 
                    margin="normal" 
                    value={waiterCode} 
                    onChange={e => setWaiterCode(e.target.value)} 
                    placeholder="e.g. W-105" 
                    required 
                  />
                  <Button type="submit" variant="contained" color="primary" fullWidth startIcon={<Add />} sx={{ mt: 2, py: 1.2 }}>
                    Add Waiter to Roster
                  </Button>
                </form>
              </Paper>
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>📋 Active Waiters Roster</Typography>
              <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <List>
                  {waiters.map(w => (
                    <React.Fragment key={w.id}>
                      <ListItem>
                        <ListItemText 
                          primary={<Typography sx={{ fontWeight: 'bold' }}>👤 {w.name}</Typography>}
                          secondary={`Employee ID: ${w.code}`}
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

        {/* TAB 1: CATEGORIES MANAGEMENT */}
        {tabIndex === 1 && (
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>➕ Add Category</Typography>
                <form onSubmit={handleCreateCategory}>
                  <TextField 
                    label="Category Name" 
                    fullWidth 
                    margin="normal" 
                    value={catName} 
                    onChange={e => setCatName(e.target.value)} 
                    placeholder="e.g. Hot Drinks, Pizza, Desserts" 
                    required 
                  />
                  <TextField 
                    label="Category Icon (Emoji)" 
                    fullWidth 
                    margin="normal" 
                    value={catIcon} 
                    onChange={e => setCatIcon(e.target.value)} 
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Destination Department</InputLabel>
                    <Select value={catDept} onChange={e => setCatDept(e.target.value)} label="Destination Department">
                      <MenuItem value="barista">Barista (Drinks)</MenuItem>
                      <MenuItem value="kitchen">Kitchen Chef (Food)</MenuItem>
                    </Select>
                  </FormControl>
                  <Button type="submit" variant="contained" color="primary" fullWidth startIcon={<Add />} sx={{ mt: 2, py: 1.2 }}>
                    Create Category
                  </Button>
                </form>
              </Paper>
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>📁 Category List</Typography>
              <Grid container spacing={2}>
                {categories.map(cat => (
                  <Grid item xs={12} sm={6} key={cat.id}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6">{cat.icon} {cat.name}</Typography>
                          <Chip 
                            label={`Sends to: ${cat.targetDept === 'barista' ? '☕ Barista' : '🍳 Kitchen'}`} 
                            size="small" 
                            color={cat.targetDept === 'barista' ? 'info' : 'warning'} 
                            sx={{ mt: 1 }}
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

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {tabIndex === 2 && (
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>➕ Add Menu Item</Typography>
                <form onSubmit={handleCreateProduct}>
                  <TextField 
                    label="Item Name" 
                    fullWidth 
                    margin="dense" 
                    value={prodName} 
                    onChange={e => setProdName(e.target.value)} 
                    required 
                  />
                  <TextField 
                    label="Description" 
                    fullWidth 
                    margin="dense" 
                    multiline 
                    rows={2} 
                    value={prodDesc} 
                    onChange={e => setProdDesc(e.target.value)} 
                  />
                  <TextField 
                    label="Price ($)" 
                    type="number" 
                    fullWidth 
                    margin="dense" 
                    value={prodPrice} 
                    onChange={e => setProdPrice(e.target.value)} 
                    required 
                  />
                  <TextField 
                    label="Image URL" 
                    fullWidth 
                    margin="dense" 
                    value={prodImg} 
                    onChange={e => setProdImg(e.target.value)} 
                    placeholder="https://..." 
                  />
                  <FormControl fullWidth margin="dense" required>
                    <InputLabel>Category</InputLabel>
                    <Select value={prodCatId} onChange={e => {
                      const selectedCat = categories.find(c => c.id === e.target.value);
                      setProdCatId(e.target.value);
                      if (selectedCat) setProdDept(selectedCat.targetDept);
                    }} label="Category">
                      {categories.map(c => (
                        <MenuItem key={c.id} value={c.id}>{c.icon} {c.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Department</InputLabel>
                    <Select value={prodDept} onChange={e => setProdDept(e.target.value)} label="Department">
                      <MenuItem value="barista">Barista (Drinks)</MenuItem>
                      <MenuItem value="kitchen">Kitchen Chef (Food)</MenuItem>
                    </Select>
                  </FormControl>
                  <Button type="submit" variant="contained" color="success" fullWidth startIcon={<Add />} sx={{ mt: 2, py: 1.2 }}>
                    Add Product
                  </Button>
                </form>
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>☕ Menu Items List</Typography>
              <Grid container spacing={2}>
                {products.map(prod => (
                  <Grid item xs={12} sm={6} key={prod.id}>
                    <Card variant="outlined" sx={{ display: 'flex', borderRadius: 2 }}>
                      <Box sx={{ p: 2, flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{prod.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{prod.description}</Typography>
                        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>${prod.price.toFixed(2)}</Typography>
                        <Chip 
                          label={prod.targetDept === 'barista' ? '☕ Barista' : '🍳 Kitchen'} 
                          size="small" 
                          color={prod.targetDept === 'barista' ? 'info' : 'warning'} 
                          sx={{ mt: 1 }}
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

        {/* TAB 3: SECURITY & CASHIER PIN */}
        {tabIndex === 3 && (
          <Box sx={{ maxWidth: 500 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>🔐 Cashier Security Configuration</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Configure the secret PIN required to access the Cashier Dashboard and approve payment orders.
            </Typography>

            {pinSuccess && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                ✅ Cashier PIN successfully updated!
              </Alert>
            )}

            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <form onSubmit={handleUpdatePin}>
                <TextField 
                  label="Current / New Cashier PIN" 
                  type="password"
                  fullWidth 
                  margin="normal" 
                  value={newPin} 
                  onChange={e => setNewPin(e.target.value)} 
                  InputProps={{
                    startAdornment: <Key sx={{ color: 'action.active', mr: 1 }} />
                  }}
                  required 
                />
                <Button type="submit" variant="contained" color="warning" fullWidth sx={{ mt: 2, py: 1.2, fontWeight: 'bold' }}>
                  Save New Cashier PIN
                </Button>
              </form>
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default AdminDashboard;
