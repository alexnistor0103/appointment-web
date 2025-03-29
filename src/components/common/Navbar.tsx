// src/components/common/Navbar.tsx
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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
  Collapse,
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
  PersonAdd,
  ExpandLess,
  ExpandMore,
  AdminPanelSettings,
  Spa,
  Schedule
} from '@mui/icons-material';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  
  // Check if user has admin role
  const isAdmin = user?.roles && user.roles.includes('ROLE_ADMIN');
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const toggleAdminMenu = () => {
    setAdminMenuOpen(!adminMenuOpen);
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
    <Box sx={{
      background: 'linear-gradient(45deg,rgb(255, 0, 144) 0%,rgb(96, 0, 78) 100%)', // Gradient from primary to secondary
      color: 'white',
      py: 8,
      mb: 6,
      width: 250
    }} role="presentation">
      <List>
        <ListItem>
          <Typography variant="h6" color="primary">
            A la Program
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
                <ListItemText primary="Panou" />
              </ListItemButton>
            </ListItem>
            
            <ListItem>
              <ListItemButton onClick={() => handleNavigation('/appointments')}>
                <ListItemIcon>
                  <Event />
                </ListItemIcon>
                <ListItemText primary="Programările mele" />
              </ListItemButton>
            </ListItem>
            
            <ListItem>
              <ListItemButton onClick={() => handleNavigation('/appointments/new')}>
                <ListItemIcon>
                  <Schedule />
                </ListItemIcon>
                <ListItemText primary="Programare nouă" />
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
            
            {isAdmin && (
              <>
                <ListItem>
                  <ListItemButton onClick={toggleAdminMenu}>
                    <ListItemIcon>
                      <AdminPanelSettings />
                    </ListItemIcon>
                    <ListItemText primary="Administrare" />
                    {adminMenuOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={adminMenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton 
                      sx={{ pl: 4 }}
                      onClick={() => handleNavigation('/admin/services')}
                    >
                      <ListItemIcon>
                        <Spa />
                      </ListItemIcon>
                      <ListItemText primary="Servicii" />
                    </ListItemButton>
                  </List>
                </Collapse>
              </>
            )}
            
            <Divider />
            
            <ListItem>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary="Deconectare" />
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
                <ListItemText primary="Înregistrare" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{
  background: 'linear-gradient(90deg,rgb(138, 108, 136) 0%,rgb(97, 63, 89) 100%)',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
}}>
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
            A la Program
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
                    Panou
                  </Button>
                  
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/appointments"
                  >
                    Programări
                  </Button>
                  
                  {isAdmin && (
                    <Button
                      color="inherit"
                      onClick={handleMenu}
                      endIcon={<ExpandMore />}
                    >
                      Admin
                    </Button>
                  )}
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
                
                {isAdmin && !isMobile && (
                  <>
                    <Divider />
                    <MenuItem 
                      onClick={() => handleNavigation('/admin/services')}
                    >
                      Gestionare Servicii
                    </MenuItem>
                  </>
                )}
                
                <Divider />
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

export default Navbar