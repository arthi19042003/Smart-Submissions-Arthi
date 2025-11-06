import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css'; 

const Dashboard = () => {
  const { user } = useAuth();

 
  const isProfileComplete = user?.profile?.firstName && user?.profile?.phone;

  return (
   
    <div className="dashboard-wrapper">
      <h1>Welcome to Your Dashboard</h1>
       <p className="dash-subtitle">Manage your profile, resume, and interviews</p>

    
      <div className="dashboard-grid">

       
        <div className="dashboard-card">
          <h3>Profile</h3>
          <p>Manage your personal information and work experience</p>
        
          <Link to="/profile" className="purple-btn">
            Edit Profile
          </Link>
        </div>

        
        <div className="dashboard-card">
          <h3>Resume</h3>
          <p>Upload and manage your resume documents</p>
          
          <Link to="/resume" className="purple-btn">
            Manage Resume
          </Link>
        </div>

        
        <div className="dashboard-card">
          <h3>Profile Completion</h3>
          {isProfileComplete ? (
            <p className="status-complete">Profile information added</p>
          ) : (
            <p className="status-incomplete">Complete your profile to get started</p>
          )}
          {!isProfileComplete && (
            <Link to="/profile" className="purple-btn">
              Complete Profile
            </Link>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;