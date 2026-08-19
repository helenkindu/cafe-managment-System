import React, { useState } from 'react';
import {
  Container, Typography, Paper, Box, Grid, Card, CardContent,
  CardMedia, Chip, Tabs, Tab, Alert, Grow, Fade, IconButton
} from '@mui/material';
import { ArrowBack, Inventory, Restaurant, LocalCafe } from '@mui/icons-material';

function MenuOnlyPage({ categories, products, onBack }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const allCategories = categories || [];

  const filteredProducts = selectedCategory
    ? products.filter(p => p.categoryId === selectedCategory)
    : products;

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

  const getImageUrl = (image) => {
    if (!image) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
    if (image.startsWith('http')) return image;
    return `http://localhost:5000${image}`;
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      pt: 2,
      pb: 6
    }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header with Back Button */}
        <Fade in timeout={500}>
          <Paper elevation={0} sx={{
            p: 3,
            mb: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                  onClick={onBack}
                  sx={{
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <ArrowBack />
                </IconButton>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    🍽️ Our Menu
                  </Typography>
                  <Typography sx={{ opacity: 0.8 }}>
                    Explore our delicious offerings
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Chip
              label={`${products?.length || 0} items`}
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
              }}
            />
            {/* Decorative circles */}
            <Box sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.05)',
            }} />
            <Box sx={{
              position: 'absolute',
              bottom: -80,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.03)',
            }} />
          </Paper>
        </Fade>

        {/* Category Tabs */}
        {allCategories.length > 0 && (
          <Fade in timeout={700}>
            <Paper elevation={0} sx={{
              p: 2,
              mb: 3,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              overflowX: 'auto'
            }}>
              <Tabs
                value={selectedCategory || 'all'}
                onChange={(e, val) => setSelectedCategory(val === 'all' ? null : val)}
                sx={{
                  '& .MuiTab-root': {
                    fontWeight: 'bold',
                    textTransform: 'none',
                    borderRadius: 2,
                    fontSize: '0.9rem',
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
            </Paper>
          </Fade>
        )}

        {/* Menu Items - WITHOUT Add to Order */}
        {filteredProducts?.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No menu items available at the moment.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {Object.values(productsByCategory).map(({ category, products }) => (
              <Grid item xs={12} key={category?.id || 'uncategorized'}>
                <Typography variant="h5" sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: '#1a1a2e'
                }}>
                  {category?.icon || '🍽️'} {category?.name || 'Items'}
                  <Chip label={`${products.length} items`} size="small" sx={{ ml: 1 }} />
                </Typography>
                <Grid container spacing={2}>
                  {products.map((product, index) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
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
                          <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 140,
                            width: '100%',
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
                            p: 1,
                            flexShrink: 0
                          }}>
                            <CardMedia
                              component="img"
                              image={getImageUrl(product.image)}
                              alt={product.name}
                              sx={{
                                height: '100%',
                                width: 'auto',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                transition: 'transform 0.3s ease',
                                '&:hover': { transform: 'scale(1.05)' }
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
                                color: '#1a1a2e',
                                mb: 0.5
                              }}>
                                {product.name}
                              </Typography>
                              {product.description && (
                                <Typography variant="body2" color="text.secondary" sx={{
                                  mb: 1.5,
                                  fontSize: '0.85rem',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  lineHeight: 1.5
                                }}>
                                  {product.description}
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
                                ${product.price.toFixed(2)}
                              </Typography>
                              <Chip
                                label={product.categoryInfo?.targetDept === 'kitchen' ? '🍳 Kitchen' : '☕ Barista'}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontWeight: 'bold',
                                  borderColor: product.categoryInfo?.targetDept === 'kitchen' ? '#f59e0b' : '#3b82f6',
                                  color: product.categoryInfo?.targetDept === 'kitchen' ? '#f59e0b' : '#3b82f6'
                                }}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grow>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default MenuOnlyPage;