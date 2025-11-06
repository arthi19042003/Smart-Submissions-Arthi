import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      const targetDashboard = user.userType === 'employer' ? '/employer/dashboard' : '/dashboard';
      console.log(`Login Page: User already logged in (${user.email}, type: ${user.userType}), redirecting to ${targetDashboard}`);
      navigate(targetDashboard, { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success && result.user) {
      if (result.user.userType === 'employer') {
        console.log("Login successful (Employer), navigating to /employer/dashboard");
        navigate('/employer/dashboard');
      } else {
        console.log("Login successful (Candidate), navigating to /dashboard");
        navigate('/dashboard');
      }
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
  };

  if (authLoading || (!authLoading && user)) {
    return <div className="loading">Loading...</div>;
  }

  return (
    
    <div className="auth-wrapper"> 
    <div className="auth-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>
          Don't have an account? <Link to="/register">Register as Candidate</Link> or <Link to="/register/employer">Register as Employer</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;