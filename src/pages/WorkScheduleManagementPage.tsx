import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as appointmentApi from '../utils/appointmentApi';
import { 
  WorkSchedule, 
  ScheduleException, 
  WeeklySchedule,
  ScheduleExceptionTypeEnum 
} from '../types/appointment';
// Eliminăm importul appointmentApi.getProviders() deoarece nu există
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  FormControlLabel,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

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
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
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

const WorkScheduleManagementPage: React.FC = () => {
  const { user } = useAuth();
  
  // UI State
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [providers, setProviders] = useState<{ id: number, name: string }[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule | null>(null);
  
  // Schedule Dialog State
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState<WorkSchedule>({
    providerId: 0,
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '17:00',
    active: true
  });
  
  // Exception Dialog State
  const [exceptionDialog, setExceptionDialog] = useState(false);
  const [exceptionFormData, setExceptionFormData] = useState<ScheduleException>({
    providerId: 0,
    exceptionDate: format(new Date(), 'yyyy-MM-dd'),
    type: ScheduleExceptionTypeEnum.DAY_OFF,
    reason: ''
  });
  
  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  // Check if user has admin role
  const isAdmin = user?.roles.includes('ROLE_ADMIN');
  
  // Setăm userul conectat ca provider
  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      // Utilizăm direct ID-ul utilizatorului conectat
      setProviders([{
        id: user.id,
        name: `${user.firstName} ${user.lastName}`
      }]);
      setSelectedProvider(user.id);
      setIsLoading(false);
    }
  }, [user]);
  
  // Load schedule when provider changes
  useEffect(() => {
    if (selectedProvider) {
      fetchProviderSchedule(selectedProvider);
    }
  }, [selectedProvider]);
  
  const fetchProviderSchedule = async (providerId: number) => {
    try {
      setIsLoading(true);
      const data = await appointmentApi.getProviderSchedule(providerId);
      setWeeklySchedule(data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load schedule');
      setIsLoading(false);
    }
  };
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Întrucât avem doar un singur provider (userul conectat),
  // această funcție nu mai e necesară, dar o păstrăm pentru compatibilitate
  const handleProviderChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedProvider(event.target.value as number);
  };
  
  // Schedule Dialog Handlers
  const openAddScheduleDialog = () => {
    setScheduleFormData({
      providerId: selectedProvider || 0,
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '17:00',
      active: true
    });
    setScheduleDialog(true);
  };
  
  const openEditScheduleDialog = (schedule: WorkSchedule) => {
    setScheduleFormData({
      ...schedule
    });
    setScheduleDialog(true);
  };
  
  const handleScheduleDialogClose = () => {
    setScheduleDialog(false);
  };
  
  const handleScheduleChange = (field: keyof WorkSchedule, value: any) => {
    setScheduleFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveSchedule = async () => {
    if (!selectedProvider) return;
    
    try {
      setIsLoading(true);
      
      // Prepare existing schedules and update or add the current one
      const existingSchedules = weeklySchedule?.regularSchedule || [];
      const scheduleIndex = existingSchedules.findIndex(
        s => s.dayOfWeek === scheduleFormData.dayOfWeek
      );
      
      let updatedSchedules;
      if (scheduleIndex !== -1) {
        // Update existing schedule
        updatedSchedules = [...existingSchedules];
        updatedSchedules[scheduleIndex] = scheduleFormData;
      } else {
        // Add new schedule
        updatedSchedules = [...existingSchedules, scheduleFormData];
      }
      
      // Save entire schedule
      await appointmentApi.setProviderSchedule({
        providerId: selectedProvider,
        scheduleEntries: updatedSchedules
      });
      
      // Refresh schedule data
      await fetchProviderSchedule(selectedProvider);
      setScheduleDialog(false);
      setSnackbar({
        open: true,
        message: 'Program salvat cu succes',
        severity: 'success'
      });
      
      setIsLoading(false);
    } catch (err) {
      setError('Eroare la salvarea programului');
      setIsLoading(false);
      setSnackbar({
        open: true,
        message: 'Eroare la salvarea programului',
        severity: 'error'
      });
    }
  };
  
  // Exception Dialog Handlers
  const openAddExceptionDialog = () => {
    setExceptionFormData({
      providerId: selectedProvider || 0,
      exceptionDate: format(new Date(), 'yyyy-MM-dd'),
      type: ScheduleExceptionTypeEnum.DAY_OFF,
      reason: ''
    });
    setExceptionDialog(true);
  };
  
  const openEditExceptionDialog = (exception: ScheduleException) => {
    setExceptionFormData({
      ...exception,
      // Ensure date format is correct
      exceptionDate: exception.exceptionDate
    });
    setExceptionDialog(true);
  };
  
  const handleExceptionDialogClose = () => {
    setExceptionDialog(false);
  };
  
  const handleExceptionChange = (field: keyof ScheduleException, value: any) => {
    setExceptionFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveException = async () => {
    if (!selectedProvider) return;
    
    try {
      setIsLoading(true);
      
      if (exceptionFormData.id) {
        // Update existing exception
        await appointmentApi.updateScheduleException(exceptionFormData.id, exceptionFormData);
      } else {
        // Add new exception
        await appointmentApi.addScheduleException(exceptionFormData);
      }
      
      // Refresh schedule data
      await fetchProviderSchedule(selectedProvider);
      setExceptionDialog(false);
      setSnackbar({
        open: true,
        message: 'Excepție salvată cu succes',
        severity: 'success'
      });
      
      setIsLoading(false);
    } catch (err) {
      setError('Eroare la salvarea excepției');
      setIsLoading(false);
      setSnackbar({
        open: true,
        message: 'Eroare la salvarea excepției',
        severity: 'error'
      });
    }
  };
  
  const handleDeleteException = async (id: number) => {
    if (!window.confirm('Sigur doriți să ștergeți această excepție?')) return;
    
    try {
      setIsLoading(true);
      await appointmentApi.deleteScheduleException(id);
      
      // Refresh schedule data
      if (selectedProvider) {
        await fetchProviderSchedule(selectedProvider);
      }
      
      setSnackbar({
        open: true,
        message: 'Excepție ștearsă cu succes',
        severity: 'success'
      });
      
      setIsLoading(false);
    } catch (err) {
      setError('Eroare la ștergerea excepției');
      setIsLoading(false);
      setSnackbar({
        open: true,
        message: 'Eroare la ștergerea excepției',
        severity: 'error'
      });
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Format time for display
  const formatTime = (time: string) => {
    try {
      return time;
    } catch (error) {
      return time;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  // Get day name from enum
  const getDayName = (day: string) => {
    const days: { [key: string]: string } = {
      MONDAY: 'Luni',
      TUESDAY: 'Marți',
      WEDNESDAY: 'Miercuri',
      THURSDAY: 'Joi',
      FRIDAY: 'Vineri',
      SATURDAY: 'Sâmbătă',
      SUNDAY: 'Duminică'
    };
    return days[day] || day;
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestionare Program de Lucru
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gestionează programul de lucru și excepțiile
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6">
          Program de lucru pentru: {user?.firstName} {user?.lastName}
        </Typography>
      </Paper>
      
      {selectedProvider && (
        <Paper>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Program Regular" />
            <Tab label="Excepții" />
          </Tabs>
          
          <Divider />
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={openAddScheduleDialog}
                    disabled={!isAdmin}
                  >
                    Adaugă Program
                  </Button>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Zi</TableCell>
                        <TableCell>Ora de început</TableCell>
                        <TableCell>Ora de sfârșit</TableCell>
                        <TableCell align="center">Activ</TableCell>
                        {isAdmin && <TableCell align="center">Acțiuni</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {weeklySchedule?.regularSchedule.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={isAdmin ? 5 : 4} align="center">
                            Nu există înregistrări în program
                          </TableCell>
                        </TableRow>
                      ) : (
                        weeklySchedule?.regularSchedule.map((schedule) => (
                          <TableRow key={schedule.dayOfWeek}>
                            <TableCell>{getDayName(schedule.dayOfWeek)}</TableCell>
                            <TableCell>{formatTime(schedule.startTime)}</TableCell>
                            <TableCell>{formatTime(schedule.endTime)}</TableCell>
                            <TableCell align="center">
  <Switch 
    checked={schedule.active} 
    disabled={!isAdmin}
    onChange={async () => {
      if (!selectedProvider) return;
      
      try {
        setIsLoading(true);
        
        // Create updated schedule object with toggled active status
        const updatedSchedule = {
          ...schedule,
          active: !schedule.active
        };
        
        // Get all schedule entries
        const existingSchedules = weeklySchedule?.regularSchedule || [];
        
        // Find the index of the current schedule entry
        const scheduleIndex = existingSchedules.findIndex(
          s => s.dayOfWeek === schedule.dayOfWeek
        );
        
        // Update the schedule in the array
        let updatedSchedules;
        if (scheduleIndex !== -1) {
          updatedSchedules = [...existingSchedules];
          updatedSchedules[scheduleIndex] = updatedSchedule;
        } else {
          updatedSchedules = [...existingSchedules, updatedSchedule];
        }
        
        // Save the entire schedule
        await appointmentApi.setProviderSchedule({
          providerId: selectedProvider,
          scheduleEntries: updatedSchedules
        });
        
        // Refresh schedule data
        await fetchProviderSchedule(selectedProvider);
        
        setSnackbar({
          open: true,
          message: 'Status actualizat cu succes',
          severity: 'success'
        });
        
        setIsLoading(false);
      } catch (err) {
        setError('Eroare la actualizarea statusului');
        setIsLoading(false);
        setSnackbar({
          open: true,
          message: 'Eroare la actualizarea statusului',
          severity: 'error'
        });
      }
    }}
  />
</TableCell>
                            {isAdmin && (
                              <TableCell align="center">
                                <IconButton
                                  color="primary"
                                  onClick={() => openEditScheduleDialog(schedule)}
                                >
                                  <EditIcon />
                                </IconButton>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={openAddExceptionDialog}
                    disabled={!isAdmin}
                  >
                    Adaugă Excepție
                  </Button>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Tip</TableCell>
                        <TableCell>Interval orar (dacă este cazul)</TableCell>
                        <TableCell>Motiv</TableCell>
                        {isAdmin && <TableCell align="center">Acțiuni</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {weeklySchedule?.exceptions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={isAdmin ? 5 : 4} align="center">
                            Nu există excepții
                          </TableCell>
                        </TableRow>
                      ) : (
                        weeklySchedule?.exceptions.map((exception) => (
                          <TableRow key={exception.id}>
                            <TableCell>{formatDate(exception.exceptionDate)}</TableCell>
                            <TableCell>
                              {exception.type === ScheduleExceptionTypeEnum.DAY_OFF 
                                ? 'Zi Liberă' 
                                : 'Ore Speciale'}
                            </TableCell>
                            <TableCell>
                              {exception.type === ScheduleExceptionTypeEnum.SPECIAL_HOURS && 
                               exception.startTime && exception.endTime
                                ? `${formatTime(exception.startTime)} - ${formatTime(exception.endTime)}`
                                : 'N/A'}
                            </TableCell>
                            <TableCell>{exception.reason || 'Niciun motiv specificat'}</TableCell>
                            {isAdmin && (
                              <TableCell align="center">
                                <IconButton
                                  color="primary"
                                  onClick={() => openEditExceptionDialog(exception)}
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  onClick={() => exception.id && handleDeleteException(exception.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            )}
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
      )}
      
      {/* Schedule Dialog */}
      <Dialog 
        open={scheduleDialog} 
        onClose={handleScheduleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {scheduleFormData.id ? 'Editare Program' : 'Adăugare Program'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="day-select-label">Ziua săptămânii</InputLabel>
                <Select
                  labelId="day-select-label"
                  value={scheduleFormData.dayOfWeek}
                  onChange={(e) => handleScheduleChange('dayOfWeek', e.target.value)}
                  label="Ziua săptămânii"
                >
                  <MenuItem value="MONDAY">Luni</MenuItem>
                  <MenuItem value="TUESDAY">Marți</MenuItem>
                  <MenuItem value="WEDNESDAY">Miercuri</MenuItem>
                  <MenuItem value="THURSDAY">Joi</MenuItem>
                  <MenuItem value="FRIDAY">Vineri</MenuItem>
                  <MenuItem value="SATURDAY">Sâmbătă</MenuItem>
                  <MenuItem value="SUNDAY">Duminică</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ora de început"
                type="time"
                fullWidth
                value={scheduleFormData.startTime}
                onChange={(e) => handleScheduleChange('startTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }} // 5 minute intervals
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ora de sfârșit"
                type="time"
                fullWidth
                value={scheduleFormData.endTime}
                onChange={(e) => handleScheduleChange('endTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }} // 5 minute intervals
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={scheduleFormData.active}
                    onChange={(e) => handleScheduleChange('active', e.target.checked)}
                  />
                }
                label="Activ"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleScheduleDialogClose}>Anulează</Button>
          <Button 
            onClick={handleSaveSchedule} 
            variant="contained" 
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Salvează'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Exception Dialog */}
      <Dialog 
        open={exceptionDialog} 
        onClose={handleExceptionDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {exceptionFormData.id ? 'Editare Excepție' : 'Adăugare Excepție'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Data excepției"
                  value={new Date(exceptionFormData.exceptionDate)}
                  onChange={(date) => 
                    handleExceptionChange('exceptionDate', date ? format(date, 'yyyy-MM-dd') : '')
                  }
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="exception-type-label">Tipul excepției</InputLabel>
                <Select
                  labelId="exception-type-label"
                  value={exceptionFormData.type}
                  onChange={(e) => handleExceptionChange('type', e.target.value)}
                  label="Tipul excepției"
                >
                  <MenuItem value={ScheduleExceptionTypeEnum.DAY_OFF}>Zi liberă</MenuItem>
                  <MenuItem value={ScheduleExceptionTypeEnum.SPECIAL_HOURS}>Ore speciale</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {exceptionFormData.type === ScheduleExceptionTypeEnum.SPECIAL_HOURS && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ora de început"
                    type="time"
                    fullWidth
                    value={exceptionFormData.startTime || ''}
                    onChange={(e) => handleExceptionChange('startTime', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }} // 5 minute intervals
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Ora de sfârșit"
                    type="time"
                    fullWidth
                    value={exceptionFormData.endTime || ''}
                    onChange={(e) => handleExceptionChange('endTime', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }} // 5 minute intervals
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <TextField
                label="Motiv"
                fullWidth
                multiline
                rows={3}
                value={exceptionFormData.reason || ''}
                onChange={(e) => handleExceptionChange('reason', e.target.value)}
                placeholder="Explicați motivul pentru această excepție"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExceptionDialogClose}>Anulează</Button>
          <Button 
            onClick={handleSaveException} 
            variant="contained" 
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Salvează'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default WorkScheduleManagementPage;