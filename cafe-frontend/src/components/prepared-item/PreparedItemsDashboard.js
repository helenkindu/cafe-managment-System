import React, { useState } from 'react';
import { 
  Container, Typography, Paper, Box, Grid, Card, CardContent, 
  Alert, Tabs, Tab, Chip 
} from '@mui/material';
import { Inventory, Warning } from '@mui/icons-material';

function PreparedItemsDashboard({ items }) {
  const [tabView, setTabView] = useState('available');

  // Filter items
  const availableItems = items.filter(item => item.isAvailable && item.quantity > 0);
  const lowStockItems = items.filter(item => item.isAvailable && item.quantity <= 5 && item.quantity > 0);
  const displayItems = tabView === 'available' ? availableItems : lowStockItems;

  // Get category name - handles both old and new data structure
  const getCategoryName = (item) => {
    // If item has categoryInfo with name, use it
    if (item.categoryInfo && item.categoryInfo.name) {
      return item.categoryInfo.name;
    }
    // If item has category field (old data), use it
    if (item.category) {
      return item.category.charAt(0).toUpperCase() + item.category.slice(1);
    }
    return 'Uncategorized';
  };

  // Get category emoji
  const getCategoryEmoji = (item) => {
    const categoryName = getCategoryName(item);
    const emojis = {
      'Bread': '🍞',
      'Cake': '🎂',
      'Pastry': '🥐',
      'Snack': '🍿',
      'Drink': '🥤',
      'Dessert': '🍰',
      'Pizza': '🍕',
      'Sandwich': '🥪'
    };
    return emojis[categoryName] || '🍽️';
  };

  // Get category color
  const getCategoryColor = (item) => {
    const categoryName = getCategoryName(item);
    const colors = {
      'Bread': '#f59e0b',
      'Cake': '#ec4899',
      'Pastry': '#f97316',
      'Snack': '#8b5cf6',
      'Drink': '#3b82f6',
      'Dessert': '#ef4444',
      'Pizza': '#ef4444',
      'Sandwich': '#22c55e'
    };
    return colors[categoryName] || '#6366f1';
  };

  // Get department - handles both old and new data
  const getDepartment = (item) => {
    // If item has categoryInfo with targetDept, use it
    if (item.categoryInfo && item.categoryInfo.targetDept) {
      return item.categoryInfo.targetDept === 'kitchen' ? '🍳 Kitchen' : '☕ Barista';
    }
    // If item has targetDept field (old data), use it
    if (item.targetDept) {
      return item.targetDept === 'kitchen' ? '🍳 Kitchen' : '☕ Barista';
    }
    return '📍 Unknown';
  };

  console.log('Prepared Items:', items); // Debug: Check what's coming from API

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
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          🥖 Prepared Items - Ready to Serve
        </Typography>
        <Typography sx={{ color: '#a7f3d0' }}>
          Breads, cakes, pastries, snacks, and drinks already prepared and ready for customers
        </Typography>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, bgcolor: '#f0fdf4', border: '1px solid #86efac' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#065f46' }}>{items.length}</Typography>
              <Typography variant="body2" color="text.secondary">Total Items</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, bgcolor: '#eff6ff', border: '1px solid #93c5fd' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e40af' }}>{availableItems.length}</Typography>
              <Typography variant="body2" color="text.secondary">Available in Stock</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, bgcolor: '#fef3c7', border: '1px solid #fcd34d' }}>
            <CardContent>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#92400e' }}>{lowStockItems.length}</Typography>
              <Typography variant="body2" color="text.secondary">Low Stock (≤5)</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
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
            label={`📦 Available Items (${availableItems.length})`} 
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
            ? 'No prepared items available. Click "Seed Sample Data" or add items!' 
            : '🎉 No low stock items! All items are well stocked.'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {displayItems.map(item => {
            const categoryName = getCategoryName(item);
            const department = getDepartment(item);
            
            return (
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {getCategoryEmoji(item)} {item.name}
                        </Typography>
                        <Chip 
                          label={categoryName} 
                          size="small" 
                          sx={{ 
                            bgcolor: getCategoryColor(item) + '20', 
                            color: getCategoryColor(item),
                            fontWeight: 'bold',
                            mt: 0.5
                          }} 
                        />
                      </Box>
                      <Chip 
                        label={department} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>

                    {item.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {item.description}
                      </Typography>
                    )}

                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#065f46', my: 1 }}>
                      ${item.price.toFixed(2)} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#6b7280' }}>/ {item.unit}</span>
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Stock: <strong>{item.quantity}</strong> {item.unit}s
                      </Typography>
                      {item.quantity <= 5 && item.quantity > 0 && (
                        <Chip 
                          icon={<Warning />} 
                          label={`Low: ${item.quantity} left`} 
                          color="warning" 
                          size="small" 
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                      {item.quantity === 0 && (
                        <Chip 
                          label="Out of Stock" 
                          color="error" 
                          size="small" 
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}

export default PreparedItemsDashboard;