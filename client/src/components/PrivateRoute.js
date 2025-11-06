import { Navigate, useLocation } from 'react-router-dom'; // Import useLocation
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation(); // Get current location

  console.log(`PrivateRoute Check on ${location.pathname}: Loading=${loading}, User=${!!user}`); // <-- ADD LOG

  if (loading) {
    console.log(`PrivateRoute (${location.pathname}): Still loading authentication state.`); // <-- ADD LOG
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
     console.log(`PrivateRoute (${location.pathname}): No user found, redirecting to /login.`); // <-- ADD LOG
     // Pass the current location to redirect back after login
     return <Navigate to="/login" state={{ from: location }} replace />; // Modified redirect
  }

  // If user is loaded and exists, render the child component
  return children;
};

export default PrivateRoute;