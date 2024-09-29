const express = require('express');
const dotenv = require('dotenv');
const pool = require('./config/db'); // Import the PostgreSQL connection
const userRoutes = require('./routes/userRoutes'); // Assuming you have user routes set up
const cors = require('cors'); // Import cors

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Apply middleware
app.use(cors()); // Use CORS middleware before defining your routes
app.use(express.json()); // Middleware to parse JSON bodies

// Test route to see if the server is working
app.get('/', (req, res) => {
  res.send('Server is up and running');
});

// Use your user routes (e.g., for registration and login)
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
