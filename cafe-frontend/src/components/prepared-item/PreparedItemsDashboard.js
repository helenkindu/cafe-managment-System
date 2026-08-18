import React, { useState } from 'react';
import {
  Container, Typography, Paper, Box, Grid, Card, CardContent,
  Button, Chip, Alert, Tabs, Tab, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Snackbar
} from '@mui/material';
import {
  Inventory, Warning, Add, Edit, Delete, Remove
} from '@mui/icons-material';

function PreparedItemsDashboard({
  items,
  categories,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onUpdateQuantity,
  onSeedItems
}) {
  const [tabView, setTabView] = useState('available');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    price: 0,
    quantity: 0,
    unit: 'piece',
    isAvailable: true
  });

  const availableItems = items.filter(item => item.isAvailable && item.quantity > 0);
  const lowStockItems = items.filter(item => item.isAvailable && item.quantity <= 5 && item.quantity > 0);
  const displayItems = tabView === 'available' ? availableItems : lowStockItems;

  const getCategory = (categoryId) => categories.find(c => c.id === categoryId);

  const getCategoryName = (item) => {
    const cat = getCategory(item.categoryId);
    return cat ? cat.name : 'Uncategorized';
  };

  const getCategoryEmoji = (item) => {
    const cat = getCategory(item.categoryId);
    const emojis = {
      'Bread': '🍞', 'Cake': '🎂', 'Pastry': '🥐', 'Snack': '🍿',
      'Drink': '🥤', 'Dessert': '🍰', 'Pizza': '🍕', 'Sandwich': '🥪'
    };
    return emojis[cat?.name] || '🍽️';
  };

  const getCategoryColor = (item) => {
    const cat = getCategory(item.categoryId);
    const colors = {
      'Bread': '#f59e0b', 'Cake': '#ec4899', 'Pastry': '#f97316',
      'Snack': '#8b5cf6', 'Drink': '#3b82f6', 'Dessert': '#ef4444',
      'Pizza': '#ef4444', 'Sandwich': '#22c55e'
    };
    return colors[cat?.name] || '#6366f1';
  };

  const getDepartment = (item) => {
    const cat = getCategory(item.categoryId);
    if (!cat) return '📍 Unknown';
    return cat.targetDept === 'kitchen' ? '🍳 Kitchen' : '☕ Barista';
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        categoryId: item.categoryId || '',
        description: item.description || '',
        price: item.price,
        quantity: item.quantity,
        unit: item.unit || 'piece',
        isAvailable: item.isAvailable
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        description: '',
        price: 0,
        quantity: 0,
        unit: 'piece',
        isAvailable: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveItem = async () => {
    try {
      if (editingItem) {
        await onUpdateItem(editingItem.id, formData);
        setSnackbar({ open: true, message: 'Item updated successfully!', severity: 'success' });
      } else {
        await onAddItem(formData);
        setSnackbar({ open: true, message: 'Item added successfully!', severity: 'success' });
      }
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving item', severity: 'error' });
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await onDeleteItem(id);
        setSnackbar({ open: true, message: 'Item deleted!', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Error deleting item', severity: 'error' });
      }
    }
  };

  const handleQuantityChange = async (id, action) => {
    try {
      await onUpdateQuantity(id, 1, action);
      setSnackbar({ open: true, message: `Quantity ${action === 'add' ? 'increased' : 'decreased'}!`, severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating quantity', severity: 'error' });
    }
  };

  const handleSeed = async () => {
    try {
      await onSeedItems();
      setSnackbar({ open: true, message: 'Sample items seeded!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error seeding data', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: 4,
        mb: 4,
        background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
        color: '#fff'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              🥖 Prepared Items
            </Typography>
            <Typography sx={{ color: '#a7f3d0' }}>
              Manage breads, cakes, pastries, snacks, and drinks
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              sx={{ bgcolor: '#fff', color: '#065f46', '&:hover': { bgcolor: '#f0fdf4' } }}
              onClick={handleSeed}
            >
              Seed Sample
            </Button>
            <Button
              variant="contained"
              sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
              onClick={() => handleOpenDialog()}
              startIcon={<Add />}
            >
              Add Item
            </Button>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, bgcolor: '#f0fdf4', border: '1px solid #86efac' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#065f46' }}>{items.length}</Typography>
              <Typography variant="body2" color="text.secondary">Total Items</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, bgcolor: '#eff6ff', border: '1px solid #93c5fd' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e40af' }}>{availableItems.length}</Typography>
              <Typography variant="body2" color="text.secondary">In Stock</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, bgcolor: '#fef3c7', border: '1px solid #fcd34d' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#92400e' }}>{lowStockItems.length}</Typography>
              <Typography variant="body2" color="text.secondary">Low Stock (≤5)</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, bgcolor: '#fef2f2', border: '1px solid #fca5a5' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#991b1b' }}>
                {items.filter(i => i.quantity === 0).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Out of Stock</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabView}
          onChange={(e, val) => setTabView(val)}
          sx={{
            bgcolor: '#fff',
            borderRadius: 2,
            p: 0.5,
            boxShadow: 1,
            '& .MuiTab-root': { fontWeight: 'bold', textTransform: 'none', borderRadius: 1.5 }
          }}
        >
          <Tab
            value="available"
            label={`📦 Available (${availableItems.length})`}
            icon={<Inventory />}
            iconPosition="start"
          />
          <Tab
            value="lowstock"
            label={`⚠️ Low Stock (${lowStockItems.length})`}
            icon={<Warning />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {displayItems.length === 0 ? (
        <Alert severity={tabView === 'available' ? 'info' : 'success'} sx={{ borderRadius: 2 }}>
          {tabView === 'available'
            ? 'No prepared items. Click "Add Item" or "Seed Sample" to get started!'
            : '🎉 No low stock items!'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {displayItems.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  borderTop: `4px solid ${getCategoryColor(item)}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {getCategoryEmoji(item)} {item.name}
                      </Typography>
                      <Chip
                        label={getCategoryName(item)}
                        size="small"
                        sx={{
                          bgcolor: getCategoryColor(item) + '20',
                          color: getCategoryColor(item),
                          fontWeight: 'bold',
                          mt: 0.5
                        }}
                      />
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(item)} sx={{ color: '#6366f1' }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteItem(item.id)} sx={{ color: '#ef4444' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {item.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 1 }}>
                      {item.description}
                    </Typography>
                  )}

                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#065f46', my: 1 }}>
                    ${item.price.toFixed(2)} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#6b7280' }}>/ {item.unit}</span>
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, 'remove')}
                        disabled={item.quantity <= 0}
                        sx={{ bgcolor: '#f3f4f6' }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: '40px', textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, 'add')}
                        sx={{ bgcolor: '#f3f4f6' }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>
                    <Chip label={getDepartment(item)} size="small" variant="outlined" />
                  </Box>

                  {item.quantity <= 5 && item.quantity > 0 && (
                    <Chip icon={<Warning />} label={`Low Stock: ${item.quantity} left`} color="warning" size="small" sx={{ mt: 1 }} />
                  )}
                  {item.quantity === 0 && (
                    <Chip label="Out of Stock" color="error" size="small" sx={{ mt: 1 }} />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? '✏️ Edit Prepared Item' : '➕ Add New Prepared Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Item Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleFormChange}
                  label="Category"
                  required
                >
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name} ({cat.targetDept})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveItem} variant="contained" color="primary">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default PreparedItemsDashboard;