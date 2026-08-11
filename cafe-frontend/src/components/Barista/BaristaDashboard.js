import React, { useState } from 'react';
import { 
  Container, Typography, Paper, Box, Grid, Card, CardContent, 
  Button, Chip, Divider, List, ListItem, ListItemText, Alert, Tabs, Tab 
} from '@mui/material';
import { CheckCircle, HourglassBottom, History } from '@mui/icons-material';

function BaristaDashboard({ orders, onUpdateItemStatus }) {
  const [tabView, setTabView] = useState('active'); // 'active' or 'history'

  // Filter orders containing barista items
  const allBaristaOrders = orders.filter(o => 
    o.items && o.items.some(item => item.targetDept === 'barista')
  );

  // Active tickets: Status is DISPATCHED and has at least one barista item NOT ready
  const activeTickets = allBaristaOrders.filter(o => {
    if (o.status !== 'DISPATCHED') return false;
    const drinkItems = o.items.filter(item => item.targetDept === 'barista');
    return drinkItems.some(item => item.itemStatus !== 'ready');
  });

  // Finished history tickets: All barista items are ready or order completed
  const finishedTickets = allBaristaOrders.filter(o => {
    const drinkItems = o.items.filter(item => item.targetDept === 'barista');
    return drinkItems.length > 0 && drinkItems.every(item => item.itemStatus === 'ready');
  });

  const displayTickets = tabView === 'active' ? activeTickets : finishedTickets;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 4, mb: 4, background: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)', color: '#fff' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          ☕ Barista Coffee & Drinks Station
        </Typography>
        <Typography sx={{ color: '#fde68a' }}>
          Prepare hot drinks, coffees, teas, and smoothies dispatched by Cashier. Items automatically clear from active queue when finished!
        </Typography>
      </Paper>

      {/* Tabs: Active Queue vs Finished History */}
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
            value="active" 
            label={`🔥 Active Drink Queue (${activeTickets.length})`} 
            icon={<HourglassBottom />} 
            iconPosition="start" 
          />
          <Tab 
            value="history" 
            label={`✅ Finished Drinks History (${finishedTickets.length})`} 
            icon={<History />} 
            iconPosition="start" 
          />
        </Tabs>
      </Box>

      {displayTickets.length === 0 ? (
        <Alert severity={tabView === 'active' ? 'info' : 'success'} sx={{ borderRadius: 2 }}>
          {tabView === 'active' 
            ? '🎉 No active drink tickets! All drinks are finished.' 
            : 'No completed drink history yet.'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {displayTickets.map(ord => {
            const drinkItems = ord.items.filter(item => item.targetDept === 'barista');
            const allDrinksReady = drinkItems.every(item => item.itemStatus === 'ready');

            return (
              <Grid item xs={12} md={6} key={ord.id}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    borderRadius: 3, 
                    borderLeft: `6px solid ${allDrinksReady ? '#22c55e' : '#f59e0b'}`,
                    bgcolor: allDrinksReady ? '#f0fdf4' : '#fff'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Order #{ord.id} - {ord.tableNumber}
                      </Typography>
                      {allDrinksReady ? (
                        <Chip icon={<CheckCircle />} label="Drinks Finished (Cleared)" color="success" sx={{ fontWeight: 'bold' }} />
                      ) : (
                        <Chip icon={<HourglassBottom />} label="Preparing Drinks" color="warning" sx={{ fontWeight: 'bold' }} />
                      )}
                    </Box>

                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                      👤 Waiter: <strong>{ord.waiterName}</strong> (ID: {ord.waiterId})
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1 }}>☕ Drink Items:</Typography>
                    <List dense>
                      {drinkItems.map(item => (
                        <ListItem key={item.id} sx={{ px: 0, py: 1 }}>
                          <ListItemText 
                            primary={
                              <Typography sx={{ fontWeight: 'bold', fontSize: '1.05rem' }}>
                                {item.name} (x{item.quantity})
                              </Typography>
                            }
                          />
                          <Button
                            variant={item.itemStatus === 'ready' ? 'contained' : 'outlined'}
                            color={item.itemStatus === 'ready' ? 'success' : 'primary'}
                            size="small"
                            onClick={() => onUpdateItemStatus(ord.id, item.id, 'barista', item.itemStatus !== 'ready')}
                            startIcon={item.itemStatus === 'ready' ? <CheckCircle /> : null}
                            sx={{ borderRadius: 2, fontWeight: 'bold' }}
                          >
                            {item.itemStatus === 'ready' ? 'Finished' : 'Mark Ready'}
                          </Button>
                        </ListItem>
                      ))}
                    </List>

                    <Divider sx={{ my: 1.5 }} />

                    <Button 
                      variant="contained" 
                      color={allDrinksReady ? 'success' : 'warning'}
                      fullWidth
                      onClick={() => onUpdateItemStatus(ord.id, null, 'barista', !allDrinksReady)}
                      sx={{ py: 1.2, fontWeight: 'bold', borderRadius: 2 }}
                    >
                      {allDrinksReady ? '✅ Finished & Cleared from Active Queue' : 'Mark ALL Drinks Ready & Finish Ticket'}
                    </Button>
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

export default BaristaDashboard;
