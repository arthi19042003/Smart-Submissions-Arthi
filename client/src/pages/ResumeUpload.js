import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResumeUpload.css'; 

const ResumeUpload = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // New state for the delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);


  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await axios.get('/api/resume');
      setResumes(response.data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Only PDF, DOC, and DOCX files are allowed' });
        setSelectedFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB' });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setMessage({ type: '', text: '' });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('title', title || 'My Resume');

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post('/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: 'Resume uploaded successfully!' });
      setSelectedFile(null);
      setTitle('');
      fetchResumes();

      const fileInput = document.getElementById('resume-file');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to upload resume'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (id) => {
    try {
      await axios.put(`/api/resume/active/${id}`);
      setMessage({ type: 'success', text: 'Resume set as active' });
      fetchResumes();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to set active resume'
      });
    }
  };

  // --- DELETE MODAL LOGIC ---
  const handleDelete = (id) => {
    // This just opens the modal
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    // This closes the modal
    setPendingDeleteId(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    // This runs the actual delete logic
    if (!pendingDeleteId) return;

    const id = pendingDeleteId;
    setPendingDeleteId(null);
    setShowDeleteModal(false);

    try {
      await axios.delete(`/api/resume/${id}`);
      setMessage({ type: 'success', text: 'Resume deleted successfully' });
      fetchResumes();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete resume'
      });
    }
  };
  // --- END DELETE MODAL LOGIC ---


  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    // UPDATED: Use the new page background class
    <div className="resume-page-bg">
      <div className="resume-container">
        <h1>Resume Management</h1>

        <div className="card">
          <h2>Upload New Resume</h2>
          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label>Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Software Engineer Resume"
              />
            </div>
            <div className="form-group">
              <label>Resume File (PDF, DOC, DOCX - Max 5MB)</label>
              <input
                id="resume-file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </div>
            {selectedFile && (
              <p className="file-info">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
            {message.text && (
              <div className={message.type === 'success' ? 'success' : 'error'}>
                {message.text}
              </div>
            )}
            {/* UPDATED: Use the new 'purple-btn' class */}
            <button type="submit" className="purple-btn" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Resume'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Your Resumes</h2>
          {resumes.length === 0 ? (
            <p className="no-resumes">No resumes uploaded yet</p>
          ) : (
            <div className="resumes-list">
              {resumes.map((resume) => (
                <div key={resume._id} className={`resume-item ${resume.isActive ? 'active' : ''}`}>
                  <div className="resume-info">
                    <h3>{resume.title}</h3>
                    <p className="resume-meta">
                      {resume.fileName} • {formatFileSize(resume.fileSize)}
                    </p>
                    <p className="resume-date">Uploaded: {formatDate(resume.uploadedAt)}</p>
                    {resume.isActive && <span className="active-badge">Active</span>}
                  </div>
                  <div className="resume-actions">
                    {!resume.isActive && (
                      <button
                        onClick={() => handleSetActive(resume._id)}
                        // UPDATED: Use the new secondary purple button class
                        className="btn-secondary-purple"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      // UPDATED: Calls the new handleDelete which opens the modal
                      onClick={() => handleDelete(resume._id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- DELETE CONFIRMATION MODAL --- */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete this resume? This action cannot be undone.</p>
              <div className="modal-buttons">
                <button onClick={cancelDelete} className="btn-secondary-purple">
                  Cancel
                </button>
                <button onClick={confirmDelete} className="btn-danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResumeUpload;