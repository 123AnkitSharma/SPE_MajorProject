// Add these imports
import { Box, Paper, Container, Typography, TextField, Button, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

const LoginContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  background: `
    linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8)),
    url('/images/medical-background.jpg')
  `,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

export default function Login() {
  // Your existing login component logic
  
  return (
    <LoginContainer maxWidth="100%">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: 450,
          borderRadius: 2,
        }}
      >
        <Box 
          component="img"
          src="/images/logo.svg" 
          alt="TeleMed Logo"
          sx={{ height: 80, mb: 3 }}
        />
        
        <Typography component="h1" variant="h4" fontWeight="medium" sx={{ mb: 3 }}>
          Welcome to TeleMed
        </Typography>
        
        <Box 
          component="img"
          src="/images/doctor-illustration.svg" 
          alt="Doctor illustration"
          sx={{ height: 150, mb: 3, width: '100%', objectFit: 'contain' }}
        />
        
        {/* Your login form fields */}
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          variant="outlined"
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          variant="outlined"
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
        >
          Sign In
        </Button>
        
        <Divider sx={{ width: '100%', mt: 2, mb: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Button color="secondary" href="/register">
            Don't have an account? Sign Up
          </Button>
        </Box>
      </Paper>
    </LoginContainer>
  );
}