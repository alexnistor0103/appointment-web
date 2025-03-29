// src/pages/AdminAppointmentsPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as appointmentApi from '../utils/appointmentApi';
import { Appointment, AppointmentStatusEnum } from '../types/appointment';

import { format, parseISO, subDays, addDays } from 'date-fns';
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
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon
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

const AdminAppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tabValue, setTabValue] = useState(0);
  
  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date | null>(addDays(new Date(), 30));
  const [statusFilter, setStatusFilter] = useState<AppointmentStatusEnum | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Appointment detail dialog
  const [detailDialog, setDetailDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  
  // Check if user has admin role
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  
  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user?.id]);
  
  const fetchAppointments = async () => {
    if (!startDate || !endDate) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const formattedStartDate = format(startDate, "yyyy-MM-dd'T'HH:mm:ss");
      const formattedEndDate = format(endDate, "yyyy-MM-dd'T'23:59:59");
      
      const data = await appointmentApi.getAppointmentsByDateRange(
        formattedStartDate,
        formattedEndDate
      );
      
      setAppointments(data);
      setIsLoading(false);
    } catch (err) {
      setError('Nu s-au putut încărca programările. Încercați din nou.');
      setIsLoading(false);
    }
  };
  
  // Apply filters to appointments
  const filteredAppointments = appointments.filter(appointment => {
    // Status filter
    if (statusFilter !== 'ALL' && appointment.status !== statusFilter) {
      return false;
    }
    
    // Search filter (client name, email, service names)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const clientNameMatch = appointment.clientName.toLowerCase().includes(lowerQuery);
      const clientEmailMatch = appointment.clientEmail.toLowerCase().includes(lowerQuery);
      const serviceMatch = appointment.services.some(service => 
        service.name.toLowerCase().includes(lowerQuery)
      );
      
      if (!clientNameMatch && !clientEmailMatch && !serviceMatch) {
        return false;
      }
    }
    
    return true;
  });
  
  // Categorize appointments
  const upcomingAppointments = filteredAppointments.filter(
    apt => apt.status === AppointmentStatusEnum.PENDING || 
          apt.status === AppointmentStatusEnum.CONFIRMED
  );
  
  const pastAppointments = filteredAppointments.filter(
    apt => apt.status === AppointmentStatusEnum.COMPLETED ||
          apt.status === AppointmentStatusEnum.CANCELLED ||
          apt.status === AppointmentStatusEnum.NO_SHOW
  );
  
  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Format date for display
  const formatDateTime = (dateTime: string) => {
    try {
      const parsedDate = parseISO(dateTime);
      return format(parsedDate, 'dd MMM yyyy, HH:mm');
    } catch (error) {
      return dateTime;
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
  
  // Open appointment detail dialog
  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailDialog(true);
  };
  
  // Close appointment detail dialog
  const handleCloseDetail = () => {
    setDetailDialog(false);
    setSelectedAppointment(null);
  };
  
  // Update appointment status
  const handleUpdateStatus = async (id: number, newStatus: AppointmentStatusEnum) => {
    if (!selectedAppointment) return;
    
    try {
      setStatusUpdateLoading(true);
      
      const result = await appointmentApi.updateAppointment(id, {
        id,
        status: newStatus
      });
      
      // Update the appointment in the local state
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? result : apt)
      );
      
      // Also update the selected appointment
      setSelectedAppointment(result);
      setStatusUpdateLoading(false);
    } catch (err) {
      setError('Eroare la actualizarea statusului.');
      setStatusUpdateLoading(false);
    }
  };
  
  // Handle cancel appointment
  const handleCancelAppointment = async (id: number) => {
    try {
      setStatusUpdateLoading(true);
      
      const result = await appointmentApi.cancelAppointment(id);
      
      // Update the appointment in the local state
      setAppointments(prev => 
        prev.map(apt => apt.id === id ? result : apt)
      );
      
      // Also update the selected appointment
      setSelectedAppointment(result);
      setStatusUpdateLoading(false);
    } catch (err) {
      setError('Eroare la anularea programării.');
      setStatusUpdateLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Administrare Programări
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Vizualizați și gestionați toate programările
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Filters */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Filtre
          </Typography>
          <Box>
            <Tooltip title="Reîmprospătare">
              <IconButton onClick={fetchAppointments} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={filterOpen ? "Ascunde filtre" : "Arată filtre"}>
              <IconButton onClick={() => setFilterOpen(!filterOpen)}>
                <FilterIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {filterOpen && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="De la data"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{
                    textField: { fullWidth: true, size: "small" }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Până la data"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{
                    textField: { fullWidth: true, size: "small" }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value as AppointmentStatusEnum | 'ALL')}
                >
                  <MenuItem value="ALL">Toate</MenuItem>
                  <MenuItem value={AppointmentStatusEnum.PENDING}>În așteptare</MenuItem>
                  <MenuItem value={AppointmentStatusEnum.CONFIRMED}>Confirmate</MenuItem>
                  <MenuItem value={AppointmentStatusEnum.COMPLETED}>Finalizate</MenuItem>
                  <MenuItem value={AppointmentStatusEnum.CANCELLED}>Anulate</MenuItem>
                  <MenuItem value={AppointmentStatusEnum.NO_SHOW}>Neprezentare</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Caută după nume, email sau serviciu"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                onClick={fetchAppointments}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Aplică filtre'}
              </Button>
            </Grid>
          </Grid>
        )}
      </Paper>
      
      {/* Appointment Tabs */}
      <Paper>
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
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Data și ora</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Telefon</TableCell>
                      <TableCell>Servicii</TableCell>
                      <TableCell align="right">Preț</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Acțiuni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {upcomingAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          Nu există programări viitoare care să corespundă filtrelor.
                        </TableCell>
                      </TableRow>
                    ) : (
                      upcomingAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.id}</TableCell>
                          <TableCell>{formatDateTime(appointment.startTime)}</TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {appointment.clientName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {appointment.clientEmail}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {appointment.clientPhone || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {appointment.services.map(service => service.name).join(', ')}
                          </TableCell>
                          <TableCell align="right">{appointment.totalPrice} lei</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={appointment.status} 
                              color={getStatusColor(appointment.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Detalii">
                              <IconButton
                                size="small"
                                onClick={() => handleViewAppointment(appointment)}
                              >
                                <InfoIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editează">
                              <IconButton
                                size="small"
                                href={`/appointments/edit/${appointment.id}`}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Data și ora</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Telefon</TableCell>
                      <TableCell>Servicii</TableCell>
                      <TableCell align="right">Preț</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Acțiuni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pastAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          Nu există programări anterioare care să corespundă filtrelor.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pastAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.id}</TableCell>
                          <TableCell>{formatDateTime(appointment.startTime)}</TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {appointment.clientName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {appointment.clientEmail}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {appointment.clientPhone || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {appointment.services.map(service => service.name).join(', ')}
                          </TableCell>
                          <TableCell align="right">{appointment.totalPrice} lei</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={appointment.status} 
                              color={getStatusColor(appointment.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Detalii">
                              <IconButton
                                size="small"
                                onClick={() => handleViewAppointment(appointment)}
                              >
                                <InfoIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </>
        )}
      </Paper>
      
      {/* Appointment Detail Dialog */}
      <Dialog
        open={detailDialog}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        {selectedAppointment && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Detalii Programare #{selectedAppointment.id}
                </Typography>
                <Chip 
                  label={selectedAppointment.status} 
                  color={getStatusColor(selectedAppointment.status)}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Informații Client
                  </Typography>
                  <Typography variant="body1">
                    {selectedAppointment.clientName}
                  </Typography>
                  <Typography variant="body2">
                    {selectedAppointment.clientEmail}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Telefon: {selectedAppointment.clientPhone || "Necunoscut"}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Data și Ora
                  </Typography>
                  <Typography variant="body1">
                    {formatDateTime(selectedAppointment.startTime)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Durată: {
                      Math.round(
                        (new Date(selectedAppointment.endTime).getTime() - 
                        new Date(selectedAppointment.startTime).getTime()) / 60000
                      )
                    } minute
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Servicii
                  </Typography>
                  {selectedAppointment.services.map((service) => (
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
                      {selectedAppointment.totalPrice} lei
                    </Typography>
                  </Box>
                </Grid>
                
                {selectedAppointment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Note
                    </Typography>
                    <Typography variant="body1">
                      {selectedAppointment.notes}
                    </Typography>
                  </Grid>
                )}
                
                {isAdmin && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Acțiuni Administrative
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedAppointment.status === AppointmentStatusEnum.PENDING && (
                        <Button
                          variant="outlined"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleUpdateStatus(selectedAppointment.id, AppointmentStatusEnum.CONFIRMED)}
                          disabled={statusUpdateLoading}
                        >
                          Confirmă
                        </Button>
                      )}
                      
                      {(selectedAppointment.status === AppointmentStatusEnum.PENDING || 
                        selectedAppointment.status === AppointmentStatusEnum.CONFIRMED) && (
                        <>
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleUpdateStatus(selectedAppointment.id, AppointmentStatusEnum.COMPLETED)}
                            disabled={statusUpdateLoading}
                          >
                            Marchează ca finalizată
                          </Button>
                          
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleCancelAppointment(selectedAppointment.id)}
                            disabled={statusUpdateLoading}
                          >
                            Anulează
                          </Button>
                          
                          <Button
                            variant="outlined"
                            color="warning"
                            onClick={() => handleUpdateStatus(selectedAppointment.id, AppointmentStatusEnum.NO_SHOW)}
                            disabled={statusUpdateLoading}
                          >
                            Marchează neprezentare
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="contained"
                        color="primary"
                        href={`/appointments/edit/${selectedAppointment.id}`}
                      >
                        Editează
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetail}>Închide</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AdminAppointmentsPage;