// src/pages/AppointmentsPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAppointments } from '../hooks/useAppointments';
import { AppointmentStatusEnum } from '../types/appointment';
import { format, parseISO } from 'date-fns';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { 
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`appointment-tabpanel-${index}`}
      aria-labelledby={`appointment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    appointments, 
    getClientAppointments, 
    cancelAppointment,
    isLoading, 
    error 
  } = useAppointments();
  
  const [tabValue, setTabValue] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  
  useEffect(() => {
    if (user?.id) {
      getClientAppointments(user.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Scoate getClientAppointments din dependențe
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Filter appointments by status
  const upcomingAppointments = appointments.filter(
    apt => apt.status === AppointmentStatusEnum.PENDING || 
          apt.status === AppointmentStatusEnum.CONFIRMED
  );
  
  const pastAppointments = appointments.filter(
    apt => apt.status === AppointmentStatusEnum.COMPLETED ||
          apt.status === AppointmentStatusEnum.CANCELLED ||
          apt.status === AppointmentStatusEnum.NO_SHOW
  );
  
  // Format date for display
  const formatDateTime = (dateTime: string) => {
    try {
      const parsedDate = parseISO(dateTime);
      return format(parsedDate, 'dd MMM yyyy, HH:mm');
    } catch (error) {
      return dateTime; // Fallback to original string if parsing fails
    }
  };
  
  // Handle appointment cancellation
  const handleCancelClick = (id: number) => {
    setSelectedAppointmentId(id);
    setCancelDialogOpen(true);
  };
  
  const handleCancelConfirm = async () => {
    if (selectedAppointmentId) {
      await cancelAppointment(selectedAppointmentId);
      setCancelDialogOpen(false);
      setSelectedAppointmentId(null);
    }
  };
  
  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setSelectedAppointmentId(null);
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
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Programările mele
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label={`Programări viitoare (${upcomingAppointments.length})`} />
          <Tab label={`Istoric programări (${pastAppointments.length})`} />
        </Tabs>

        <Divider />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              {upcomingAppointments.length > 0 ? (
                <List>
                  {upcomingAppointments.map((appointment) => (
                    <React.Fragment key={appointment.id}>
                      <ListItem alignItems="flex-start">
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={8}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                              <Typography variant="subtitle1">
                                {formatDateTime(appointment.startTime)}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <TimeIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                              <Typography variant="body2">
                                Durată: {
                                  Math.round(
                                    (new Date(appointment.endTime).getTime() - 
                                    new Date(appointment.startTime).getTime()) / 60000
                                  )
                                } minute
                              </Typography>
                            </Box>
                            
                            <Typography variant="subtitle2" gutterBottom>
                              Servicii:
                            </Typography>
                            <Box sx={{ ml: 2 }}>
                              {appointment.services.map((service) => (
                                <Typography key={service.id} variant="body2">
                                  • {service.name} ({service.durationMinutes} min) - {service.price} lei
                                </Typography>
                              ))}
                            </Box>
                            
                            {appointment.notes && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Note: {appointment.notes}
                                </Typography>
                              </Box>
                            )}
                          </Grid>
                          
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                              <Chip 
                                label={appointment.status} 
                                color={getStatusColor(appointment.status)}
                                size="small"
                                sx={{ mb: 2 }}
                              />
                              
                              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                Total: {appointment.totalPrice} lei
                              </Typography>
                              
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                startIcon={<EditIcon />}
                                sx={{ mb: 1 }}
                                href={`/appointments/edit/${appointment.id}`}
                              >
                                Modifică
                              </Button>
                              
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<CancelIcon />}
                                onClick={() => handleCancelClick(appointment.id)}
                              >
                                Anulează
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Nu aveți programări viitoare
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    href="/appointments/new"
                  >
                    Creați o programare nouă
                  </Button>
                </Box>
              )}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {pastAppointments.length > 0 ? (
                <List>
                  {pastAppointments.map((appointment) => (
                    <React.Fragment key={appointment.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle1">
                                {formatDateTime(appointment.startTime)}
                              </Typography>
                              <Chip 
                                label={appointment.status} 
                                color={getStatusColor(appointment.status)}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" component="span" display="block">
                                Servicii: {appointment.services.map(s => s.name).join(', ')}
                              </Typography>
                              <Typography variant="body2" component="span" display="block">
                                Total: {appointment.totalPrice} lei
                              </Typography>
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            aria-label="details"
                            href={`/appointments/${appointment.id}`}
                          >
                            <InfoIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Nu aveți programări anterioare
                  </Typography>
                </Box>
              )}
            </TabPanel>
          </>
        )}
      </Paper>
      
      {/* Create new appointment button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          href="/appointments/new"
        >
          Programare nouă
        </Button>
      </Box>
      
      {/* Cancel appointment confirmation dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelDialogClose}
      >
        <DialogTitle>Confirmare anulare programare</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sunteți sigur că doriți să anulați această programare? Această acțiune nu poate fi anulată.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose} color="primary">
            Renunță
          </Button>
          <Button onClick={handleCancelConfirm} color="error" autoFocus>
            Anulează programarea
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default  AppointmentsPage