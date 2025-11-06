// server/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User'); // Candidate Model
const Employer = require('../models/Employer'); // Employer Model

// Register CANDIDATE
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      // Check both collections for existing email
      let existingUser = await User.findOne({ email });
      let existingEmployer = await Employer.findOne({ email });
      if (existingUser || existingEmployer) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Create new CANDIDATE user using User model
      let newUser = new User({ email, password, userType: 'candidate' });
      await newUser.save();

      const token = jwt.sign(
        { userId: newUser._id, userType: 'candidate' }, // Add userType to token
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userToSend = await User.findById(newUser._id).select('-password');
      if (!userToSend) {
         console.error(`[${new Date().toISOString()}] Candidate Registration Error: Could not find newly created user ${newUser._id}.`);
         return res.status(500).json({ message: 'Server error during registration response' });
      }
      console.log(`[${new Date().toISOString()}] Candidate registered successfully: ${email}`);
      res.status(201).json({ token, user: userToSend });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Candidate Registration Error for ${email}:`, error);
      res.status(500).json({ message: 'Server error during candidate registration' });
    }
  }
);

// Register EMPLOYER
router.post(
  '/register/employer',
  [
    body('companyName').notEmpty().withMessage('Company name is required'),
    body('hiringManagerFirstName').notEmpty().withMessage('First name is required'),
    body('hiringManagerLastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('hiringManagerPhone').optional({ checkFalsy: true }).isMobilePhone('any').withMessage('Please enter a valid phone number'), // Allow empty string
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {
      companyName, hiringManagerFirstName, hiringManagerLastName,
      email, hiringManagerPhone, password
    } = req.body;

    try {
      // Check both collections for existing email
      let existingUser = await User.findOne({ email });
      let existingEmployer = await Employer.findOne({ email });
      if (existingUser || existingEmployer) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Create new EMPLOYER using Employer model
      let newEmployer = new Employer({
        email, password, companyName, hiringManagerFirstName,
        hiringManagerLastName, hiringManagerPhone: hiringManagerPhone || ''
        // userType defaults to 'employer' in the model
      });
      await newEmployer.save();

      const token = jwt.sign(
        { userId: newEmployer._id, userType: 'employer' }, // Add userType to token
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Fetch from Employer collection
      const employerToSend = await Employer.findById(newEmployer._id).select('-password');
      if (!employerToSend) {
        console.error(`[${new Date().toISOString()}] Employer Registration Error: Could not find newly created employer ${newEmployer._id}.`);
        return res.status(500).json({ message: 'Server error during registration response' });
      }
      console.log(`[${new Date().toISOString()}] Employer registered successfully: ${email}`);
      // Send employer data under 'user' key for frontend consistency
      res.status(201).json({ token, user: employerToSend });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Employer Registration Error for ${email}:`, error);
      res.status(500).json({ message: 'Server error during employer registration' });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      let account = null;
      let accountType = null;
      let Model;

      // Try finding in User (candidate) collection
      account = await User.findOne({ email }).select('-password');
      if (account) {
        accountType = 'candidate';
        Model = User;
         console.log(`[${new Date().toISOString()}] Login attempt: Found candidate ${email}`);
      } else {
        // If not found, try finding in Employer collection
        account = await Employer.findOne({ email }).select('-password');
        if (account) {
          accountType = 'employer';
          Model = Employer;
           console.log(`[${new Date().toISOString()}] Login attempt: Found employer ${email}`);
        }
      }

      if (!account) {
        console.log(`[${new Date().toISOString()}] Login attempt failed: Account not found for email ${email}`);
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Fetch account *with* password for comparison using the correct Model
      const accountWithPassword = await Model.findOne({ email });
      if (!accountWithPassword) {
         // This indicates a potential database inconsistency if the previous find worked
         console.error(`[${new Date().toISOString()}] Login Internal Error: Could not re-fetch account with password for ${email} using ${Model.modelName}.`);
         return res.status(500).json({ message: 'Server error during login process' });
      }

      const isMatch = await accountWithPassword.comparePassword(password);
      if (!isMatch) {
         console.log(`[${new Date().toISOString()}] Login attempt failed: Incorrect password for ${accountType} ${email}`);
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create JWT token including userType
      const token = jwt.sign(
        { userId: account._id, userType: accountType },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log(`[${new Date().toISOString()}] Login successful for ${accountType}: ${email}`);
      // Send the account object fetched *without* the password under the 'user' key
      res.json({ token, user: account });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Login system error for ${email}:`, error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

module.exports = router;