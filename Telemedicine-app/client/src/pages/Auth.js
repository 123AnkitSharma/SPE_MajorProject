import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem, Paper
} from '@mui/material';
export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    specialization: '',
    license: ''
  });
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `http://localhost:5000/api/auth/${isLogin ? 'login' : 'register'}`;
    try {
      // Add console logs for debugging
      console.log('Submitting:', isLogin ? 'login' : 'register');
      console.log('Form data:', formData);
      const payload = isLogin ? 
        { email: formData.email, password: formData.password } : 
        formData.role === 'doctor' ? 
          { 
            ...formData, 
            profile: { specialization: formData.specialization, license: formData.license } 
          } : 
          formData;
      // Log the payload being sent
      console.log('Sending payload:', payload);
      const res = await axios.post(url, payload);
      localStorage.setItem('token', res.data.token);
      // Decode token to get role
      const base64Url = res.data.token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const tokenPayload = JSON.parse(window.atob(base64));
      localStorage.setItem('role', tokenPayload.role);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err.response?.data);
      alert(err.response?.data?.error || "Error");
    }
  };
  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center">
          {isLogin ? 'Login' : 'Register'}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {!isLogin && (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          {!isLogin && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleChange}
              >
                <MenuItem value="patient">Patient</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
              </Select>
            </FormControl>
          )}
          {!isLogin && formData.role === 'doctor' && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Specialization"
                name="specialization"
                value={formData.specialization || ''}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="License Number"
                name="license"
                value={formData.license || ''}
                onChange={handleChange}
              />
            </>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}