const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
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
    // ---- ADD THIS FIELD ----
  userType: {
      type: String,
      enum: ['candidate', 'employer'], // Only allow these values
      required: true,
      default: 'candidate' // Default to candidate if not specified
  },
    // ---- END ADD ----
  profile: { // Candidate Profile
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    previousexperience: { type: String, default: '' },
    bio: { type: String, default: '' },
    skills: [{ type: String }],
    experience: [{ /* ... existing structure ... */ }],
    education: [{ /* ... existing structure ... */ }]
  },
  // The redundant employerProfile object has been removed.
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);