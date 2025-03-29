// src/pages/NewAppointmentPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppointments } from '../hooks/useAppointments';
import { Service } from '../types/appointment';
import { format, addDays, parseISO } from 'date-fns';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { 
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// Step components for the stepper
const steps = ['Selectare servicii', 'Selectare dată și oră', 'Confirmare'];

const NewAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    services, 
    availableTimeSlots,
    getServices, 
    getAvailableTimeSlots,
    createAppointment,
    isLoading, 
    error,
    clearTimeSlots 
  } = useAppointments();
  
  // State for the appointment creation process
  const [activeStep, setActiveStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  
  // Computed values
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.durationMinutes, 0);
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  
  // Fetch services on mount
  useEffect(() => {
    // Fetch services only once when component mounts
    getServices(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // When date changes, fetch available time slots
  useEffect(() => {
    if (selectedDate && selectedProvider) {
      // Clear previous time slots and selected time
      clearTimeSlots();
      setSelectedTimeSlot(null);
      
      // Format date for API
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Use the selected provider's ID
      getAvailableTimeSlots(selectedProvider, formattedDate);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedProvider]);
  
  // Handle next button click
  const handleNext = () => {
    const errors: { [key: string]: string } = {};
    
    // Validate current step
    if (activeStep === 0) {
      if (selectedServices.length === 0) {
        errors.services = 'Selectați cel puțin un serviciu';
      }
    } else if (activeStep === 1) {
      if (!selectedDate) {
        errors.date = 'Selectați o dată';
      }
      if (!selectedTimeSlot) {
        errors.time = 'Selectați o oră';
      }
    }
    
    // If there are errors, show them and don't proceed
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Clear any previous errors
    setFormErrors({});
    
    // If this is the last step, create the appointment
    if (activeStep === steps.length - 1) {
      handleCreateAppointment();
    } else {
      // Otherwise, go to next step
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  // Handle back button click
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Handle service selection
  const handleServiceToggle = (service: Service) => {
    setSelectedServices((prev) => {
      const serviceIndex = prev.findIndex(s => s.id === service.id);
      if (serviceIndex === -1) {
        // Add service and set provider if this is the first service
        if (prev.length === 0 && service.providerId) {
          setSelectedProvider(service.providerId);
        }
        return [...prev, service];
      } else {
        // Remove service
        const newServices = prev.filter(s => s.id !== service.id);
        // If no services left, clear the provider
        if (newServices.length === 0) {
          setSelectedProvider(null);
        }
        return newServices;
      }
    });
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };
  
const handleCreateAppointment = async () => {
  if (!user?.id || !selectedTimeSlot || !selectedProvider) {
    if (!selectedProvider) {
      setFormErrors({...formErrors, provider: 'No provider selected. Please select a service first.'});
    }
    return;
  }
  
  const appointmentData = {
    clientId: user.id,
    providerId: selectedProvider,
    startTime: selectedTimeSlot,
    serviceIds: selectedServices.map(service => service.id),
    notes: notes.trim() || undefined
  };
  
  const result = await createAppointment(appointmentData);
  
  if (result) {
    navigate('/appointments');
  }
}
  
  // Render step content based on active step
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Selectați serviciile dorite
            </Typography>
            
            {formErrors.services && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formErrors.services}
              </Alert>
            )}
            
            <Grid container spacing={3}>
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
                      {service.imageUrl && (
                        <CardMedia
                          component="img"
                          height="140"
                          image={service.imageUrl}
                          alt={service.name}
                        />
                      )}
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
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Selectați data și ora
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker 
                    label="Data programării"
                    value={selectedDate}
                    onChange={(newDate) => setSelectedDate(newDate)}
                    disablePast
                    maxDate={addDays(new Date(), 30)} // Allow booking up to 30 days ahead
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
            
            {!selectedDate ? (
              <Alert severity="info">
                Selectați o dată pentru a vedea orele disponibile
              </Alert>
            ) : isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : availableTimeSlots.length === 0 ? (
              <Alert severity="warning">
                Nu există ore disponibile pentru data selectată. Vă rugăm să selectați o altă dată.
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
                        .filter(slot => slot.available)
                        .map((timeSlot, index) => (
                          <Grid item xs={6} sm={4} md={3} key={index}>
                            <FormControlLabel
                              value={timeSlot.startTime}
                              control={<Radio />}
                              label={format(parseISO(timeSlot.startTime), 'HH:mm')}
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
            
            <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
              Note (opțional):
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
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirmarea programării
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    Servicii selectate:
                  </Typography>
                  {selectedServices.map((service) => (
                    <Box key={service.id} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body1">
                        {service.name} ({service.durationMinutes} min)
                      </Typography>
                      <Typography variant="body1">
                        {service.price} lei
                      </Typography>
                    </Box>
                  ))}
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      Data: {selectedDate ? format(selectedDate, 'dd MMMM yyyy') : ''}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      Ora: {selectedTimeSlot ? format(parseISO(selectedTimeSlot), 'HH:mm') : ''}
                    </Typography>
                  </Box>
                </Grid>
                
                {notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mt: 1 }}>
                      Note:
                    </Typography>
                    <Typography variant="body1">
                      {notes}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1">
                      Durată totală:
                    </Typography>
                    <Typography variant="subtitle1">
                      {totalDuration} min
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1">
                      Preț total:
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {totalPrice} lei
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              Odată creată, programarea va avea inițial statusul "În așteptare" și va fi confirmată de către salon.
            </Alert>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Programare nouă
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || isLoading}
            onClick={handleBack}
          >
            Înapoi
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeStep === steps.length - 1 ? (
              'Confirmă programarea'
            ) : (
              'Continuă'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewAppointmentPage;