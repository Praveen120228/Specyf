const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/specyf', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Models
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    industry: String,
    location: String,
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
    createdAt: { type: Date, default: Date.now }
});

const employeeSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    position: String,
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Company = mongoose.model('Company', companySchema);
const Employee = mongoose.model('Employee', employeeSchema);

// Authentication Middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const user = await User.findOne({ _id: decoded._id });
        
        if (!user) {
            throw new Error();
        }
        
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

// Routes

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(400).send({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).send({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ _id: user._id }, 'your_jwt_secret');
        res.send({ user, token });
    } catch (error) {
        res.status(500).send(error);
    }
});

// Admin Routes
app.post('/api/admin/create', auth, async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') {
            return res.status(403).send({ error: 'Not authorized' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 8);
        const user = new User({
            ...req.body,
            password: hashedPassword
        });
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get('/api/admin/users', auth, async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') {
            return res.status(403).send({ error: 'Not authorized' });
        }
        
        const users = await User.find({}).select('-password');
        res.send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.delete('/api/admin/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') {
            return res.status(403).send({ error: 'Not authorized' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        if (user.role === 'superadmin' && req.user._id.toString() !== user._id.toString()) {
            return res.status(403).send({ error: 'Cannot delete other superadmins' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.send({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
});

app.put('/api/admin/profile', auth, async (req, res) => {
    try {
        const updates = {};
        if (req.body.email) {
            updates.email = req.body.email;
        }

        if (req.body.currentPassword && req.body.newPassword) {
            const user = await User.findById(req.user._id);
            const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
            
            if (!isMatch) {
                return res.status(400).send({ error: 'Current password is incorrect' });
            }
            
            updates.password = await bcrypt.hash(req.body.newPassword, 8);
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true }
        ).select('-password');

        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Company Routes
app.post('/api/companies', auth, async (req, res) => {
    try {
        const company = new Company(req.body);
        await company.save();
        res.status(201).send(company);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get('/api/companies', auth, async (req, res) => {
    try {
        const companies = await Company.find({}).populate('employees');
        res.send(companies);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Employee Routes
app.post('/api/employees', auth, async (req, res) => {
    try {
        const employee = new Employee(req.body);
        await employee.save();
        
        // Update company's employees array
        if (req.body.company) {
            await Company.findByIdAndUpdate(
                req.body.company,
                { $push: { employees: employee._id } }
            );
        }
        
        res.status(201).send(employee);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get('/api/employees', auth, async (req, res) => {
    try {
        const employees = await Employee.find({}).populate('company');
        res.send(employees);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Analytics Routes
app.get('/api/analytics', auth, async (req, res) => {
    try {
        const totalCompanies = await Company.countDocuments();
        const totalEmployees = await Employee.countDocuments();
        const recentCompanies = await Company.find().sort({ createdAt: -1 }).limit(5);
        const recentEmployees = await Employee.find().sort({ createdAt: -1 }).limit(5);

        res.send({
            stats: {
                totalCompanies,
                totalEmployees
            },
            recent: {
                companies: recentCompanies,
                employees: recentEmployees
            }
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
