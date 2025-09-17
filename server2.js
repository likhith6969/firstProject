const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // for password hashing
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory users (for demo only, no database)
let users = [];

// 1. Welcome route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Auth API!',
        version: '1.0.0',
        endpoints: {
            'POST /register': 'Register a new user',
            'POST /login': 'Login with email and password',
            'GET /users': 'View all registered users (for testing only)'
        }
    });
});

// 2. Register route
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: users.length + 1,
        name,
        email,
        password: hashedPassword
    };

    users.push(newUser);

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
});

// 3. Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
        success: true,
        message: 'Login successful',
        data: { id: user.id, name: user.name, email: user.email }
    });
});

// 4. View all users (for testing)
app.get('/users', (req, res) => {
    res.json({
        success: true,
        count: users.length,
        data: users.map(u => ({ id: u.id, name: u.name, email: u.email }))
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Auth API running at http://localhost:${PORT}`);
});
