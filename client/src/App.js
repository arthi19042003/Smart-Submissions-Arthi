import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import EmployerRegister from './pages/EmployerRegister';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // Candidate Dashboard
import EmployerDashboard from './pages/EmployerDashboard'; // Employer Dashboard
import Profile from './pages/Profile'; // Candidate Profile
import ResumeUpload from './pages/ResumeUpload'; // Candidate Resume
import EmployerProfile from './pages/EmployerProfile'; // Employer Company Profile
import './App.css';


const AuthLayout = () => (
  <div className="auth-wrapper">
    <Outlet /> 
  </div>
);


const AppLayout = () => (
  <main className="app-content">
    <Outlet />
  </main>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            {/* --- Public Routes --- */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/employer" element={<EmployerRegister />} />
              <Route path="/" element={<Login />} />
            </Route>

            {/* --- Protected Routes --- */}
            <Route element={<AppLayout />}>
              <Route
                path="/dashboard"
                element={<PrivateRoute><Dashboard /></PrivateRoute>}
              />
              <Route
                path="/profile"
                element={<PrivateRoute><Profile /></PrivateRoute>}
              />
              <Route
                path="/resume"
                element={<PrivateRoute><ResumeUpload /></PrivateRoute>}
              />
              <Route
                path="/employer/dashboard"
                element={<PrivateRoute><EmployerDashboard /></PrivateRoute>}
              />
              <Route
                path="/employer/profile"
                element={<PrivateRoute><EmployerProfile /></PrivateRoute>}
              />
            </Route>

           
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;