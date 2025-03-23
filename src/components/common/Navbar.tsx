import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  Event,
  Home,
  Login,
  Logout,
  Person,
  PersonAdd
} from '@mui/icons-material';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/');
  };
  
  const handleNavigation = (path: string) => {
    navigate(path);
    handleClose();
    setDrawerOpen(false);
  };
  
  // Drawer content
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        <ListItem>
          <Typography variant="h6" color="primary">
            Aplicație Programări
          </Typography>
        </ListItem>
        <Divider />
        
        <ListItem>
          <ListItemButton onClick={() => handleNavigation('/')}>
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Prezentare" />
          </ListItemButton>
        </ListItem>
        
        {isAuthenticated ? (
          <>
            <ListItem>
              <ListItemButton onClick={() => handleNavigation('/dashboard')}>
                <ListItemIcon>
                  <Dashboard />
                </ListItemIcon>
                <ListItemText primary="Acasă" />
              </ListItemButton>
            </ListItem>
            
            <ListItem>
              <ListItemButton onClick={() => handleNavigation('/appointments')}>
                <ListItemIcon>
                  <Event />
                </ListItemIcon>
                <ListItemText primary="Programări" />
              </ListItemButton>
            </ListItem>
            
            <ListItem>
              <ListItemButton onClick={() => handleNavigation('/profile')}>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText primary="Profil" />
              </ListItemButton>
            </ListItem>
            
            <Divider />
            
            <ListItem>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary="Deconectează-te" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem>
              <ListItemButton onClick={() => handleNavigation('/login')}>
                <ListItemIcon>
                  <Login />
                </ListItemIcon>
                <ListItemText primary="Conectare" />
              </ListItemButton>
            </ListItem>
            
            <ListItem>
              <ListItemButton onClick={() => handleNavigation('/register')}>
                <ListItemIcon>
                  <PersonAdd />
                </ListItemIcon>
                <ListItemText primary="Înregistrează-te" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 800
            }}
          >
            Dasha's Nails
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex' }}>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/"
              >
                Prezentare
              </Button>
              
              {isAuthenticated ? (
                <>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/dashboard"
                  >
                    Acasă
                  </Button>
                  
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/appointments"
                  >
                    Programări
                  </Button>
                </>
              ) : null}
            </Box>
          )}
          
          {isAuthenticated ? (
            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                {user?.firstName ? (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {user.firstName[0]}
                  </Avatar>
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
              
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => handleNavigation('/profile')}>
                  Profil
                </MenuItem>
                <MenuItem onClick={handleLogout}>Deconectare</MenuItem>
              </Menu>
            </div>
          ) : (
            !isMobile && (
              <div>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/login"
                >
                  Conectare
                </Button>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/register"
                >
                  Înregistrează-te
                </Button>
              </div>
            )
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;