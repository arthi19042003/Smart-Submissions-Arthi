import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css'; 

const EmployerRegister = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    hiringManagerFirstName: '',
    hiringManagerLastName: '',
    email: '',
    hiringManagerPhone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerEmployer } = useAuth();
  const navigate = useNavigate();

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

    // --- Frontend Validation ---
    const requiredFields = ['companyName', 'hiringManagerFirstName', 'hiringManagerLastName', 'email', 'password', 'confirmPassword'];
    const emptyFields = requiredFields.filter(field => !formData[field].trim());

    if (emptyFields.length > 0) {
        setError(`Please fill in all required fields: ${emptyFields.join(', ')}`);
        return;
    }
    // --- End Validation ---

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const employerData = {
        companyName: formData.companyName.trim(),
        hiringManagerFirstName: formData.hiringManagerFirstName.trim(),
        hiringManagerLastName: formData.hiringManagerLastName.trim(),
        email: formData.email.trim(),
        hiringManagerPhone: formData.hiringManagerPhone.trim(),
        password: formData.password // No trim for password
    };

    const result = await registerEmployer(employerData);
    setLoading(false);

    if (result.success) {
      navigate('/employer/profile');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Employer Signup</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Company Name<span className="mandatory-star">*</span></label> {/* Added star */}
          <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required placeholder="Enter company name" />
        </div>
        <div className="form-group">
          <label>Hiring Manager First Name<span className="mandatory-star">*</span></label> {/* Added star */}
          <input type="text" name="hiringManagerFirstName" value={formData.hiringManagerFirstName} onChange={handleChange} required placeholder="Enter first name" />
        </div>
        <div className="form-group">
          <label>Hiring Manager Last Name<span className="mandatory-star">*</span></label> {/* Added star */}
          <input type="text" name="hiringManagerLastName" value={formData.hiringManagerLastName} onChange={handleChange} required placeholder="Enter last name" />
        </div>
        <div className="form-group">
          <label>Hiring Manager Email<span className="mandatory-star">*</span></label> {/* Added star */}
          <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter email" />
        </div>
        <div className="form-group">
          <label>Hiring Manager Phone</label> {/* Optional */}
          <input type="tel" name="hiringManagerPhone" value={formData.hiringManagerPhone} onChange={handleChange} placeholder="Enter phone number (optional)" />
        </div>
        <div className="form-group">
          <label>Password<span className="mandatory-star">*</span></label> {/* Added star */}
          <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Enter password (min 6 chars)" /> {/* Added hint */}
        </div>
        <div className="form-group">
          <label>Confirm Password<span className="mandatory-star">*</span></label> {/* Added star */}
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm password" />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing Up...' : 'Signup'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
       <p>
        Are you a candidate? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default EmployerRegister;