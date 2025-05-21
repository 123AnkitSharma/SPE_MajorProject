import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import BookAppointment from './pages/BookAppointment';
import Messages from './pages/Messages';
import MedicalHistory from './pages/MedicalHistory';
import PatientReports from './pages/PatientReports';
import AdminDashboard from './pages/AdminDashboard'; // Import new admin components
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import DoctorAppointments from './pages/DoctorAppointments'; // Import DoctorAppointments component
import AboutUs from './pages/AboutUs'; // Import AboutUs component
import FAQs from './pages/FAQs'; // Import FAQs component
import HomePage from './pages/HomePage'; // Import HomePage component

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} exact />
        {/* Add these routes */}
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth isLogin={false} />} />
        {/* Protected routes for all authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:doctorId" element={<Messages />} />
          <Route path="/medical-history" element={<MedicalHistory />} />
        </Route>
        {/* Patient specific routes */}
        <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/medical-history" element={<MedicalHistory />} />
        </Route>
        {/* Doctor specific routes */}
        <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
          <Route path="/appointments" element={<DoctorAppointments />} />
          <Route path="/patient-records" element={<PatientReports />} />
        </Route>
        {/* Admin specific routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/reports" element={<AdminReports />} />
        </Route>
        {/* Public routes */}
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/faqs" element={<FAQs />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;