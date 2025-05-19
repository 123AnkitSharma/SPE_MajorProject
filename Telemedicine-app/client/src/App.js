import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import BookAppointment from './pages/BookAppointment';
import Messages from './pages/Messages';
import MedicalHistory from './pages/MedicalHistory'; // Import MedicalHistory component
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
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Auth />} />
        {/* Protected routes for all authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:doctorId" element={<Messages />} />
          <Route path="/medical-history" element={<MedicalHistory />} /> {/* Add this line */}
        </Route>
        {/* Patient specific routes */}
        <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/medical-history" element={<MedicalHistory />} /> {/* Add medical-history route */}
        </Route>
        {/* Doctor specific routes */}
        <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
          <Route path="/appointments" element={<Dashboard />} />
        </Route>
        {/* Admin specific routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/users" element={<div>User Management (implement)</div>} />
          <Route path="/reports" element={<div>Reports (implement)</div>} />
        </Route>
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