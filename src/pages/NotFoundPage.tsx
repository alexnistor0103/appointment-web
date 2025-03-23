import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFoundPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          my: 8,
          p: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <Typography variant="h1" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
          404
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom>
          Pagină Negăsită
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Pagina pe care o cauți este posibil să fi fost eliminată, să-și fi schimbat numele
          sau este temporar indisponibilă.
        </Typography>
        
        <Box component="img" 
          src="/api/placeholder/400/300" 
          alt="Pagină negăsită" 
          sx={{ 
            width: '100%',
            maxWidth: 400,
            my: 4
          }}
        />
        
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          color="primary"
          startIcon={<HomeIcon />}
          size="large"
        >
          Înapoi la Pagina Principală
        </Button>
      </Paper>
    </Container>
  );
};

export default NotFoundPage;