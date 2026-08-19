import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Button, Grid, Paper, Avatar,
  IconButton, Divider, useTheme, useMediaQuery, Fade, Slide
} from '@mui/material';
import {
  Coffee, Restaurant, LocalCafe, EmojiEvents,
  LocationOn, Phone, Email, Facebook, Instagram, Twitter,
  ArrowForward, Star, People, AccessTime, RestaurantMenu,
  WhatsApp, YouTube, Pinterest
} from '@mui/icons-material';

function LandingPage({ onViewMenu }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Animated particles
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generateParticles = () => {
      const emojis = ['☕', '🍵', '🥐', '🍰', '🥪', '🍩', '🧁', '🍪', '🌿', '✨'];
      const newParticles = [];
      for (let i = 0; i < 25; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 25 + 10,
          duration: Math.random() * 12 + 6,
          delay: Math.random() * 6,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          opacity: Math.random() * 0.15 + 0.05
        });
      }
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

  // Stats
  const stats = [
    { icon: <Coffee sx={{ fontSize: 32 }} />, number: '50+', label: 'Coffee Varieties' },
    { icon: <Restaurant sx={{ fontSize: 32 }} />, number: '100+', label: 'Menu Items' },
    { icon: <People sx={{ fontSize: 32 }} />, number: '10k+', label: 'Happy Customers' },
    { icon: <EmojiEvents sx={{ fontSize: 32 }} />, number: '15+', label: 'Awards Won' },
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Regular Customer',
      text: 'The best coffee in town! The atmosphere is perfect for working or catching up with friends.',
      avatar: 'S',
      rating: 5,
      color: '#667eea'
    },
    {
      name: 'Michael Chen',
      role: 'Food Critic',
      text: "Artisan Cafe serves the most authentic pastries I've had outside of France. Absolutely delightful!",
      avatar: 'M',
      rating: 5,
      color: '#f59e0b'
    },
    {
      name: 'Emily Davis',
      role: 'Local Artist',
      text: 'I love the cozy ambiance and the friendly staff. My go-to place for creative inspiration.',
      avatar: 'E',
      rating: 5,
      color: '#10b981'
    },
  ];

  // Features
  const features = [
    { icon: '☕', title: 'Premium Coffee', desc: 'Sourced from the finest beans worldwide' },
    { icon: '🥐', title: 'Fresh Pastries', desc: 'Baked fresh daily with love and care' },
    { icon: '🌿', title: 'Cozy Ambiance', desc: 'Warm and inviting atmosphere for everyone' },
    { icon: '📶', title: 'Free WiFi', desc: 'Stay connected while you enjoy your coffee' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#faf8f5' }}>
      {/* ========== HERO SECTION ========== */}
      <Box sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #1a0e08 0%, #2c1810 25%, #4a2c1a 50%, #6b3f2a 75%, #8b5e3c 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 30%, rgba(255,215,0,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,215,0,0.05) 0%, transparent 50%)',
        }
      }}>
        {/* Animated Background Gradients */}
        <Box sx={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '70%',
          height: '100%',
          background: 'radial-gradient(ellipse, rgba(255,215,0,0.06) 0%, transparent 70%)',
          animation: 'pulseGradient 8s ease-in-out infinite',
          '@keyframes pulseGradient': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
            '50%': { transform: 'scale(1.2)', opacity: 1 },
          }
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '50%',
          height: '60%',
          background: 'radial-gradient(ellipse, rgba(255,215,0,0.04) 0%, transparent 70%)',
          animation: 'pulseGradient 10s ease-in-out infinite reverse',
          '@keyframes pulseGradient': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
            '50%': { transform: 'scale(1.3)', opacity: 1 },
          }
        }} />

        {/* Floating Particles */}
        {particles.map((p) => (
          <Box
            key={p.id}
            sx={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: `${p.size}px`,
              opacity: p.opacity,
              animation: `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite`,
              '@keyframes floatParticle': {
                '0%, 100%': { transform: 'translateY(0px) rotate(0deg) scale(1)' },
                '25%': { transform: 'translateY(-30px) rotate(10deg) scale(1.1)' },
                '75%': { transform: 'translateY(30px) rotate(-10deg) scale(0.9)' },
              },
              pointerEvents: 'none',
              zIndex: 0
            }}
          >
            {p.emoji}
          </Box>
        ))}

        {/* Decorative Coffee Cup with Steam */}
        <Box sx={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          opacity: 0.08,
          fontSize: 200,
          zIndex: 0,
          animation: 'floatSteam 6s ease-in-out infinite',
          '@keyframes floatSteam': {
            '0%, 100%': { transform: 'translateY(0px) rotate(-5deg)' },
            '50%': { transform: 'translateY(-15px) rotate(5deg)' },
          }
        }}>
          ☕
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} lg={7}>
              <Fade in timeout={1000}>
                <Box>
                  {/* Premium Badge */}
                  <Paper sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 3,
                    py: 1,
                    borderRadius: 50,
                    bgcolor: 'rgba(255,215,0,0.12)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,215,0,0.15)',
                    mb: 4,
                  }}>
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#ffd700',
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                        '50%': { opacity: 0.5, transform: 'scale(1.5)' },
                      }
                    }} />
                    <Typography sx={{ color: '#ffd700', fontWeight: 600, fontSize: '0.85rem', letterSpacing: 1 }}>
                      PREMIUM QUALITY • EST. 2024
                    </Typography>
                  </Paper>

                  {/* Main Title with Gradient Text */}
                  <Typography variant={isMobile ? 'h2' : 'h1'} sx={{
                    fontWeight: 900,
                    color: '#fff',
                    mb: 2,
                    fontSize: isMobile ? '2.8rem' : isTablet ? '4rem' : '5rem',
                    lineHeight: 1.05,
                    letterSpacing: '-0.03em',
                    textShadow: '0 8px 40px rgba(0,0,0,0.3)'
                  }}>
                    Artisan
                    <Box component="span" sx={{
                      display: 'block',
                      background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 50%, #d97706 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      Cafe
                    </Box>
                  </Typography>

                  <Typography variant="h6" sx={{
                    color: 'rgba(255,255,255,0.8)',
                    mb: 4,
                    maxWidth: 550,
                    fontSize: '1.15rem',
                    lineHeight: 1.9,
                    fontWeight: 300,
                    letterSpacing: 0.3
                  }}>
                    Where every cup tells a story. Experience the finest coffee, 
                    freshly baked pastries, and a warm atmosphere that feels like home.
                  </Typography>

                  {/* CTA Buttons */}
                  <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', mb: 5 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={onViewMenu}
                      endIcon={<ArrowForward sx={{ transition: 'transform 0.3s', '&:hover': { transform: 'translateX(5px)' } }} />}
                      sx={{
                        py: 1.8,
                        px: 5,
                        borderRadius: 50,
                        background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 50%, #d97706 100%)',
                        color: '#1a1a2e',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        boxShadow: '0 8px 30px rgba(255,215,0,0.35)',
                        '&:hover': {
                          boxShadow: '0 12px 50px rgba(255,215,0,0.5)',
                          transform: 'translateY(-3px)',
                          background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 60%, #d97706 100%)',
                        },
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                      }}
                    >
                      Explore Our Menu
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        py: 1.8,
                        px: 4,
                        borderRadius: 50,
                        borderColor: 'rgba(255,255,255,0.25)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '1rem',
                        backdropFilter: 'blur(10px)',
                        bgcolor: 'rgba(255,255,255,0.05)',
                        '&:hover': {
                          borderColor: '#ffd700',
                          backgroundColor: 'rgba(255,215,0,0.1)',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 30px rgba(255,215,0,0.15)'
                        },
                        transition: 'all 0.4s ease'
                      }}
                    >
                      📞 Call Us
                    </Button>
                  </Box>

                  {/* Quick Info */}
                  <Box sx={{ display: 'flex', gap: { xs: 3, sm: 5 }, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        p: 1,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,215,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <AccessTime sx={{ color: '#ffd700', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                          Hours
                        </Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                          7AM - 10PM
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        p: 1,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,215,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <LocationOn sx={{ color: '#ffd700', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                          Location
                        </Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                          123 Coffee St, City
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        p: 1,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,215,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Star sx={{ color: '#ffd700', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                          Rating
                        </Typography>
                        <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                          4.9 ★ (1.2k reviews)
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            </Grid>

            {/* Hero Image - Decorative */}
            <Grid item xs={12} lg={5} sx={{ display: { xs: 'none', lg: 'block' } }}>
              <Fade in timeout={1200}>
                <Box sx={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  animation: 'floatCup 8s ease-in-out infinite',
                  '@keyframes floatCup': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
                    '50%': { transform: 'translateY(-20px) rotate(2deg)' },
                  }
                }}>
                  {/* Glowing ring */}
                  <Box sx={{
                    position: 'absolute',
                    width: 380,
                    height: 380,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.02) 60%, transparent 70%)',
                    animation: 'glowRing 4s ease-in-out infinite',
                    '@keyframes glowRing': {
                      '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
                      '50%': { transform: 'scale(1.1)', opacity: 1 },
                    }
                  }} />

                  {/* Main coffee cup */}
                  <Paper sx={{
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 30% 30%, rgba(255,215,0,0.15) 0%, rgba(255,215,0,0.05) 60%, transparent 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255,215,0,0.08)',
                    backdropFilter: 'blur(20px)',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      right: 10,
                      bottom: 10,
                      borderRadius: '50%',
                      border: '1px solid rgba(255,215,0,0.05)',
                    }
                  }}>
                    <Typography sx={{
                      fontSize: 100,
                      filter: 'drop-shadow(0 8px 30px rgba(255,215,0,0.2))'
                    }}>
                      ☕
                    </Typography>

                    {/* Steam effect */}
                    {[...Array(3)].map((_, i) => (
                      <Box
                        key={i}
                        sx={{
                          position: 'absolute',
                          top: -10 - i * 15,
                          left: `${30 + i * 20}%`,
                          fontSize: `${20 - i * 4}px`,
                          opacity: 0.15 - i * 0.04,
                          animation: `steam ${2 + i}s ease-in-out ${i * 0.4}s infinite`,
                          '@keyframes steam': {
                            '0%': { transform: 'translateY(0px) scale(1)', opacity: 0.15 },
                            '50%': { transform: 'translateY(-30px) scale(1.5)', opacity: 0.3 },
                            '100%': { transform: 'translateY(-60px) scale(0.8)', opacity: 0 },
                          }
                        }}
                      >
                        ☁️
                      </Box>
                    ))}
                  </Paper>

                  {/* Floating coffee beans */}
                  {['☕', '🍵', '🥐', '🌿'].map((emoji, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: 'absolute',
                        fontSize: 30,
                        opacity: 0.2,
                        animation: `floatBean ${4 + i * 2}s ease-in-out ${i * 0.6}s infinite`,
                        '@keyframes floatBean': {
                          '0%, 100%': { transform: 'translateY(0px) rotate(0deg) scale(1)' },
                          '25%': { transform: 'translateY(-25px) rotate(15deg) scale(1.1)' },
                          '75%': { transform: 'translateY(15px) rotate(-15deg) scale(0.9)' },
                        }
                      }}
                      style={{
                        top: `${15 + i * 20}%`,
                        left: `${-10 + i * 30}%`,
                      }}
                    >
                      {emoji}
                    </Box>
                  ))}
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ========== STATS SECTION ========== */}
      <Box sx={{ position: 'relative', mt: -4, zIndex: 2 }}>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Slide direction="up" in timeout={600 + index * 100}>
                  <Paper sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 16px 60px rgba(102, 126, 234, 0.12)',
                      borderColor: 'rgba(255,215,0,0.2)'
                    }
                  }}>
                    <Box sx={{ color: '#8b5e3c', mb: 1, display: 'flex', justifyContent: 'center' }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h3" sx={{
                      fontWeight: 800,
                      color: '#2c1810',
                      fontSize: isMobile ? '1.8rem' : '2.5rem',
                      background: 'linear-gradient(135deg, #2c1810 0%, #8b5e3c 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      {stat.number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {stat.label}
                    </Typography>
                  </Paper>
                </Slide>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ========== FEATURES SECTION ========== */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="overline" sx={{
              color: '#8b5e3c',
              fontWeight: 700,
              letterSpacing: 2,
              fontSize: '0.85rem'
            }}>
              Why Choose Us
            </Typography>
            <Typography variant="h3" sx={{
              fontWeight: 900,
              color: '#2c1810',
              mb: 1,
              fontSize: isMobile ? '2rem' : '3rem'
            }}>
              What Makes Us <Box component="span" sx={{ color: '#8b5e3c' }}>Special</Box>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              We pride ourselves on delivering exceptional quality and service
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Fade in timeout={800 + index * 150}>
                <Paper sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 4,
                  bgcolor: '#fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  height: '100%',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 50px rgba(102, 126, 234, 0.1)',
                    borderColor: 'rgba(255,215,0,0.2)'
                  }
                }}>
                  <Box sx={{ fontSize: 48, mb: 1.5 }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c1810', mb: 0.5 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.desc}
                  </Typography>
                </Paper>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ========== ABOUT US SECTION ========== */}
      <Box sx={{ py: 8, bgcolor: '#f5f0eb' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={800}>
                <Box>
                  <Typography variant="overline" sx={{
                    color: '#8b5e3c',
                    fontWeight: 700,
                    letterSpacing: 2,
                    fontSize: '0.85rem'
                  }}>
                    About Us
                  </Typography>
                  <Typography variant="h3" sx={{
                    fontWeight: 900,
                    color: '#2c1810',
                    mb: 2,
                    fontSize: isMobile ? '2rem' : '3rem'
                  }}>
                    Crafting <Box component="span" sx={{ color: '#8b5e3c' }}>Memorable</Box> Experiences
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: 'text.secondary',
                    mb: 3,
                    lineHeight: 1.9,
                    fontSize: '1.05rem'
                  }}>
                    At Artisan Cafe, we believe that great coffee is more than just a drink – it's an experience. 
                    Our journey began with a simple passion for quality, and today we're proud to serve our community 
                    with the finest beans, freshest ingredients, and warmest hospitality.
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      {['☕ Premium Coffee', '🥐 Fresh Pastries'].map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                          <Box sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,215,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffd700',
                            fontSize: 14,
                            fontWeight: 700
                          }}>✓</Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{item}</Typography>
                        </Box>
                      ))}
                    </Grid>
                    <Grid item xs={6}>
                      {['🌿 Cozy Ambiance', '📶 Free WiFi'].map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                          <Box sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,215,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffd700',
                            fontSize: 14,
                            fontWeight: 700
                          }}>✓</Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{item}</Typography>
                        </Box>
                      ))}
                    </Grid>
                  </Grid>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 2.5,
                }}>
                  {[
                    { emoji: '☕', title: '100% Arabica', desc: 'Premium beans', color: '#2c1810', textColor: '#fff' },
                    { emoji: '🥐', title: 'Fresh Baked', desc: 'Daily pastries', color: '#ffd700', textColor: '#2c1810' },
                    { emoji: '🍰', title: 'Homemade', desc: 'Desserts & cakes', color: '#8b5e3c', textColor: '#fff' },
                    { emoji: '🥪', title: 'Gourmet', desc: 'Sandwiches & more', color: '#f5f0eb', textColor: '#2c1810' },
                  ].map((item, index) => (
                    <Paper key={index} sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: item.color,
                      color: item.textColor,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      minHeight: 120,
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      '&:hover': {
                        transform: 'translateY(-4px) scale(1.02)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <Typography sx={{ fontSize: 36, mb: 0.5 }}>{item.emoji}</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.title}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>{item.desc}</Typography>
                    </Paper>
                  ))}
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ========== TESTIMONIALS ========== */}
      <Box sx={{ py: 8, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Fade in timeout={800}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="overline" sx={{
                color: '#8b5e3c',
                fontWeight: 700,
                letterSpacing: 2,
                fontSize: '0.85rem'
              }}>
                Testimonials
              </Typography>
              <Typography variant="h3" sx={{
                fontWeight: 900,
                color: '#2c1810',
                fontSize: isMobile ? '2rem' : '3rem'
              }}>
                What Our Customers Say
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in timeout={800 + index * 150}>
                  <Paper sx={{
                    p: 4,
                    borderRadius: 4,
                    bgcolor: '#faf8f5',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 16px 60px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(255,215,0,0.1)'
                    },
                    border: '1px solid transparent'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{
                        bgcolor: testimonial.color,
                        width: 56,
                        height: 56,
                        fontWeight: 700,
                        fontSize: '1.3rem'
                      }}>
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: '#2c1810', fontSize: '1.05rem' }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', color: '#ffd700', mb: 1.5 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} sx={{ fontSize: 18 }} />
                      ))}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{
                      flex: 1,
                      lineHeight: 1.9,
                      fontStyle: 'italic',
                      fontSize: '0.95rem'
                    }}>
                      "{testimonial.text}"
                    </Typography>
                  </Paper>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ========== CTA BANNER ========== */}
      <Box sx={{
        py: 8,
        background: 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 50%, #6b3f2a 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          bgcolor: 'rgba(255,215,0,0.03)',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -150,
          left: -50,
          width: 300,
          height: 300,
          borderRadius: '50%',
          bgcolor: 'rgba(255,215,0,0.02)',
        }} />
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Fade in timeout={800}>
            <Box>
              <Typography sx={{ fontSize: 56, mb: 2 }}>☕</Typography>
              <Typography variant="h3" sx={{
                fontWeight: 900,
                color: '#fff',
                mb: 2,
                fontSize: isMobile ? '2rem' : '3rem'
              }}>
                Ready to Experience <Box component="span" sx={{ color: '#ffd700' }}>Artisan Cafe</Box>?
              </Typography>
              <Typography sx={{
                color: 'rgba(255,255,255,0.7)',
                mb: 4,
                fontSize: '1.1rem',
                maxWidth: 500,
                mx: 'auto'
              }}>
                Join us for the perfect cup of coffee and a warm atmosphere that feels like home.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={onViewMenu}
                sx={{
                  py: 1.8,
                  px: 6,
                  borderRadius: 50,
                  background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 50%, #d97706 100%)',
                  color: '#1a1a2e',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  boxShadow: '0 8px 30px rgba(255,215,0,0.3)',
                  '&:hover': {
                    boxShadow: '0 12px 50px rgba(255,215,0,0.5)',
                    transform: 'translateY(-3px)',
                  },
                  transition: 'all 0.4s ease'
                }}
              >
                Explore Our Menu 🚀
              </Button>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* ========== FOOTER ========== */}
      <Box sx={{
        bgcolor: '#1a1a2e',
        color: 'rgba(255,255,255,0.7)',
        pt: 6,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative top curve */}
        <Box sx={{
          position: 'absolute',
          top: -2,
          left: 0,
          right: 0,
          height: 40,
          bgcolor: '#1a1a2e',
          borderTopLeftRadius: '50% 100%',
          borderTopRightRadius: '50% 100%',
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={5}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <RestaurantMenu sx={{ color: '#ffd700', fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
                  Artisan Cafe
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8, color: 'rgba(255,255,255,0.6)' }}>
                Where every cup tells a story. Experience the finest coffee, 
                freshly baked pastries, and a warm atmosphere.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <IconButton sx={{
                  color: '#ffd700',
                  bgcolor: 'rgba(255,215,0,0.08)',
                  '&:hover': { bgcolor: 'rgba(255,215,0,0.2)', transform: 'translateY(-2px)' },
                  transition: 'all 0.3s ease'
                }}>
                  <Facebook />
                </IconButton>
                <IconButton sx={{
                  color: '#ffd700',
                  bgcolor: 'rgba(255,215,0,0.08)',
                  '&:hover': { bgcolor: 'rgba(255,215,0,0.2)', transform: 'translateY(-2px)' },
                  transition: 'all 0.3s ease'
                }}>
                  <Instagram />
                </IconButton>
                <IconButton sx={{
                  color: '#ffd700',
                  bgcolor: 'rgba(255,215,0,0.08)',
                  '&:hover': { bgcolor: 'rgba(255,215,0,0.2)', transform: 'translateY(-2px)' },
                  transition: 'all 0.3s ease'
                }}>
                  <Twitter />
                </IconButton>
                <IconButton sx={{
                  color: '#ffd700',
                  bgcolor: 'rgba(255,215,0,0.08)',
                  '&:hover': { bgcolor: 'rgba(255,215,0,0.2)', transform: 'translateY(-2px)' },
                  transition: 'all 0.3s ease'
                }}>
                  <YouTube />
                </IconButton>
              </Box>
            </Grid>

            <Grid item xs={6} sm={6} md={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', mb: 2, fontSize: '1rem' }}>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {['Home', 'Menu', 'About', 'Contact'].map((item) => (
                  <Button
                    key={item}
                    variant="text"
                    sx={{
                      color: 'rgba(255,255,255,0.5)',
                      justifyContent: 'flex-start',
                      p: 0,
                      fontSize: '0.9rem',
                      '&:hover': { color: '#ffd700' },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {item}
                  </Button>
                ))}
              </Box>
            </Grid>

            <Grid item xs={6} sm={6} md={3}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', mb: 2, fontSize: '1rem' }}>
                Contact Info
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LocationOn sx={{ color: '#ffd700', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    123 Coffee Street, City
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Phone sx={{ color: '#ffd700', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    +1 234 567 890
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Email sx={{ color: '#ffd700', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    info@artisancafe.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AccessTime sx={{ color: '#ffd700', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Mon-Sun: 7AM - 10PM
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', mb: 2, fontSize: '1rem' }}>
                Visit Us
              </Typography>
              <Paper sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <Typography sx={{ fontSize: 48, mb: 1 }}>📍</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Find us at the heart of the city!
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,215,0,0.3)', display: 'block', mt: 1 }}>
                  Come for the coffee, stay for the experience
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.06)' }} />
          <Typography variant="caption" sx={{
            color: 'rgba(255,255,255,0.3)',
            textAlign: 'center',
            display: 'block',
            letterSpacing: 0.5,
            py: 2
          }}>
            © 2024 Artisan Cafe. All rights reserved. ☕ Made with love and passion.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;