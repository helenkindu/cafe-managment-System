import React, { useState } from 'react';
import {
  Container, Typography, Paper, Box, Grid, Card, CardContent,
  Chip, Tabs, Tab, Alert
} from '@mui/material';
import { Inventory } from '@mui/icons-material';

function MenuDisplay({ categories, products }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Get all categories
  const allCategories = categories || [];

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter(p => p.categoryId === selectedCategory)
    : products;

  // Group products by category for display
  const productsByCategory = {};
  filteredProducts?.forEach(product => {
    const catId = product.categoryId;
    if (!productsByCategory[catId]) {
      const category = allCategories.find(c => c.id === catId);
      productsByCategory[catId] = {
        category: category,
        products: []
      };
    }
    productsByCategory[catId].products.push(product);
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{
        p: 4,
        borderRadius: 3,
        boxShadow: 4,
        mb: 4,
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#fff',
        textAlign: 'center'
      }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
          🍽️ Our Menu
        </Typography>
        <Typography variant="h6" sx={{ color: '#94a3b8' }}>
          Explore our delicious offerings
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
          💡 Double-click the cafe logo to login as staff
        </Typography>
      </Paper>

      {/* Category Tabs */}
      {allCategories.length > 0 && (
        <Box sx={{ mb: 3, overflowX: 'auto' }}>
          <Tabs
            value={selectedCategory || 'all'}
            onChange={(e, val) => setSelectedCategory(val === 'all' ? null : val)}
            sx={{
              bgcolor: '#fff',
              borderRadius: 2,
              p: 0.5,
              boxShadow: 1,
              '& .MuiTab-root': { fontWeight: 'bold', textTransform: 'none', borderRadius: 1.5 }
            }}
          >
            <Tab
              value="all"
              label="📋 All Items"
              icon={<Inventory />}
              iconPosition="start"
            />
            {allCategories.map(cat => (
              <Tab
                key={cat.id}
                value={cat.id}
                label={`${cat.icon} ${cat.name}`}
              />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Menu Items */}
      {filteredProducts?.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No menu items available at the moment.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {Object.values(productsByCategory).map(({ category, products }) => (
            <Grid item xs={12} key={category?.id || 'uncategorized'}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                {category?.icon || '🍽️'} {category?.name || 'Items'}
                <Chip label={`${products.length} items`} size="small" />
              </Typography>
              <Grid container spacing={2}>
                {products.map(product => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Card
                      elevation={2}
                      sx={{
                        borderRadius: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                      }}
                    >
                      <CardContent sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {product.name}
                        </Typography>
                        {product.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {product.description}
                          </Typography>
                        )}
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#065f46', mt: 1 }}>
                          ${product.price.toFixed(2)}
                        </Typography>
                        <Chip
                          label={product.categoryInfo?.targetDept === 'kitchen' ? '🍳 Kitchen' : '☕ Barista'}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default MenuDisplay;