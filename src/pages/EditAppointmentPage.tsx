import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppointments } from '../hooks/useAppointments';
import { Service, UpdateAppointmentRequest } from '../types/appointment';
import { format, parseISO, addDays } from 'date-fns';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  TextField,
  FormControlLabel,
  FormControl,
  RadioGroup,
  Radio,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardActionArea
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const EditAppointmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentAppointment, 
    services, 
    availableTimeSlots,
    getAppointment,
    getServices,
    getAvailableTimeSlots,
    updateAppointment,
    clearTimeSlots,
    isLoading, 
    error 
  } = useAppointments();
  
  // Form state
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  // Computed values
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.durationMinutes, 0);
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  
  // Fetch appointment and services on mount
  useEffect(() => {
    if (id) {
      getAppointment(parseInt(id));
      getServices(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  
  // Initialize form with appointment data
  useEffect(() => {
    if (currentAppointment && services.length > 0) {
      // Find the service objects that match the appointment's services
      const appointmentServices = services.filter(service => 
        currentAppointment.services.some(s => s.id === service.id)
      );
      
      setSelectedServices(appointmentServices);
      
      // Parse the appointment start time to get the date
      const appointmentDate = parseISO(currentAppointment.startTime);
      setSelectedDate(appointmentDate);
      
      // Use the original start time string
      setSelectedTimeSlot(currentAppointment.startTime);
      
      // Set notes
      setNotes(currentAppointment.notes || '');
      
      // Fetch available time slots for the appointment date
      if (user?.id) {
        const formattedDate = format(appointmentDate, 'yyyy-MM-dd');
        console.log('Fetching timeslots for date:', formattedDate);
        // Use the appointment's provider ID
        const providerId = currentAppointment.providerId;
        getAvailableTimeSlots(providerId, formattedDate);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAppointment, services, user?.id]);
  
  // When date changes, fetch available time slots
  useEffect(() => {
    if (selectedDate && currentAppointment) {
      // Only if the date has changed from the original
      const originalDate = parseISO(currentAppointment.startTime);
      if (format(selectedDate, 'yyyy-MM-dd') !== format(originalDate, 'yyyy-MM-dd')) {
        // Clear previous time slots and selected time
        clearTimeSlots();
        setSelectedTimeSlot(null);
        
        // Format date for API
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        console.log('Date changed, fetching timeslots for:', formattedDate);
        
        // Use the appointment's provider ID
        const providerId = currentAppointment.providerId;
        
        getAvailableTimeSlots(providerId, formattedDate);
        
        setHasChanges(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, currentAppointment]);
  
  // Check for changes to track if form has been modified
  useEffect(() => {
    if (currentAppointment) {
      const servicesChanged = selectedServices.length !== currentAppointment.services.length ||
        !selectedServices.every(service => 
          currentAppointment.services.some(s => s.id === service.id)
        );
      
      const timeChanged = selectedTimeSlot !== currentAppointment.startTime;
      
      const notesChanged = notes !== (currentAppointment.notes || '');
      
      setHasChanges(servicesChanged || timeChanged || notesChanged);
    }
  }, [currentAppointment, selectedServices, selectedTimeSlot, notes]);
  
  // Handle service selection
  const handleServiceToggle = (service: Service) => {
    setSelectedServices((prev) => {
      const serviceIndex = prev.findIndex(s => s.id === service.id);
      if (serviceIndex === -1) {
        // Add service
        return [...prev, service];
      } else {
        // Remove service
        return prev.filter(s => s.id !== service.id);
      }
    });
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: { [key: string]: string } = {};
    
    if (selectedServices.length === 0) {
      errors.services = 'Selectați cel puțin un serviciu';
    }
    
    if (!selectedTimeSlot) {
      errors.time = 'Selectați o oră';
    }
    
    // If there are errors, show them and don't proceed
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Clear any previous errors
    setFormErrors({});
    
    if (!currentAppointment || !selectedTimeSlot) return;
    
    // Prepare update data
    const updateData: UpdateAppointmentRequest = {
      id: currentAppointment.id,
      startTime: selectedTimeSlot,
      serviceIds: selectedServices.map(service => service.id),
      notes: notes.trim() || undefined
    };
    
    const result = await updateAppointment(currentAppointment.id, updateData);
    
    if (result) {
      navigate(`/appointments/${currentAppointment.id}`);
    }
  };
  
  // Format date for display
  const formatDateTime = (dateTime: string) => {
    try {
      const parsedDate = parseISO(dateTime);
      return format(parsedDate, 'HH:mm');
    } catch (error) {
      return dateTime;
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <IconButton 
          aria-label="back" 
          onClick={() => navigate(`/appointments/${id}`)}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Modificare programare
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {isLoading && !currentAppointment ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : !currentAppointment ? (
        <Alert severity="warning">
          Nu s-au putut găsi detaliile programării.
        </Alert>
      ) : (
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Services selection */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Servicii
                </Typography>
                
                {formErrors.services && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {formErrors.services}
                  </Alert>
                )}
                
                <Grid container spacing={2}>
                  {services.map((service) => (
                    <Grid item xs={12} sm={6} md={4} key={service.id}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          height: '100%',
                          border: selectedServices.some(s => s.id === service.id) 
                            ? '2px solid' 
                            : '1px solid',
                          borderColor: selectedServices.some(s => s.id === service.id)
                            ? 'primary.main'
                            : 'divider'
                        }}
                      >
                        <CardActionArea 
                          onClick={() => handleServiceToggle(service)}
                          sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                        >
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography variant="h6" component="div">
                                {service.name}
                              </Typography>
                              {selectedServices.some(s => s.id === service.id) && (
                                <CheckCircleIcon color="primary" />
                              )}
                            </Box>
                            
                            {service.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {service.description}
                              </Typography>
                            )}
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                <TimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                {service.durationMinutes} min
                              </Typography>
                              <Typography variant="subtitle1">
                                {service.price} lei
                              </Typography>
                            </Box>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                
                {selectedServices.length > 0 && (
                  <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Servicii selectate:
                    </Typography>
                    {selectedServices.map((service) => (
                      <Box key={service.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1">
                          {service.name} ({service.durationMinutes} min)
                        </Typography>
                        <Typography variant="body1">
                          {service.price} lei
                        </Typography>
                      </Box>
                    ))}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">
                        Durată totală: {totalDuration} min
                      </Typography>
                      <Typography variant="subtitle1">
                        Total: {totalPrice} lei
                      </Typography>
                    </Box>
                  </Paper>
                )}
              </Grid>
              
              {/* Date and time selection */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Data și ora
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker 
                        label="Data programării"
                        value={selectedDate}
                        onChange={(newDate) => setSelectedDate(newDate)}
                        disablePast
                        maxDate={addDays(new Date(), 30)}
                        slotProps={{ 
                          textField: { 
                            fullWidth: true,
                            error: !!formErrors.date,
                            helperText: formErrors.date
                          } 
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
                  Ore disponibile:
                </Typography>
                
                {isLoading && !availableTimeSlots.length ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : availableTimeSlots.length === 0 ? (
                  <Alert severity="info">
                    {selectedDate && format(selectedDate, 'yyyy-MM-dd') !== format(parseISO(currentAppointment.startTime), 'yyyy-MM-dd')
                      ? 'Nu există ore disponibile pentru data selectată. Vă rugăm să selectați o altă dată.'
                      : 'Ora programării curente va fi păstrată. Selectați o altă dată pentru a vedea orele disponibile.'}
                  </Alert>
                ) : (
                  <>
                    {formErrors.time && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {formErrors.time}
                      </Alert>
                    )}
                    
                    <FormControl component="fieldset">
                      <RadioGroup 
                        value={selectedTimeSlot || ''}
                        onChange={(e) => handleTimeSlotSelect(e.target.value)}
                      >
                        <Grid container spacing={2}>
                          {availableTimeSlots
                            .filter(slot => slot.available || slot.startTime === currentAppointment.startTime)
                            .map((timeSlot, index) => (
                              <Grid item xs={6} sm={4} md={3} key={index}>
                                <FormControlLabel
                                  value={timeSlot.startTime}
                                  control={<Radio />}
                                  label={formatDateTime(timeSlot.startTime)}
                                  sx={{
                                    display: 'flex',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    p: 1,
                                    width: '100%',
                                    m: 0
                                  }}
                                />
                              </Grid>
                            ))}
                        </Grid>
                      </RadioGroup>
                    </FormControl>
                  </>
                )}
              </Grid>
              
              {/* Notes */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Note (opțional)
                </Typography>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Adăugați orice informații suplimentare pentru programarea dvs."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  inputProps={{ maxLength: 500 }}
                />
              </Grid>
              
              {/* Submit button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => navigate(`/appointments/${id}`)}
                    sx={{ mr: 2 }}
                  >
                    Anulează
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={isLoading || !hasChanges}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Salvează modificările'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}
    </Container>
  );
};

export default EditAppointmentPage;