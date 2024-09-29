const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and protect routes
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Get token from Authorization header

  console.log("Received Token: ", token); // Add this for debugging

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request
    req.user = decoded;
    
    console.log("Decoded Token: ", decoded); // Log decoded token info

    next(); // Continue to the next middleware/route handler
  } catch (error) {
    console.error("Token verification error: ", error); // Log any errors in token verification
    res.status(401).json({ message: 'Invalid token, authorization denied' });
  }
};

module.exports = authMiddleware;
