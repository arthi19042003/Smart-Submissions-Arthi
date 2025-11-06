import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './EmployerDashboard.css';

const EmployerDashboard = () => {
  const { user } = useAuth(); 

 const isEmployerProfileComplete = user?.companyAddress && user?.organization && user?.department;

  return (
    <div className="container">
    <div className="dashboard-wrapper">
        <h1>Welcome to Your Dashboard</h1>
        <p className="dash-subtitle">Manage your company profile, jobs, and candidates.</p>

      <div className="dashboard-grid">

          <div className="dashboard-card">
            <div className="card-content">
              <h3>Profile</h3>
              <p>Manage your personal information and work experience</p>
          <Link to="/profile" className="purple-btn">
                Edit Profile
              </Link>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-content">
              <h3>Resume</h3>
              <p>Upload and manage your resume documents</p>
              <Link to="/resume" className="purple-btn">
                Manage Resume
              </Link>
            </div>
          </div>

       
          <div className="dashboard-card">
            <div className="card-content">
              <h3>Employer Profile</h3>
              <p>Manage your company details, projects, and sponsors.</p>
              <Link to="/employer/profile" className="purple-btn">
                Manage Company Profile
              </Link>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-content">
              <h3>Profile Completion</h3>
              {isEmployerProfileComplete ? (
                <p className="status-complete">Profile information added</p>
              ) : (
                <p className="status-incomplete">Complete your profile to get started</p>
              )}
            
              {!isEmployerProfileComplete && (
                <Link to="/employer/profile" className="purple-btn">
                  Complete Profile
                </Link>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;