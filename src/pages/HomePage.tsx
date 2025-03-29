import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Stack
} from '@mui/material';
import { 
  EventAvailable, 
  CalendarToday, 
  AccessTime, 
  Notifications 
} from '@mui/icons-material';
import nailsImage from '/src/assets/nails.png';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
  sx={{
    background: 'linear-gradient(45deg,rgb(191, 150, 172) 0%,rgb(104, 58, 95) 100%)', // Gradient from primary to secondary
    color: 'white',
    py: 8,
    mb: 6
  }}
>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
            <Typography 
  variant="h3" 
  component="h1" 
  gutterBottom
  sx={{ 
    textShadow: '2px 2px 4px rgba(142, 68, 173, 0.3)' 
  }}
>
  Cele mai bune unghii vin la pachet cu cel mai bun serviciu de programări
</Typography>
              <Typography variant="h6" paragraph>
                Rezervă serviciile tale pentru unghii online, gestionează-ți programul și primește reminder-uri. Platforma noastră face programarea simplă.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  color="secondary"
                  onClick={handleGetStarted}
                >
                  Începe
                </Button>
                {!isAuthenticated && (
                  <Button 
                    variant="outlined" 
                    size="large" 
                    color="inherit"
                    onClick={() => navigate('/login')}
                  >
                    Conectare
                  </Button>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={nailsImage}
              alt="Programare salon de unghii"
              sx={{
                width: '100%',
                borderRadius: 2,
                boxShadow: 0
              }}
            />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Caracteristicile Noastre
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
          Tot ce ai nevoie pentru a-ți gestiona programările
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <EventAvailable fontSize="large" color="primary" />
              </Box>
              <CardContent>
                <Typography variant="h6" component="h3" align="center">
                  Rezervare Ușoară
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Programează întâlniri cu tehnicianul tău preferat de unghii în câteva secunde.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <CalendarToday fontSize="large" color="primary" />
              </Box>
              <CardContent>
                <Typography variant="h6" component="h3" align="center">
                  Gestionează Calendarul
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Vizualizează și gestionează toate programările tale într-un singur loc.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <AccessTime fontSize="large" color="primary" />
              </Box>
              <CardContent>
                <Typography variant="h6" component="h3" align="center">
                  Disponibilitate în Timp Real
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Vezi disponibilitatea în timp real a tehnicienilor și serviciilor.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Notifications fontSize="large" color="primary" />
              </Box>
              <CardContent>
                <Typography variant="h6" component="h3" align="center">
                  Reminder-uri
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Primește reminder-uri automate înainte de programare.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom>
            Ești gata să simplifici programările la salonul de unghii?
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
            Alătură-te miilor de clienți mulțumiți care se bucură deja de platforma noastră.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              size="large" 
              color="primary"
              onClick={handleGetStarted}
            >
              {isAuthenticated ? 'Mergi la Panou de Control' : 'Înregistrează-te Acum'}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
