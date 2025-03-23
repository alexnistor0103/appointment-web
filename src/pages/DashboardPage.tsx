import React from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import { 
  Event as EventIcon,
  Today as TodayIcon,
  History as HistoryIcon,
  Add as AddIcon
} from '@mui/icons-material';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  // This would typically come from an API call
  const upcomingAppointments = [
    {
      id: 1,
      service: 'Unghii simple',
      date: '2025-03-25',
      time: '10:00 AM',
      provider: 'Daria'
    },
    {
      id: 2,
      service: 'Unghii gel',
      date: '2025-04-01',
      time: '2:30 PM',
      provider: 'Daria'
    }
  ];
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Acasa
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Bine ati revenit, {user?.firstName || 'Guest'}!
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Urmeaza" />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <TodayIcon />
                </Avatar>
                <Typography variant="h4">{upcomingAppointments.length}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Aveti {upcomingAppointments.length} programari
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Istoric" />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <HistoryIcon />
                </Avatar>
                <Typography variant="h4">0</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Ati avut 0 programari luna aceasta
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Actiuni rapide" />
            <CardContent>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Faceti o programare
              </Button>
              <Button 
                variant="outlined"
                fullWidth
              >
                Vezi toate programarile
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Upcoming Appointments */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                Programari viitoare
              </Typography>
              <Button
                variant="text"
                color="primary"
                size="small"
              >
                Vezi tot
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {upcomingAppointments.length > 0 ? (
              <List sx={{ width: '100%' }}>
                {upcomingAppointments.map((appointment) => (
                  <React.Fragment key={appointment.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <EventIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={appointment.service}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {appointment.date} la {appointment.time}
                            </Typography>
                            {` — cu ${appointment.provider}`}
                          </>
                        }
                      />
                      <Box>
                        <Button size="small" color="primary">
                          Reprogramati
                        </Button>
                        <Button size="small" color="error">
                          Anulati
                        </Button>
                      </Box>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  Nu aveti programari in viitor
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                >
                  Faceti prima programare
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage;