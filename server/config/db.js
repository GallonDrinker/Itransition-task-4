const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432, // Default PostgreSQL port
});

// Handle successful connection
pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database');
});

// Handle unexpected errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1); // Optional: exit the process if there’s a database issue
});

// Test database connection on app start
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Database connection test successful');
  release(); // Release the client back to the pool
});

module.exports = pool;


// psql shell
// CREATE DATABASE user_list;
// CREATE USER shahariar WITH PASSWORD '1234';
// GRANT ALL PRIVILEGES ON DATABASE user_list TO shahariar;
