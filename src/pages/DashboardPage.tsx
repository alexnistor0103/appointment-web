import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppointments } from '../hooks/useAppointments';
import { format, parseISO } from 'date-fns';
import { AppointmentStatusEnum } from '../types/appointment';
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
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Event as EventIcon,
  Today as TodayIcon,
  History as HistoryIcon,
  Add as AddIcon
} from '@mui/icons-material';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    appointments, 
    getClientAppointments, 
    isLoading, 
    error 
  } = useAppointments();
  
  // Fetch appointments when component mounts
  useEffect(() => {
    if (user?.id) {
      getClientAppointments(user.id);
    }
  }, [user?.id]);
  
  // Filter upcoming appointments
  const upcomingAppointments = appointments.filter(
    apt => apt.status === AppointmentStatusEnum.PENDING || 
          apt.status === AppointmentStatusEnum.CONFIRMED
  );
  
  // Filter completed appointments from current month
  const currentDate = new Date();
  const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  const completedAppointments = appointments.filter(
    apt => apt.status === AppointmentStatusEnum.COMPLETED &&
          new Date(apt.startTime) >= currentMonthStart
  );
  
  // Create appointment summary metrics
  const appointmentMetrics = {
    upcoming: upcomingAppointments.length,
    completed: completedAppointments.length
  };
  
  // Format date for display
  const formatDateTime = (dateTime: any) => {
    try {
      const parsedDate = parseISO(dateTime);
      return format(parsedDate, 'dd MMMM yyyy, HH:mm');
    } catch (error) {
      return dateTime;
    }
  };
  
  // Handle navigation to appointments page
  const handleViewAllAppointments = () => {
    navigate('/appointments');
  };
  
  // Handle navigation to new appointment page
  const handleCreateAppointment = () => {
    navigate('/appointments/new');
  };
  
  // Handle navigation to reschedule appointment
  const handleRescheduleAppointment = (appointmentId: any) => {
    navigate(`/appointments/edit/${appointmentId}`);
  };
  
  // Handle navigation to cancel appointment
  const handleCancelAppointment = (appointmentId: any) => {
    navigate(`/appointments/${appointmentId}`);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Panou
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Bine ați revenit, {user?.firstName || 'Guest'}!
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title="Urmează" />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <TodayIcon />
                  </Avatar>
                  <Typography variant="h4">{appointmentMetrics.upcoming}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Aveți {appointmentMetrics.upcoming} programări viitoare
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
                  <Typography variant="h4">{appointmentMetrics.completed}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Ați avut {appointmentMetrics.completed} programări luna aceasta
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title="Acțiuni rapide" />
              <CardContent>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  fullWidth
                  sx={{ mb: 2 }}
                  onClick={handleCreateAppointment}
                >
                  Faceți o programare
                </Button>
                <Button 
                  variant="outlined"
                  fullWidth
                  onClick={handleViewAllAppointments}
                >
                  Vezi toate programările
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Upcoming Appointments */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Programări viitoare
                </Typography>
                <Button
                  variant="text"
                  color="primary"
                  size="small"
                  onClick={handleViewAllAppointments}
                >
                  Vezi tot
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {upcomingAppointments.length > 0 ? (
                <List sx={{ width: '100%' }}>
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <React.Fragment key={appointment.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <EventIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={appointment.services.map(s => s.name).join(', ')}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {formatDateTime(appointment.startTime)}
                              </Typography>
                              {` — cu ${appointment.providerName}`}
                            </>
                          }
                        />
                        <Box>
                          <Button 
                            size="small" 
                            color="primary"
                            onClick={() => handleRescheduleAppointment(appointment.id)}
                          >
                            Reprogramați
                          </Button>
                          <Button 
                            size="small" 
                            color="error"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            Anulați
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
                    Nu aveți programări în viitor
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                    onClick={handleCreateAppointment}
                  >
                    Faceți prima programare
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default DashboardPage;