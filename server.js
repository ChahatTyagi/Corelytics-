const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root', // Replace with your MySQL username
  password: 'Deepa@2005', // Replace with your MySQL password
  database: 'DEEPANJALISHARMA'
};

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

// Initialize database connection
async function initialize() {
  try {
    // Test the connection
    const connection = await promisePool.getConnection();
    console.log('Database connection established');
    connection.release();
  } catch (err) {
    console.error('Error connecting to database:', err);
  }
}

// API Routes

// User registration
app.post('/api/register', async (req, res) => {
  let connection;
  try {
    const { username, password, name, age, gender, height, weight, weeklySteps, heartRate, bloodPressure, vegetarian, fitnessGoal } = req.body;
    
    connection = await promisePool.getConnection();
    
    // Check if username already exists
    const [existingUsers] = await connection.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Insert new user
    const [result] = await connection.query(
      `INSERT INTO users (
        username, password, name, age, gender, height, weight, 
        weekly_steps, heart_rate, blood_pressure, vegetarian, fitness_goal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username, password, name, age, gender, height, weight,
        weeklySteps, heartRate, bloodPressure, vegetarian ? 1 : 0, fitnessGoal
      ]
    );
    
    const userId = result.insertId;
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId
    });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// User login
app.post('/api/login', async (req, res) => {
  let connection;
  try {
    const { username, password } = req.body;
    
    connection = await promisePool.getConnection();
    
    const [users] = await connection.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    res.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        weeklySteps: user.weekly_steps,
        heartRate: user.heart_rate,
        bloodPressure: user.blood_pressure,
        vegetarian: user.vegetarian === 1,
        fitnessGoal: user.fitness_goal
      }
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Save progress data
app.post('/api/progress', async (req, res) => {
  let connection;
  try {
    const { 
      userId, date, weight, height, steps, heartRate, 
      bloodPressure, calories, dietFollowed, exerciseDone 
    } = req.body;
    
    connection = await promisePool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO progress (
        user_id, date, weight, height, steps, heart_rate, 
        blood_pressure, calories, diet_followed, exercise_done
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, date, weight, height, steps, heartRate,
        bloodPressure, calories, dietFollowed ? 1 : 0, exerciseDone ? 1 : 0
      ]
    );
    
    const progressId = result.insertId;
    
    res.status(201).json({ 
      message: 'Progress saved successfully',
      progressId
    });
  } catch (err) {
    console.error('Error saving progress:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Get user progress history
app.get('/api/progress/:userId', async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    
    connection = await promisePool.getConnection();
    
    const [progress] = await connection.query(
      'SELECT * FROM progress WHERE user_id = ? ORDER BY date DESC',
      [userId]
    );
    
    res.json({ progress });
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Update user profile
app.put('/api/profile/:userId', async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    const { name, age, gender, password, height, weight, fitnessGoal } = req.body;
    
    connection = await promisePool.getConnection();
    
    let updateQuery = `
      UPDATE users 
      SET name = ?, age = ?, gender = ?, 
          height = ?, weight = ?, fitness_goal = ?
    `;
    
    const queryParams = [
      name, age, gender, height, weight, fitnessGoal
    ];
    
    // Only update password if provided
    if (password) {
      updateQuery += ', password = ?';
      queryParams.push(password);
    }
    
    updateQuery += ' WHERE id = ?';
    queryParams.push(userId);
    
    await connection.query(updateQuery, queryParams);
    
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Delete user profile
app.delete('/api/profile/:userId', async (req, res) => {
  let connection;
  try {
    const { userId } = req.params;
    
    connection = await promisePool.getConnection();
    
    // First delete all progress records
    await connection.query(
      'DELETE FROM progress WHERE user_id = ?',
      [userId]
    );
    
    // Then delete the user
    await connection.query(
      'DELETE FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({ message: 'Profile deleted successfully' });
  } catch (err) {
    console.error('Error deleting profile:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initialize();
});

// Handle process termination
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
}); 