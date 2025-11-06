// server/routes/profile.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User'); // Candidate Model
const Employer = require('../models/Employer'); // Employer Model

// =================================================================
// === ROUTE FOR EMPLOYER PROFILE UPDATE ===
// =================================================================
// @route   PUT api/profile/employer
// @desc    Update an employer's profile
// @access  Private (Employers Only)
router.put('/employer', auth, async (req, res) => {
  // --- Check if logged-in user is an employer ---
  if (req.userType !== 'employer') {
      console.log(`[${new Date().toISOString()}] PUT /api/profile/employer DENIED: User (${req.user?.email || 'ID:'+req.userId}) is not an employer (type: ${req.userType}).`);
      return res.status(403).json({ message: 'Access denied: User is not an employer' }); // Use message for consistency
  }

  const employerId = req.user.id; // Get ID from authenticated user object
  console.log(`[${new Date().toISOString()}] PUT /api/profile/employer: Request received for employer ID: ${employerId}`);
  console.log('Received req.body:', JSON.stringify(req.body, null, 2));

  try {
    // --- Find Employer ---
    console.log(`[${new Date().toISOString()}] Attempting to find Employer with ID: ${employerId}`);
    // Use findByIdAndUpdate for atomicity and efficiency
    // Define the fields allowed to be updated from the request body
    const allowedEmployerFields = [
        'companyName', 'hiringManagerFirstName', 'hiringManagerLastName', 'hiringManagerPhone',
        'address', 'companyWebsite', 'companyPhone', 'companyAddress',
        'companyLocation', 'organization', 'costCenter', 'department',
        'projectSponsors', 'preferredCommunicationMode', 'projects'
    ];
    const updateData = {};
    let hasUpdates = false;

    allowedEmployerFields.forEach(field => {
        if (req.body[field] !== undefined) {
             // Basic check for actual change (more complex checks needed for deep objects/arrays if only partial updates are desired)
             // For simplicity here, we assume if the key exists in req.body, it's intended as an update.
             updateData[field] = req.body[field];
             hasUpdates = true;
             console.log(`[${new Date().toISOString()}] Preparing update for field "${field}"`);
        }
    });

     if (!hasUpdates) {
       console.log(`[${new Date().toISOString()}] No updatable fields found in request body for employer ${employerId}.`);
       // Re-fetch current data to send back
       const currentEmployer = await Employer.findById(employerId).select('-password');
       if (!currentEmployer) {
          console.error(`[${new Date().toISOString()}] Employer ${employerId} not found when checking for no updates.`);
          return res.status(404).json({ message: 'Employer record not found.' });
       }
       return res.json({
            message: 'No changes submitted.',
            user: currentEmployer // Send back current data
        });
    }

    console.log(`[${new Date().toISOString()}] Applying updates to employer ${employerId}:`, JSON.stringify(updateData, null, 2));

    // --- Update and Fetch ---
    // { new: true } returns the updated document
    // runValidators: true ensures schema validations are run on update
    const updatedEmployer = await Employer.findByIdAndUpdate(
        employerId,
        { $set: updateData }, // Use $set to update only provided fields
        { new: true, runValidators: true, context: 'query' } // context:'query' helps with certain validators
    ).select('-password');


    if (!updatedEmployer) {
      // This could happen if the ID was valid format but didn't exist,
      // or if auth middleware had stale data (less likely with JWT).
      console.error(`[${new Date().toISOString()}] ERROR: Employer not found during findByIdAndUpdate for ID: ${employerId}.`);
      return res.status(404).json({ message: 'Employer record not found for update.' });
    }

    console.log(`[${new Date().toISOString()}] Employer.findByIdAndUpdate() successful for ${updatedEmployer.email}.`);
    console.log(`[${new Date().toISOString()}] Employer object after update:`, JSON.stringify(updatedEmployer, null, 2));

    // --- Send Response ---
    res.json({
        message: 'Employer profile updated successfully',
        user: updatedEmployer // Send back updated employer data under 'user' key
    });

  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error in PUT /api/profile/employer route for user ID ${employerId}:`, err);
    if (err.name === 'ValidationError') {
       return res.status(400).json({ message: `Validation Error: ${err.message}` });
    }
    res.status(500).json({ message: 'Server error occurred while updating profile.' });
  }
});


// =================================================================
// === STANDARD USER (CANDIDATE) PROFILE ROUTES ===
// =================================================================

// @route   GET api/profile
// @desc    Get profile (Returns Candidate OR Employer based on logged-in user type)
// @access  Private
router.get('/', auth, async (req, res) => {
  console.log(`[${new Date().toISOString()}] --- GET /api/profile ---`);
  try {
    if (!req.user) {
         console.log(`[${new Date().toISOString()}] GET /api/profile: Account data not found in request`);
         return res.status(404).json({ message: 'Account data not found in request' });
    }
    console.log(`[${new Date().toISOString()}] GET /api/profile: Returning ${req.userType}: ${req.user.email}`);
    res.json(req.user); // Send the user or employer object attached by auth middleware
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching profile for ${req.userId}:`, error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// @route   PUT api/profile
// @desc    Update standard CANDIDATE user profile
// @access  Private (Candidates Only)
router.put('/', auth, async (req, res) => {
  // Ensure only candidates can access this specific route
  if (req.userType !== 'candidate') {
      console.log(`[${new Date().toISOString()}] PUT /api/profile DENIED: User (${req.user?.email || 'ID:'+req.userId}) is not a candidate (type: ${req.userType}).`);
      return res.status(403).json({ message: 'Access denied: User is not a candidate' });
  }

  const userId = req.user.id;
  console.log(`[${new Date().toISOString()}] --- PUT /api/profile (Candidate) --- for ID: ${userId}`);
  console.log('Received req.body:', JSON.stringify(req.body, null, 2));

  try {
    const {
      firstName, lastName, phone, address, city, state, zipCode,
      previousexperience, bio, skills, experience, education
    } = req.body;

    const user = await User.findById(userId).select('-password'); // Uses User model

    if (!user) {
       console.log(`[${new Date().toISOString()}] PUT /api/profile: Candidate User not found for ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(`[${new Date().toISOString()}] PUT /api/profile: Candidate User found: ${user.email}`);

    if (!user.profile) {
      user.profile = {};
    }

    // --- Update profile subdocument ---
    const profileUpdates = {};
    if (firstName !== undefined) profileUpdates['profile.firstName'] = firstName;
    if (lastName !== undefined) profileUpdates['profile.lastName'] = lastName;
    if (phone !== undefined) profileUpdates['profile.phone'] = phone;
    if (address !== undefined) profileUpdates['profile.address'] = address;
    if (city !== undefined) profileUpdates['profile.city'] = city;
    if (state !== undefined) profileUpdates['profile.state'] = state;
    if (zipCode !== undefined) profileUpdates['profile.zipCode'] = zipCode;
    if (previousexperience !== undefined) profileUpdates['profile.previousexperience'] = previousexperience;
    if (bio !== undefined) profileUpdates['profile.bio'] = bio;
    if (skills !== undefined && Array.isArray(skills)) profileUpdates['profile.skills'] = skills;
    if (experience !== undefined && Array.isArray(experience)) profileUpdates['profile.experience'] = experience;
    if (education !== undefined && Array.isArray(education)) profileUpdates['profile.education'] = education;
    // --- End Update profile subdocument ---

    if (Object.keys(profileUpdates).length === 0) {
        console.log(`[${new Date().toISOString()}] No changes detected for candidate ${user.email}. Skipping save.`);
        return res.json({
            message: 'No changes detected in profile.',
            user: user // Send back the user data found initially
        });
    }

    console.log(`[${new Date().toISOString()}] Applying updates to candidate ${userId}:`, JSON.stringify(profileUpdates, null, 2));

    // Update using findByIdAndUpdate for atomicity
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: profileUpdates },
        { new: true, runValidators: true, context: 'query' }
    ).select('-password');

    if (!updatedUser) {
        console.error(`[${new Date().toISOString()}] CRITICAL: Candidate User ${userId} not found after findByIdAndUpdate!`);
        return res.status(500).send('Server Error: Failed to retrieve user after update confirmation.');
    }

    console.log(`[${new Date().toISOString()}] PUT /api/profile: Candidate User.findByIdAndUpdate() completed.`);
    console.log(`[${new Date().toISOString()}] Candidate profile after update:`, JSON.stringify(updatedUser.profile, null, 2));

    res.json({
      message: 'Candidate profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating candidate profile ${userId}:`, error);
     if (error.name === 'ValidationError') {
       return res.status(400).json({ message: `Validation Error: ${error.message}` });
    }
    res.status(500).json({ message: 'Server error during profile update' });
  }
});


// --- Experience & Education Routes (Apply ONLY to Candidates) ---
// Note: These modify subdocuments. Ensure userType check if needed.
// Example for adding experience:
router.post('/experience', auth, async (req, res) => {
   if (req.userType !== 'candidate') {
       return res.status(403).json({ message: 'Access denied: Not a candidate' });
   }
   const userId = req.user.id;
   try {
     const user = await User.findById(userId);
     if (!user) return res.status(404).json({ message: 'User not found' });
     if (!user.profile) user.profile = {};
     if (!user.profile.experience) user.profile.experience = [];
     user.profile.experience.push(req.body);
     await user.save(); // save() is suitable here for subdoc array push
     console.log(`[${new Date().toISOString()}] Added experience for candidate ${userId}`);
     res.json(user.profile.experience);
   } catch (error) {
     console.error(`[${new Date().toISOString()}] Error adding experience for ${userId}:`, error);
     res.status(500).json({ message: 'Server error adding experience' });
   }
});
// (Implement similar logic/checks for PUT/DELETE experience and all education routes)
router.put('/experience/:id', auth, async (req, res) => { /* Add userType check */ });
router.delete('/experience/:id', auth, async (req, res) => { /* Add userType check */ });
router.post('/education', auth, async (req, res) => { /* Add userType check */ });
router.put('/education/:id', auth, async (req, res) => { /* Add userType check */ });
router.delete('/education/:id', auth, async (req, res) => { /* Add userType check */ });


module.exports = router;