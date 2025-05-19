import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Container, Typography, Box, Paper, Grid, Card, 
  CardContent, CardHeader, Divider, Button, List, 
  ListItem, ListItemText, CircularProgress, Dialog, 
  DialogTitle, DialogContent, DialogActions, ListItemAvatar, Avatar 
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
// Component for Patient Dashboard
const PatientDashboard = ({ appointments }) => {
  const [showDoctorDialog, setShowDoctorDialog] = useState(false);
  const navigate = useNavigate();
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
                  <Button variant="outlined" size="small">Join</Button>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No upcoming appointments" />
              </ListItem>
            )}
          </List>
          <Box mt={2}>
            <Button variant="contained" color="primary">Book New Appointment</Button>
          </Box>
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
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ mb: 1 }}
              component={Link} 
              to="/profile"
            >
              UPDATE PROFILE
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setShowDoctorDialog(true)}
            >
              MESSAGE DOCTOR
            </Button>
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
      </Grid>
    </Grid>
  );
};
// Component for Doctor Dashboard
const DoctorDashboard = ({ appointments }) => {
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
                  <Button variant="outlined" size="small" sx={{ mr: 1 }}>Join</Button>
                  <Button variant="outlined" size="small" color="secondary">Reschedule</Button>
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
            <Button fullWidth variant="outlined" sx={{ mb: 1 }}>Update Availability</Button>
            <Button fullWidth variant="outlined" sx={{ mb: 1 }}>Patient Records</Button>
            <Button fullWidth variant="outlined">Update Profile</Button>
          </CardContent>
        </Card>
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
        <DoctorDashboard appointments={appointments} />
      )}
      {user && user.role === 'admin' && (
        <Typography>Admin dashboard (implement admin features)</Typography>
      )}
    </Container>
  );
}