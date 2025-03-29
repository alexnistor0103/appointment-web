// src/pages/AppointmentDetailsPage.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppointments } from '../hooks/useAppointments';
import { format, parseISO } from 'date-fns';
import { AppointmentStatusEnum } from '../types/appointment';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const AppointmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentAppointment, getAppointment, cancelAppointment, isLoading, error } = useAppointments();
  
  useEffect(() => {
    if (id) {
      getAppointment(parseInt(id));
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  
  // Format date for display
  const formatDateTime = (dateTime: string) => {
    try {
      const parsedDate = parseISO(dateTime);
      return format(parsedDate, 'dd MMMM yyyy, HH:mm');
    } catch (error) {
      return dateTime;
    }
  };
  
  // Handle cancel appointment
  const handleCancelAppointment = async () => {
    if (!currentAppointment) return;
    
    if (window.confirm('Sunteți sigur că doriți să anulați această programare?')) {
      const result = await cancelAppointment(currentAppointment.id);
      if (result) {
        // Refresh the appointment data
        getAppointment(currentAppointment.id);
      }
    }
  };
  
  // Get status chip color
  const getStatusColor = (status: AppointmentStatusEnum) => {
    switch (status) {
      case AppointmentStatusEnum.PENDING:
        return 'warning';
      case AppointmentStatusEnum.CONFIRMED:
        return 'success';
      case AppointmentStatusEnum.CANCELLED:
        return 'error';
      case AppointmentStatusEnum.COMPLETED:
        return 'primary';
      case AppointmentStatusEnum.NO_SHOW:
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Check if appointment can be cancelled or edited
  const canModify = currentAppointment && 
    (currentAppointment.status === AppointmentStatusEnum.PENDING || 
     currentAppointment.status === AppointmentStatusEnum.CONFIRMED);
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton 
          aria-label="back" 
          onClick={() => navigate('/appointments')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Detalii programare
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
      ) : !currentAppointment ? (
        <Alert severity="warning">
          Nu s-au putut găsi detaliile programării.
        </Alert>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Programare #{currentAppointment.id}
            </Typography>
            <Chip 
              label={currentAppointment.status} 
              color={getStatusColor(currentAppointment.status)}
            />
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Data și ora
                  </Typography>
                  <Typography variant="body1">
                    {formatDateTime(currentAppointment.startTime)}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimeIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Durată
                  </Typography>
                  <Typography variant="body1">
                    {Math.round(
                      (new Date(currentAppointment.endTime).getTime() - 
                      new Date(currentAppointment.startTime).getTime()) / 60000
                    )} minute
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Specialist
                  </Typography>
                  <Typography variant="body1">
                    {currentAppointment.providerName}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Servicii
              </Typography>
              
              {currentAppointment.services.map((service) => (
                <Box 
                  key={service.id}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    mb: 1
                  }}
                >
                  <Typography variant="body1">
                    {service.name} ({service.durationMinutes} min)
                  </Typography>
                  <Typography variant="body1">
                    {service.price} lei
                  </Typography>
                </Box>
              ))}
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Total
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {currentAppointment.totalPrice} lei
                </Typography>
              </Box>
            </Grid>
            
            {currentAppointment.notes && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Note
                </Typography>
                <Typography variant="body1">
                  {currentAppointment.notes}
                </Typography>
              </Grid>
            )}
            
            {canModify && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/appointments/edit/${currentAppointment.id}`)}
                  >
                    Modifică
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelAppointment}
                  >
                    Anulează
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}
    </Container>
  )
}

export default AppointmentDetailsPage