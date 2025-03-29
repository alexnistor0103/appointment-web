import React, { useEffect, useState, useRef } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';
import { CountryEnum } from '../types';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Snackbar,
  Tab,
  Tabs,
  Card,
  CardContent,
  Badge
} from '@mui/material';
import {
  PhotoCamera,
  Save,
  Edit,
  Lock as LockIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    changePassword,
    uploadProfileImage,
    removeProfileImage,
    clearError
  } = useProfile();
  
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  
  // UI State
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Inițializare date profil
  useEffect(() => {
    fetchProfile();
  }, []);
  
  // Actualizare formular când se încarcă profilul
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phoneNumber
      });
    }
  }, [profile]);
  
  // Gestionează schimbarea tabului
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Gestionează schimbări în câmpurile formularului
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Gestionează schimbări în câmpurile de parolă
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Activează/dezactivează modul de editare
  const handleToggleEdit = () => {
    if (isEditing) {
      // Restaurează datele originale la anulare
      if (profile) {
        setFormData({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phoneNumber: profile.phoneNumber
        });
      }
    }
    setIsEditing(!isEditing);
  };
  
  // Salvează modificările profilului
  const handleSaveProfile = async () => {
    if (!profile) return;
    
    const updatedProfile = {
      ...profile,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber
    };
    
    const result = await updateProfile(updatedProfile);
    if (result) {
      setIsEditing(false);
      showSuccessNotification('Profilul a fost actualizat cu succes!');
    }
  };
  
  // Gestionează schimbarea parolei
  const handleChangePassword = async () => {
    // Validare parole
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Parolele nu se potrivesc');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Parola trebuie să aibă cel puțin 8 caractere');
      return;
    }
    
    setPasswordError(null);
    
    const success = await changePassword(passwordData);
    if (success) {
      // Reset password form
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      showSuccessNotification('Parola a fost schimbată cu succes!');
    }
  };
  
  // Gestionează selecția fișierului pentru imagine
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Încarcă imaginea de profil
  const handleUploadImage = async () => {
    if (!selectedFile) return;
    
    const result = await uploadProfileImage(selectedFile);
    if (result) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      showSuccessNotification('Imaginea de profil a fost actualizată cu succes!');
    }
  };
  
  // Șterge imaginea de profil
  const handleRemoveImage = async () => {
    if (!window.confirm('Sigur doriți să ștergeți imaginea de profil?')) return;
    
    const result = await removeProfileImage();
    if (result) {
      showSuccessNotification('Imaginea de profil a fost ștearsă!');
    }
  };
  
  // Afișează notificare de succes
  const showSuccessNotification = (message: string) => {
    setSuccessMessage(message);
    setSnackbarOpen(true);
  };
  
  // Închide notificarea
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  // Obține numele țării din enum
  const getCountryName = (country: CountryEnum) => {
    const countries: Record<CountryEnum, string> = {
      [CountryEnum.RO]: 'România',
      [CountryEnum.MD]: 'Moldova'
    };
    return countries[country] || country;
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Profilul meu
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => clearError()}>
          {error}
        </Alert>
      )}
      
      {passwordError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setPasswordError(null)}>
          {passwordError}
        </Alert>
      )}
      
      {isLoading && !profile ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={60} />
        </Box>
      ) : profile ? (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {/* Header cu background gradient */}
          <Box sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, #683a5f 0%, #9c5a91 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton 
                  aria-label="upload picture" 
                  component="label" 
                  sx={{ bgcolor: 'white', width: 32, height: 32 }}
                  size="small"
                >
                  <input 
                    hidden 
                    accept="image/*" 
                    type="file" 
                    onChange={handleFileChange} 
                    ref={fileInputRef}
                  />
                  <PhotoCamera fontSize="small" />
                </IconButton>
              }
            >
              <Avatar
                src={profile.profileImageUrl}
                alt={`${profile.firstName} ${profile.lastName}`}
                sx={{ width: 100, height: 100, border: '3px solid white' }}
              />
            </Badge>
            <Box sx={{ ml: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography variant="body1">
                {user?.roles?.includes('ROLE_ADMIN') 
                  ? 'Administrator'
                  : `Client din ${getCountryName(profile.country)}`}
              </Typography>
            </Box>
          </Box>
          
          {selectedFile && (
            <Box sx={{ p: 2, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2">
                {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </Typography>
              <Box>
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={handleUploadImage}
                  disabled={isLoading}
                  sx={{ mr: 1 }}
                >
                  {isLoading ? <CircularProgress size={20} /> : 'Încarcă'}
                </Button>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Anulează
                </Button>
              </Box>
            </Box>
          )}
          
          {/* Tabs pentru navigare */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="profile tabs"
              centered
            >
              <Tab 
                label="Informații Personale" 
                icon={<PersonIcon />} 
                iconPosition="start"
                id="profile-tab-0"
                aria-controls="profile-tabpanel-0"
              />
              <Tab 
                label="Securitate" 
                icon={<LockIcon />} 
                iconPosition="start"
                id="profile-tab-1"
                aria-controls="profile-tabpanel-1"
              />
            </Tabs>
          </Box>
          
          {/* Tab Informații Personale */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Informațiile mele
                </Typography>
                <IconButton 
                  onClick={handleToggleEdit}
                  color={isEditing ? 'primary' : 'default'}
                >
                  <Edit />
                </IconButton>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Prenume"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing || isLoading}
                    required
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nume"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing || isLoading}
                    required
                    InputProps={{
                      startAdornment: <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing || isLoading}
                    required
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Număr de telefon"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing || isLoading}
                    required
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Țară"
                    value={getCountryName(profile.country)}
                    disabled={true}
                  />
                </Grid>
              </Grid>
              
              {isEditing && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleToggleEdit}
                    sx={{ mr: 2 }}
                    disabled={isLoading}
                  >
                    Anulează
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSaveProfile}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
                    disabled={isLoading}
                  >
                    Salvează
                  </Button>
                </Box>
              )}
              
              {profile.profileImageUrl && !selectedFile && (
                <Box sx={{ mt: 4 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Opțiuni imagine profil
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleRemoveImage}
                    disabled={isLoading}
                  >
                    Șterge imaginea de profil
                  </Button>
                </Box>
              )}
            </Box>
          </TabPanel>
          
          {/* Tab Securitate */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Schimbare parolă
              </Typography>
              
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Pentru a vă schimba parola, vă rugăm să introduceți parola actuală și apoi parola nouă.
                    Parola trebuie să aibă cel puțin 8 caractere.
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Parola actuală"
                        name="oldPassword"
                        type="password"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        disabled={isLoading}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Parola nouă"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        disabled={isLoading}
                        required
                        helperText="Minim 8 caractere"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Confirmă parola nouă"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        disabled={isLoading}
                        required
                        error={passwordData.confirmPassword !== '' && 
                              passwordData.newPassword !== passwordData.confirmPassword}
                        helperText={passwordData.confirmPassword !== '' && 
                                  passwordData.newPassword !== passwordData.confirmPassword ? 
                                  'Parolele nu se potrivesc' : ''}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleChangePassword}
                      disabled={
                        isLoading || 
                        !passwordData.oldPassword || 
                        !passwordData.newPassword || 
                        !passwordData.confirmPassword ||
                        passwordData.newPassword.length < 8 ||
                        passwordData.newPassword !== passwordData.confirmPassword
                      }
                      startIcon={isLoading ? <CircularProgress size={20} /> : <LockIcon />}
                    >
                      Schimbă parola
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>
        </Paper>
      ) : (
        <Alert severity="info">
          Nu am putut încărca datele profilului. Vă rugăm să încercați din nou mai târziu.
        </Alert>
      )}
      
      {/* Snackbar pentru mesaje de succes */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={successMessage}
      />
    </Container>
  );
}

export default ProfilePage;