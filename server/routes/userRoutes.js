const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Registration Route
router.post('/register', async (req, res) => {
  console.log("Registration Attempt:", req.body);
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
  } catch (error) {
    console.error("Error during registration:",error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  console.log('Request Body:', req.body);
    const { email, password } = req.body;
  
    try {
      console.log("Login attempt with email:", email); // Log the login attempt
  
      // Find user in the database
      const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (user.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // Check if the user is blocked
      if (user.rows[0].status === 'blocked') {
        return res.status(403).json({ message: 'User is blocked' });
      }
  
      // Compare password
      const validPassword = await bcrypt.compare(password, user.rows[0].password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // Update last login time
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.rows[0].id]);
  
      res.json({ token, user: { id: user.rows[0].id, name: user.rows[0].name, email: user.rows[0].email } });
    } catch (error) {
      console.error("Server error during login:", error); // Log detailed error
      res.status(500).json({ message: 'Server error' });
    }
  });
  

// Get all users (User management route)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await pool.query(
      'SELECT id, name, email, last_login, registration_time, status FROM users'
    );
    res.json(users.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Block a user
router.put('/:id/block', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['blocked', req.params.id]);
    res.json({ message: 'User blocked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unblock a user
router.put('/:id/unblock', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE users SET status = $1 WHERE id = $2', ['active', req.params.id]);
    res.json({ message: 'User unblocked' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a user
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
