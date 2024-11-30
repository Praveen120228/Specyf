const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../'));

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Contact form endpoint
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    // TODO: Add email sending functionality
    res.json({ success: true, message: 'Message received' });
});

// Auth endpoints
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    // TODO: Add user registration logic
    res.json({ success: true, message: 'User registered successfully' });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    // TODO: Add authentication logic
    res.json({ success: true, message: 'Login successful' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
