import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container, Typography, Box, Paper, Grid, TextField,
  Button, FormControl, InputLabel, Select, MenuItem,
  Card, CardContent, CardActions, Avatar, Snackbar, Alert,
  CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  // Sample time slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/doctors');
        setDoctors(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setAlert({
        open: true,
        message: 'Please fill all the fields',
        severity: 'error'
      });
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/appointments', {
        doctor: selectedDoctor,
        patient: user.id,
        date: selectedDate,
        time: selectedTime
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlert({
        open: true,
        message: 'Appointment booked successfully',
        severity: 'success'
      });
      // Reset form
      setSelectedDoctor('');
      setSelectedDate(null);
      setSelectedTime('');
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error(err);
      setAlert({
        open: true,
        message: 'Failed to book appointment',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Book an Appointment
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Select Doctor
            </Typography>
          </Grid>
          {doctors.length > 0 ? (
            doctors.map((doctor) => (
              <Grid item xs={12} sm={6} md={4} key={doctor._id}>
                <Card 
                  variant={selectedDoctor === doctor._id ? "outlined" : "elevation"}
                  sx={{ 
                    border: selectedDoctor === doctor._id ? '2px solid #1976d2' : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedDoctor(doctor._id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Avatar sx={{ width: 60, height: 60, mb: 2 }}>
                        {doctor.name.charAt(0)}
                      </Avatar>
                      <Typography variant="h6">Dr. {doctor.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {doctor.profile?.specialization || 'General Medicine'}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary" 
                      fullWidth
                      variant={selectedDoctor === doctor._id ? "contained" : "text"}
                    >
                      {selectedDoctor === doctor._id ? 'Selected' : 'Select'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography>No doctors available at the moment</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
      {selectedDoctor && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Date and Time
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Appointment Date"
                    value={selectedDate}
                    onChange={setSelectedDate}
                    minDate={new Date()}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Time Slot</InputLabel>
                  <Select
                    value={selectedTime}
                    label="Time Slot"
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    {timeSlots.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || !selectedDate || !selectedTime}
              >
                {submitting ? 'Booking...' : 'Book Appointment'}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}