import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Container, Typography, Box, Paper, Grid, Card, 
  CardContent, CardHeader, Divider, Button, List, 
  ListItem, ListItemText, CircularProgress, Dialog, 
  DialogTitle, DialogContent, DialogActions, ListItemAvatar, Avatar, 
  DialogContentText, TextField, Checkbox, FormControlLabel, IconButton 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link, useNavigate, Navigate } from 'react-router-dom';

// Component for Patient Dashboard
const PatientDashboard = ({ appointments }) => {
  const [showDoctorDialog, setShowDoctorDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [reportFile, setReportFile] = useState(null);
  const [reportDescription, setReportDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleReportUpload = async () => {
    if (!reportFile) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('report', reportFile);
      formData.append('description', reportDescription);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/reports/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload report');
      }
      
      const data = await response.json();
      console.log('Report uploaded successfully', data);
      
      // Reset form and close dialog
      setReportFile(null);
      setReportDescription('');
      setShowUploadDialog(false);
      
      // Show success message
      alert('Report uploaded successfully!');
    } catch (error) {
      console.error('Error uploading report:', error);
      alert('Failed to upload report. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Upcoming Appointments</Typography>
          <List>
            {appointments.length > 0 ? (
              appointments.map((app) => (
                <ListItem key={app._id} divider>
                  <ListItemText
                    primary={`Dr. ${app.doctor.name}`}
                    secondary={`${new Date(app.date).toLocaleDateString()} at ${app.time} - Status: ${app.status}`}
                  />
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ mr: 1 }}
                    component={Link}
                    to={`/messages/${app.doctor._id}`}
                  >
                    Message
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    disabled={app.status !== 'approved'}
                    title={app.status !== 'approved' ? `Cannot start consultation: appointment is ${app.status}` : "Start your consultation"}
                    onClick={() => {
                      localStorage.setItem('activeAppointment', app._id);
                      navigate(`/messages/${app.doctor._id}`);
                    }}
                    sx={{
                      // Optional: Add visual styling for disabled state
                      opacity: app.status !== 'approved' ? 0.7 : 1
                    }}
                  >
                    Start Consultation
                  </Button>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No upcoming appointments" />
              </ListItem>
            )}
          </List>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Quick Actions" />
          <Divider />
          <CardContent>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ mb: 1 }}
              component={Link} 
              to="/medical-history"
            >
              VIEW MEDICAL HISTORY
            </Button>
            
            {appointments.length > 0 && (
              <>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 1 }}
                  onClick={() => setShowDoctorDialog(true)}
                >
                  MESSAGE DOCTOR
                </Button>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  sx={{ mb: 1 }}
                  onClick={() => setShowUploadDialog(true)}
                >
                  UPLOAD REPORT
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        {showDoctorDialog && (
          <Dialog open={showDoctorDialog} onClose={() => setShowDoctorDialog(false)}>
            <DialogTitle>Select a doctor to message</DialogTitle>
            <DialogContent>
              <List>
                {appointments.length > 0 ? (
                  [...new Map(appointments.map(app => [app.doctor._id, app.doctor])).values()].map((doctor) => (
                    <ListItem 
                      button 
                      key={doctor._id}
                      onClick={() => {
                        setShowDoctorDialog(false);
                        navigate(`/messages/${doctor._id}`);
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar>{doctor.name.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={`Dr. ${doctor.name}`} />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No doctors available. Book an appointment first." />
                  </ListItem>
                )}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDoctorDialog(false)}>Cancel</Button>
            </DialogActions>
          </Dialog>
        )}
        {/* Report Upload Dialog */}
        {showUploadDialog && (
          <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)}>
            <DialogTitle>Upload Medical Report</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                Upload your medical reports for your doctor to review.
              </DialogContentText>
              
              <TextField
                margin="dense"
                id="description"
                label="Report Description"
                fullWidth
                variant="outlined"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <input
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                id="report-file"
                type="file"
                onChange={(e) => setReportFile(e.target.files[0])}
              />
              <label htmlFor="report-file">
                <Button variant="contained" component="span">
                  Select File
                </Button>
              </label>
              
              {reportFile && (
                <Box mt={1}>
                  <Typography variant="body2">
                    Selected: {reportFile.name}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowUploadDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleReportUpload} 
                disabled={!reportFile || isUploading}
                variant="contained"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Grid>
    </Grid>
  );
};

// Component for Doctor Dashboard
const DoctorDashboard = ({ appointments, user }) => {
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate(); // Add this line to get the navigate function
  const weekdays = useMemo(() => 
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    []
  );

  // Fetch doctor's availability when dialog opens
  useEffect(() => {
    if (showAvailabilityDialog) {
      const fetchAvailability = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://localhost:5000/api/availability/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Initialize with existing data or empty structure for each day
          const availData = res.data.length > 0 ? res.data : [];

          // Make sure all days are represented
          const availByDay = {};
          weekdays.forEach(day => {
            availByDay[day] = { selected: false, slots: [] };
          });

          // Fill with existing data
          availData.forEach(item => {
            availByDay[item.day] = {
              selected: true,
              slots: item.slots.length > 0 ? item.slots : [{ startTime: '09:00', endTime: '17:00' }]
            };
          });

          setAvailability(availByDay);
        } catch (error) {
          console.error('Error fetching availability:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchAvailability();
    }
  }, [showAvailabilityDialog, user?.id, weekdays]);

  const handleUpdateAvailability = async () => {
    try {
      setUpdating(true);

      // Format the data for the API
      const formattedAvailability = Object.keys(availability)
        .filter(day => availability[day].selected)
        .map(day => ({
          day,
          slots: availability[day].slots
        }));

      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/availability', 
        { availability: formattedAvailability },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowAvailabilityDialog(false);
      alert('Availability updated successfully');
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability');
    } finally {
      setUpdating(false);
    }
  };

  const handleDayToggle = (day) => {
    setAvailability({
      ...availability,
      [day]: {
        // Safely access existing properties or use defaults
        ...(availability[day] || {}),
        selected: availability[day] ? !availability[day].selected : true,
        slots: (availability[day] && availability[day].slots && availability[day].slots.length) 
          ? availability[day].slots 
          : [{ startTime: '09:00', endTime: '17:00' }]
      }
    });
  };

  const handleAddSlot = (day) => {
    const updatedAvail = { ...availability };
    updatedAvail[day].slots.push({ startTime: '09:00', endTime: '17:00' });
    setAvailability(updatedAvail);
  };

  const handleRemoveSlot = (day, index) => {
    const updatedAvail = { ...availability };
    updatedAvail[day].slots.splice(index, 1);
    setAvailability(updatedAvail);
  };

  const handleSlotChange = (day, index, field, value) => {
    const updatedAvail = { ...availability };
    updatedAvail[day].slots[index][field] = value;
    setAvailability(updatedAvail);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Today's Appointments</Typography>
          <List>
            {appointments.length > 0 ? (
              appointments.map((app) => (
                <ListItem key={app._id} divider>
                  <ListItemText
                    primary={`Patient: ${app.patient.name}`}
                    secondary={`${new Date(app.date).toLocaleDateString()} at ${app.time} - Status: ${app.status}`}
                  />
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ mr: 1 }}
                    component={Link}
                    to={`/messages/${app.patient._id}`}
                  >
                    Message
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    disabled={app.status !== 'approved'}
                    title={app.status !== 'approved' ? `Cannot start consultation: appointment is ${app.status}` : "Start your consultation"}
                    onClick={() => {
                      localStorage.setItem('activeAppointment', app._id);
                      navigate(`/messages/${app.patient._id}`);
                    }}
                    sx={{
                      // Visual styling for disabled state
                      opacity: app.status !== 'approved' ? 0.7 : 1
                    }}
                  >
                    Start Consultation
                  </Button>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No appointments today" />
              </ListItem>
            )}
          </List>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Quick Actions" />
          <Divider />
          <CardContent>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ mb: 1 }}
              onClick={() => setShowAvailabilityDialog(true)}
            >
              UPDATE AVAILABILITY
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ mb: 1 }}
              component={Link}
              to="/patient-records"
            >
              PATIENT RECORDS
            </Button>
            <Button 
              fullWidth 
              variant="outlined"
              component={Link}
              to="/profile"
            >
              UPDATE PROFILE
            </Button>
          </CardContent>
        </Card>
        {showAvailabilityDialog && (
          <Dialog 
            open={showAvailabilityDialog} 
            onClose={() => setShowAvailabilityDialog(false)}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>Update Availability</DialogTitle>
            <DialogContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Select the days and time slots when you are available for appointments
                  </Typography>
                  
                  {weekdays.map((day) => (
                    <Box key={day} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={availability[day]?.selected || false}
                            onChange={() => handleDayToggle(day)}
                            name={day}
                          />
                        }
                        label={<Typography variant="h6">{day}</Typography>}
                      />
                      
                      {availability[day]?.selected && (
                        <Box sx={{ pl: 4, pt: 1 }}>
                          {availability[day].slots.map((slot, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <TextField
                                label="Start Time"
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => handleSlotChange(day, index, 'startTime', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ step: 300 }}
                                sx={{ mr: 2 }}
                              />
                              <TextField
                                label="End Time"
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => handleSlotChange(day, index, 'endTime', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ step: 300 }}
                                sx={{ mr: 2 }}
                              />
                              <IconButton 
                                onClick={() => handleRemoveSlot(day, index)}
                                disabled={availability[day].slots.length <= 1}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))}
                          
                          <Button 
                            startIcon={<AddIcon />}
                            onClick={() => handleAddSlot(day)}
                            size="small"
                            sx={{ mt: 1 }}
                          >
                            Add Time Slot
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowAvailabilityDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleUpdateAvailability} 
                variant="contained"
                disabled={updating || loading}
              >
                {updating ? 'Saving...' : 'Save Availability'}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Grid>
    </Grid>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/appointments/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    if (user) {
      fetchAppointments();
    }
  }, [user]);
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {user ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard` : 'Dashboard'}
      </Typography>
      {user && user.role === 'patient' && (
        <PatientDashboard appointments={appointments} />
      )}
      {user && user.role === 'doctor' && (
        <DoctorDashboard appointments={appointments} user={user} />
      )}
      {user && user.role === 'admin' && (
        <Navigate to="/admin" replace />
      )}
    </Container>
  );
}