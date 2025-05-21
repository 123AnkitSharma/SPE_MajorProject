import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  Container,
  Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HomeIcon from '@mui/icons-material/Home'; // Add this import

export default function Navbar() {
  const { user, logout } = useAuth();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const navigate = useNavigate();
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  const navItems = {
    patient: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Book Appointment', path: '/book-appointment' },
      { label: 'Messages', path: '/messages' },
      { label: 'My Profile', path: '/profile' }
    ],
    doctor: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Appointments', path: '/appointments' },
      { label: 'Messages', path: '/messages' },
      { label: 'My Profile', path: '/profile' }
    ],
    admin: [
      { label: 'Dashboard', path: '/admin' },
      { label: 'Users', path: '/users' },
      { label: 'Reports', path: '/reports' }
    ]
  };
  const currentNavItems = user ? navItems[user.role] || [] : [];
  
  // Define public links that should be visible to all users
  const publicLinks = [
    { label: 'Home', path: user ? '/dashboard' : '/' }, // Add Home button
    { label: 'About Us', path: '/about-us' },
    { label: 'FAQs', path: '/faqs' },
    { label: 'Contact Us', path: '#contact' }
  ];
  
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Desktop Logo */}
          <MedicalServicesIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to={user ? "/dashboard" : "/"}
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            TeleMed
          </Typography>
          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {/* Add public links to mobile menu */}
              {publicLinks.map((item) => (
                <MenuItem key={item.path} onClick={() => {
                  handleCloseNavMenu();
                  navigate(item.path);
                }}>
                  <Typography textAlign="center">{item.label}</Typography>
                </MenuItem>
              ))}
              {user && currentNavItems.map((item) => (
                <MenuItem key={item.path} onClick={() => {
                  handleCloseNavMenu();
                  navigate(item.path);
                }}>
                  <Typography textAlign="center">{item.label}</Typography>
                </MenuItem>
              ))}
              {user && (
                <MenuItem onClick={logout}>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>
          {/* Mobile Logo */}
          <MedicalServicesIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to={user ? "/dashboard" : "/"}
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            TeleMed
          </Typography>
          {/* Desktop Menu Items */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {user && currentNavItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
          
          {/* Public Links (Home, About Us, FAQs, Contact Us) in desktop view */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
            {publicLinks.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                sx={{ color: 'white' }}
                startIcon={item.label === 'Home' ? <HomeIcon /> : null} // Add home icon to Home button
              >
                {item.label}
              </Button>
            ))}
          </Box>
          
          {/* User Menu */}
          {user ? (
            <Box sx={{ flexGrow: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mr: 1 }}>{user.name || user.role}</Typography>
                <Button color="inherit" onClick={logout}>Logout</Button>
              </Box>
            </Box>
          ) : (
            null
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}