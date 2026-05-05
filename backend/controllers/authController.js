const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (id, email, role) => {
    return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, phone, vehicle_number, password } = req.body;
        
        if (!name || !email || !phone || !vehicle_number || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const [existing] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const [result] = await pool.query(
            'INSERT INTO Users (name, email, phone, vehicle_number, password) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, vehicle_number, hashedPassword]
        );

        res.status(201).json({
            user_id: result.insertId,
            name,
            email,
            role: 'user',
            token: generateToken(result.insertId, email, 'user')
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.user_id, user.email, user.role)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMe = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT user_id, name, email, phone, vehicle_number, role FROM Users WHERE user_id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { registerUser, loginUser, getMe };
