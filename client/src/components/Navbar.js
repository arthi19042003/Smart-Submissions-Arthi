import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  const handleLogout = () => {
    setIsSidebarOpen(false); // Close sidebar on logout
    logout();
    navigate('/login'); // Navigate to login page on logout
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle state
  };
  
  // Closes sidebar when a link is clicked
  const handleLinkClick = () => {
    setIsSidebarOpen(false);
  };

  // Determine the correct dashboard link based on user type
  const dashboardLink = user
    ? user.userType === 'employer' ? '/employer/dashboard' : '/dashboard'
    : '/';

  // Reusable component for links to avoid duplication
  const renderLinks = () => (
    <>
      {user ? (
        // --- User Logged In ---
        <>
          {user.userType === 'candidate' ? (
            // --- Candidate Links ---
            <>
              <Link to="/dashboard" className="navbar-link" onClick={handleLinkClick}>Dashboard</Link>
              <Link to="/profile" className="navbar-link" onClick={handleLinkClick}>Profile</Link>
              <Link to="/resume" className="navbar-link" onClick={handleLinkClick}>Resume</Link>
            </>
          ) : user.userType === 'employer' ? (
            // --- Employer Links ---
            <>
              <Link to="/employer/dashboard" className="navbar-link" onClick={handleLinkClick}>Employer Dashboard</Link>
              <Link to="/employer/profile" className="navbar-link" onClick={handleLinkClick}>Company Profile</Link>
            </>
          ) : null}
          {/* Logout Button (UPDATED: Removed conflicting classes) */}
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </>
      ) : (
        // --- User Logged Out ---
        <>
          <Link to="/login" className="navbar-link" onClick={handleLinkClick}>Login</Link>
          <Link to="/register" className="navbar-link" onClick={handleLinkClick}>Candidate Signup</Link>
          <Link to="/register/employer" className="navbar-link" onClick={handleLinkClick}>Employer Signup</Link>
        </>
      )}
    </>
  );

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo links to appropriate dashboard if logged in, otherwise login page */}
          <Link to={dashboardLink} className="navbar-logo" onClick={handleLinkClick}>
            Smart Submissions
          </Link>

          {/* --- DESKTOP MENU (Hidden on mobile) --- */}
          <div className="navbar-menu-desktop">
            {renderLinks()}
          </div>

          {/* --- HAMBURGER MENU (Hidden on desktop) --- */}
          <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle menu">
            {/* These spans will become the hamburger bars */}
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </nav>

      {/* --- SIDEBAR OVERLAY (dims background) --- */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
       ></div>
      
      {/* --- SIDEBAR MENU (slides in) --- */}
      <div className={`sidebar-menu ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">Menu</span>
          <button className="sidebar-close" onClick={toggleSidebar}>&times;</button>
        </div>
        <div className="sidebar-links">
          {renderLinks()}
        </div>
      </div>
    </>
  );
};

export default Navbar;