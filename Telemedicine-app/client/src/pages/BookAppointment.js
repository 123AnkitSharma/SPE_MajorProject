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
  
  // New state variables for doctor availability
  const [doctorAvailability, setDoctorAvailability] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  
  // Fetch all doctors
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

  // Fetch doctor availability when a doctor is selected
  useEffect(() => {
    if (selectedDoctor) {
      const fetchDoctorAvailability = async () => {
        setLoadingAvailability(true);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://localhost:5000/api/availability/${selectedDoctor}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setDoctorAvailability(res.data);
        } catch (err) {
          console.error('Error fetching doctor availability:', err);
          setAlert({
            open: true,
            message: 'Could not fetch doctor availability',
            severity: 'error'
          });
        } finally {
          setLoadingAvailability(false);
        }
      };
      fetchDoctorAvailability();
      setSelectedDate(null); // Reset date when doctor changes
      setSelectedTime(''); // Reset time when doctor changes
    }
  }, [selectedDoctor]);
  
  // Check if a date is available for the selected doctor
  const isDateAvailable = (date) => {
    if (!doctorAvailability || doctorAvailability.length === 0) return false;
    
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
    return doctorAvailability.some(avail => avail.day === dayOfWeek);
  };
  
  // Update available time slots when date changes
  useEffect(() => {
    if (selectedDate && doctorAvailability && doctorAvailability.length > 0) {
      // Get day of week from selected date
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][selectedDate.getDay()];
      
      // Find doctor availability for this day
      const dayAvailability = doctorAvailability.find(avail => avail.day === dayOfWeek);
      
      if (dayAvailability && dayAvailability.slots.length > 0) {
        // Generate time slots based on doctor's availability
        const slots = [];
        
        dayAvailability.slots.forEach(slot => {
          // Convert 24h format to 12h format for display
          const convertTo12HFormat = (time24h) => {
            const [hours, minutes] = time24h.split(':');
            const h = parseInt(hours);
            const suffix = h >= 12 ? 'PM' : 'AM';
            const h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
            return `${h12.toString().padStart(2, '0')}:${minutes} ${suffix}`;
          };
          
          // Generate hourly slots between start and end time
          const generateHourlySlots = (start, end) => {
            const result = [];
            const startTime = new Date(`2000-01-01T${start}`);
            const endTime = new Date(`2000-01-01T${end}`);
            
            // Create hourly increments
            while (startTime < endTime) {
              const timeString = startTime.toTimeString().slice(0, 5);
              result.push(convertTo12HFormat(timeString));
              startTime.setHours(startTime.getHours() + 1);
            }
            
            return result;
          };
          
          // Add all slots from this availability window
          slots.push(...generateHourlySlots(slot.startTime, slot.endTime));
        });
        
        setAvailableTimeSlots(slots);
      } else {
        // No slots available for this day
        setAvailableTimeSlots([]);
      }
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, doctorAvailability]);

  // Handle form submission
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
    
    // Additional validation to ensure the selected time is available
    if (availableTimeSlots.length > 0 && !availableTimeSlots.includes(selectedTime)) {
      setAlert({
        open: true,
        message: 'The selected time is not available',
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
        message: err.response?.data?.error || 'Failed to book appointment',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Custom date picker filter function
  const shouldDisableDate = (date) => {
    // Disable past dates
    if (date < new Date().setHours(0, 0, 0, 0)) {
      return true;
    }
    
    // Disable dates where doctor is not available
    return !isDateAvailable(date);
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
      
      {loadingAvailability && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 2 }}>Loading doctor's availability...</Typography>
        </Box>
      )}
      
      {selectedDoctor && !loadingAvailability && (
        <Paper sx={{ p: 3 }}>
          {doctorAvailability.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              This doctor has not set their availability yet. Please select another doctor.
            </Alert>
          ) : (
            <>
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
                        shouldDisableDate={shouldDisableDate}
                        minDate={new Date()}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth disabled={!selectedDate || availableTimeSlots.length === 0}>
                      <InputLabel>Time Slot</InputLabel>
                      <Select
                        value={selectedTime}
                        label="Time Slot"
                        onChange={(e) => setSelectedTime(e.target.value)}
                      >
                        {availableTimeSlots.length > 0 ? (
                          availableTimeSlots.map((time) => (
                            <MenuItem key={time} value={time}>
                              {time}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>No available slots</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting || !selectedDate || !selectedTime || availableTimeSlots.length === 0}
                  >
                    {submitting ? 'Booking...' : 'Book Appointment'}
                  </Button>
                </Box>
              </Box>
            </>
          )}
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