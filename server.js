const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './')));

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'addwise',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database tables
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create user_signups table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_signups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        google_id VARCHAR(255),
        profile_picture VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create login_history table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS login_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        login_status ENUM('success', 'failed') NOT NULL,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45)
      )
    `);
    
    console.log('Database initialized successfully');
    connection.release();
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Helper function to get client IP
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress;
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Add dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = getClientIp(req);
    
    // Find user in database
    const [rows] = await pool.execute(
      'SELECT * FROM user_signups WHERE email = ?',
      [email]
    );
    
    let loginStatus = 'failed';
    let userData = null;
    let token = null;
    
    if (rows.length > 0) {
      const user = rows[0];
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        loginStatus = 'success';
        
        // Create token
        token = jwt.sign(
          { id: user.id, email: user.email, name: user.name },
          process.env.JWT_SECRET || 'your_jwt_secret',
          { expiresIn: '1h' }
        );
        
        userData = {
          id: user.id,
          name: user.name,
          email: user.email
        };
      }
    }
    
    // Record login attempt
    await pool.execute(
      'INSERT INTO login_history (email, login_status, ip_address) VALUES (?, ?, ?)',
      [email, loginStatus, ip]
    );
    
    if (loginStatus === 'success') {
      res.json({
        success: true,
        token,
        user: userData
      });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add these new routes for forgot password functionality
// Add these dependencies at the top of your file if not already there
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Add this after your pool creation
// Store OTPs (in a real app, use Redis or another appropriate storage)
const otpStore = new Map();

// Add these routes after your existing routes
// User signup route
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM user_signups WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert new user with name
    const [result] = await pool.execute(
      'INSERT INTO user_signups (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    // Create token
    const token = jwt.sign(
      { id: result.insertId, email, name },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: result.insertId,
        name,
        email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add these routes after your existing routes

// Forgot password route
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const [users] = await pool.execute(
      'SELECT * FROM user_signups WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }
    
    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Store OTP with expiry (15 minutes)
    otpStore.set(email, {
      otp,
      expires: Date.now() + 15 * 60 * 1000
    });
    
  
    
    // For development, skip actual email sending
    // In production, you would uncomment this code and use proper credentials
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'AddWise Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d47a1;">AddWise Password Reset</h2>
          <p>You requested a password reset. Use the following verification code to reset your password:</p>
          <div style="background-color: #f5f5f5; padding: 15px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold;">
            ${otp}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
        </div>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    
    // Return success with OTP for development
    res.json({ 
      message: 'OTP sent successfully',
    
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password route
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    // Check if OTP exists and is valid
    const otpData = otpStore.get(email);
    
    if (!otpData) {
      return res.status(400).json({ message: 'OTP expired or invalid' });
    }
    
    if (otpData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    if (Date.now() > otpData.expires) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP expired' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user password
    await pool.execute(
      'UPDATE user_signups SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );
    
    // Remove OTP from store
    otpStore.delete(email);
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});


// Add these dependencies at the top of your file
const { OAuth2Client } = require('google-auth-library');

// Create a Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Add this route after your existing routes
// Google login verification route
app.post('/api/google-login', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;
    
    // Check if user exists in our database
    const [users] = await pool.execute(
      'SELECT * FROM user_signups WHERE email = ?',
      [email]
    );
    
    let userId;
    
    if (users.length === 0) {
      // User doesn't exist, create a new account
      // Generate a random password for the user (they'll never use it)
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
      // Insert new user
      const [result] = await pool.execute(
        'INSERT INTO user_signups (name, email, password, profile_picture, google_id) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, picture, payload.sub]
      );
      
      userId = result.insertId;
    } else {
      // User exists
      userId = users[0].id;
      
      // Update user's Google ID and profile picture if needed
      await pool.execute(
        'UPDATE user_signups SET google_id = ?, profile_picture = ? WHERE id = ?',
        [payload.sub, picture, userId]
      );
    }
    
    // Create JWT token
    const jwtToken = jwt.sign(
      { id: userId, email, name },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
 
    // Record login
    await pool.execute(
      'INSERT INTO login_history (email, login_status, ip_address) VALUES (?, ?, ?)',
      [email, 'success', getClientIp(req)]
    );
    
    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: userId,
        name,
        email,
        picture
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this route to serve the Google client ID to the frontend
app.get('/api/google-client-id', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    console.error('GOOGLE_CLIENT_ID not found in environment variables');
    return res.status(500).json({ error: 'Google client ID not configured' });
  }
  
  console.log('Serving Google Client ID to frontend');
  res.json({ clientId: clientId });
});

// Add these after your existing middleware
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  
  if (!bearerHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const bearer = bearerHeader.split(' ');
  const token = bearer[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Protected route middleware
const protectRoute = (req, res, next) => {
  if (!req.headers['authorization']) {
    return res.redirect('/');
  }
  next();
};

// Apply protection to dashboard route
app.get('/dashboard', protectRoute, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Token verification endpoint
app.get('/api/verify-token', verifyToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Logout endpoint
app.post('/api/logout', verifyToken, (req, res) => {
  // In a real application, you might want to invalidate the token in a token blacklist
  res.json({ message: 'Logged out successfully' });
});