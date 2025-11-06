const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Candidate Model
const Employer = require('../models/Employer'); // Employer Model

const auth = async (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] --- Auth Middleware Triggered for ${req.method} ${req.originalUrl} ---`);
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log(`[${timestamp}] Auth Error: No token provided.`);
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    console.log(`[${timestamp}] Token found: ${token.substring(0, 15)}...`); // Log partial token

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[${timestamp}] Token decoded successfully:`, decoded);

    if (!decoded.userId || !decoded.userType) {
      console.error(`[${timestamp}] Auth Error: Decoded token is missing userId or userType.`);
      return res.status(401).json({ message: 'Token is invalid (missing data)' });
    }

    let account; // Renamed from 'user' for clarity
    let Model;
    let collectionName;

    // --- Determine Model based on decoded userType ---
    if (decoded.userType === 'employer') {
      Model = Employer;
      collectionName = 'employers';
      console.log(`[${timestamp}] Looking up ID ${decoded.userId} in ${collectionName} collection.`);
      account = await Model.findById(decoded.userId).select('-password');
    } else if (decoded.userType === 'candidate') {
      Model = User;
      collectionName = 'users';
      console.log(`[${timestamp}] Looking up ID ${decoded.userId} in ${collectionName} collection.`);
      account = await Model.findById(decoded.userId).select('-password');
    } else {
      console.error(`[${timestamp}] Auth Error: Invalid userType ('${decoded.userType}') found in token.`);
      return res.status(401).json({ message: 'Token contains invalid user type' });
    }
    // --- End Determine Model ---

    if (!account) {
      // Log the specific reason for failure
      console.error(`[${timestamp}] Auth Error: Account with ID ${decoded.userId} NOT FOUND in ${collectionName} collection.`);
      return res.status(401).json({ message: 'User not found or token invalid' }); // More specific message
    }

    console.log(`[${timestamp}] Account found: ${account.email} (Type: ${account.userType})`);
    // Attach account data and type to the request object
    req.user = account;
    req.userId = decoded.userId;
    req.userType = decoded.userType; // Ensure this matches the decoded type
    console.log(`[${timestamp}] Auth successful. Attaching user data to request.`);
    next(); // Proceed to the next middleware or route handler

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error(`[${timestamp}] Auth Error: JWT verification failed - ${error.message}`);
      res.status(401).json({ message: `Token is not valid: ${error.message}` });
    } else if (error instanceof jwt.TokenExpiredError) {
       console.error(`[${timestamp}] Auth Error: JWT expired at ${error.expiredAt}`);
       res.status(401).json({ message: 'Token has expired' });
    }
     else {
      console.error(`[${timestamp}] Auth Middleware - Unexpected error:`, error);
      res.status(500).json({ message: 'Internal server error during authentication' }); // Use 500 for unexpected errors
    }
  }
};

module.exports = auth;