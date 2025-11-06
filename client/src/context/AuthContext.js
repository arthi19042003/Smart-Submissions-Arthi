import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log("AuthContext: Initial load - User state initialized from localStorage.");
      } catch (error) {
        console.error("AuthContext: Error parsing user data from localStorage", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
      }
    } else {
       console.log("AuthContext: Initial load - No token or user data found in localStorage.");
    }
    setLoading(false);
  }, []);

  const register = async (email, password) => { // This is now Candidate Register
    try {
      const response = await axios.post('/api/auth/register', { email, password });
      const { token, user: registeredUser } = response.data;

      if (!registeredUser || !registeredUser._id || !registeredUser.email) {
          console.error("AuthContext (Candidate Register): Invalid user data received.", registeredUser);
          return { success: false, error: 'Received invalid user data after registration.' };
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(registeredUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(registeredUser);
      console.log("AuthContext (Candidate Register): Registration successful.", registeredUser);
      return { success: true, user: registeredUser }; // Return user data
    } catch (error) {
      console.error("AuthContext (Candidate Register): Registration failed.", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

    // --- ADD THIS FUNCTION ---
   const registerEmployer = async (employerData) => {
     try {
       const response = await axios.post('/api/auth/register/employer', employerData);
       const { token, user: registeredUser } = response.data;

       if (!registeredUser || !registeredUser._id || !registeredUser.email || registeredUser.userType !== 'employer') {
           console.error("AuthContext (Employer Register): Invalid user data received.", registeredUser);
           return { success: false, error: 'Received invalid user data after employer registration.' };
       }

       localStorage.setItem('token', token);
       localStorage.setItem('user', JSON.stringify(registeredUser));
       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
       setUser(registeredUser);
       console.log("AuthContext (Employer Register): Registration successful.", registeredUser);
       return { success: true, user: registeredUser }; // Return user data
     } catch (error) {
       console.error("AuthContext (Employer Register): Registration failed.", error.response?.data || error.message);
       return {
         success: false,
         error: error.response?.data?.message || 'Employer registration failed'
       };
     }
   };
    // --- END ADD FUNCTION ---

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user: loggedInUser } = response.data;

      if (!loggedInUser || !loggedInUser._id || !loggedInUser.email || !loggedInUser.userType) { // Added userType check
          console.error("AuthContext (Login): Invalid user data received from server.", loggedInUser);
          return { success: false, error: 'Received invalid user data after login.' };
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(loggedInUser);
      console.log("AuthContext (Login): Login successful, user state updated.", loggedInUser);
      return { success: true, user: loggedInUser }; // Return the user object
    } catch (error) {
       console.error("AuthContext (Login): Login failed.", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    console.log("AuthContext (Logout): User logged out, state cleared.");
  };

  const updateUser = (userData) => {
    console.log("AuthContext (updateUser): Received data:", userData);
    if (!userData || typeof userData !== 'object' || !userData._id || !userData.email) {
      console.error("AuthContext (updateUser): Invalid or incomplete user data received. Aborting state update.", userData);
      return;
    }
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log("AuthContext (updateUser): User state and localStorage successfully updated.");
  };

  const value = {
    user,
    loading,
    register, // Candidate registration
    registerEmployer, // Employer registration
    login,
    logout,
    updateUser
  };

  console.log("AuthContext Provider rendering:", { loading, user: !!user });

  return <AuthContext.Provider value={value}>{!loading ? children : <div className="loading">Initializing...</div>}</AuthContext.Provider>;
};