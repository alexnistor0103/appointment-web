// src/pages/ServiceManagementPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAppointments } from '../hooks/useAppointments';
import * as appointmentApi from '../utils/appointmentApi';
import { Service } from '../types/appointment';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  FormControlLabel,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';

const ServiceManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { services, getServices, isLoading, error } = useAppointments();
  
  // UI State
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  
  // Check if user has admin role
  const isAdmin = user?.roles.includes('ROLE_ADMIN');
  
  // Fetch services on mount
  useEffect(() => {
    getServices(false); // Get all services, not just active ones
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Open dialog for adding a new service
  const handleAddService = () => {
    setDialogMode('add');
    setSelectedService(null);
    resetForm();
    setOpenDialog(true);
  };
  
  // Open dialog for editing an existing service
  const handleEditService = (service: Service) => {
    setDialogMode('edit');
    setSelectedService(service);
    
    // Populate form with service data
    setFormName(service.name);
    setFormDescription(service.description || '');
    setFormPrice(service.price.toString());
    setFormDuration(service.durationMinutes.toString());
    setFormActive(service.active);
    setFormImageUrl(service.imageUrl || '');
    
    setOpenDialog(true);
  };
  
  // Reset form fields
  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormDuration('');
    setFormActive(true);
    setFormImageUrl('');
    setFormErrors({});
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    if (!formName.trim()) {
      errors.name = 'Numele serviciului este obligatoriu';
    }
    
    if (!formPrice.trim()) {
      errors.price = 'Prețul este obligatoriu';
    } else if (isNaN(parseFloat(formPrice)) || parseFloat(formPrice) < 0) {
      errors.price = 'Prețul trebuie să fie un număr pozitiv';
    }
    
    if (!formDuration.trim()) {
      errors.duration = 'Durata este obligatorie';
    } else if (isNaN(parseInt(formDuration)) || parseInt(formDuration) <= 0) {
      errors.duration = 'Durata trebuie să fie un număr pozitiv';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle save service
  const handleSaveService = async () => {
    if (!validateForm()) return;
    
    const serviceData: Service = {
      id: selectedService?.id || 0,
      name: formName,
      description: formDescription || undefined,
      price: parseFloat(formPrice),
      durationMinutes: parseInt(formDuration),
      active: formActive,
      imageUrl: formImageUrl || undefined
    };
    
    try {
      if (dialogMode === 'add') {
        await appointmentApi.createService(serviceData);
        showSnackbar('Serviciu adăugat cu succes', 'success');
      } else {
        await appointmentApi.updateService(serviceData.id, serviceData);
        showSnackbar('Serviciu actualizat cu succes', 'success');
      }
      
      // Refresh services list
      getServices(false);
      handleCloseDialog();
    } catch (error) {
      showSnackbar('A apărut o eroare la salvarea serviciului', 'error');
    }
  };
  
  // Handle toggle service active status
  const handleToggleActive = async (service: Service, newStatus: boolean) => {
    try {
      await appointmentApi.setServiceActiveStatus(service.id, newStatus);
      showSnackbar(`Serviciu ${newStatus ? 'activat' : 'dezactivat'} cu succes`, 'success');
      
      // Refresh services list
      getServices(false);
    } catch (error) {
      showSnackbar('A apărut o eroare la modificarea statusului', 'error');
    }
  };
  
  // Show snackbar message
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestionare Servicii
        </Typography>
        
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddService}
          >
            Adaugă Serviciu
          </Button>
        )}
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
      ) : services.length === 0 ? (
        <Alert severity="info">
          Nu există servicii disponibile. Adăugați primul serviciu.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nume</TableCell>
                <TableCell>Descriere</TableCell>
                <TableCell align="right">Durată (min)</TableCell>
                <TableCell align="right">Preț (lei)</TableCell>
                <TableCell align="center">Activ</TableCell>
                {isAdmin && <TableCell align="center">Acțiuni</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell component="th" scope="row">
                    {service.name}
                  </TableCell>
                  <TableCell>{service.description || '-'}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <TimeIcon fontSize="small" sx={{ mr: 1 }} />
                      {service.durationMinutes}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{service.price}</TableCell>
                  <TableCell align="center">
                    {isAdmin ? (
                      <Switch
                        checked={service.active}
                        onChange={(e) => handleToggleActive(service, e.target.checked)}
                        color="primary"
                      />
                    ) : (
                      service.active ? 'Da' : 'Nu'
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditService(service)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Add/Edit Service Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Adaugă Serviciu Nou' : 'Editează Serviciu'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nume Serviciu"
              margin="normal"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
            />
            
            <TextField
              fullWidth
              label="Descriere"
              margin="normal"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              multiline
              rows={3}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Preț"
                margin="normal"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                error={!!formErrors.price}
                helperText={formErrors.price}
                InputProps={{
                  endAdornment: <InputAdornment position="end">lei</InputAdornment>,
                }}
                required
              />
              
              <TextField
                fullWidth
                label="Durată"
                margin="normal"
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                error={!!formErrors.duration}
                helperText={formErrors.duration}
                InputProps={{
                  endAdornment: <InputAdornment position="end">min</InputAdornment>,
                }}
                required
              />
            </Box>
            
            <TextField
              fullWidth
              label="URL Imagine"
              margin="normal"
              value={formImageUrl}
              onChange={(e) => setFormImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  color="primary"
                />
              }
              label="Serviciu Activ"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anulează</Button>
          <Button onClick={handleSaveService} variant="contained" color="primary">
            Salvează
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ServiceManagementPage;