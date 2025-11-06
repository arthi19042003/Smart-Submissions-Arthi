// server/models/Employer.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const EmployerSchema = new mongoose.Schema({
  email: { // For login
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: { // To explicitly identify as employer
      type: String,
      default: 'employer',
      enum: ['employer'] // Only allow 'employer'
  },
  // --- Employer Profile Fields ---
  companyName: { type: String, default: '' },
  hiringManagerFirstName: { type: String, default: '' },
  hiringManagerLastName: { type: String, default: '' },
  hiringManagerPhone: { type: String, default: '' },
  address: { type: String }, // General address (can be personal or company initially)
  companyWebsite: { type: String },
  companyPhone: { type: String },
  companyAddress: { type: String },
  companyLocation: { type: String },
  organization: { type: String },
  costCenter: { type: String },
  department: { type: String },
  projectSponsors: [{ type: String }],
  preferredCommunicationMode: { type: String, default: 'Email' },
  projects: [
    {
      projectName: { type: String },
      teamSize: { type: Number },
      teamMembers: [
        {
          firstName: { type: String },
          lastName: { type: String },
          email: { type: String },
          phone: { type: String },
          role: { type: String }
        }
      ]
    },
  ],
  // --- End Employer Profile Fields ---
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
EmployerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
EmployerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Employer', EmployerSchema); // Use 'Employer' as the model name