const pool = require('../config/db');

const getSlots = async (req, res) => {
    try {
        const [slots] = await pool.query('SELECT * FROM Parking_Slots');
        res.json(slots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getSlotById = async (req, res) => {
    try {
        const [slots] = await pool.query('SELECT * FROM Parking_Slots WHERE slot_id = ?', [req.params.id]);
        if (slots.length === 0) {
            return res.status(404).json({ message: 'Slot not found' });
        }
        res.json(slots[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createSlot = async (req, res) => {
    try {
        const { location, price_per_hour } = req.body;
        const [result] = await pool.query(
            'INSERT INTO Parking_Slots (location, price_per_hour) VALUES (?, ?)',
            [location, price_per_hour]
        );
        res.status(201).json({ id: result.insertId, location, status: 'available', price_per_hour });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateSlot = async (req, res) => {
    try {
        const { location, status, price_per_hour } = req.body;
        const [result] = await pool.query(
            'UPDATE Parking_Slots SET location = ?, status = ?, price_per_hour = ? WHERE slot_id = ?',
            [location, status, price_per_hour, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Slot not found' });
        }
        res.json({ message: 'Slot updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteSlot = async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM Parking_Slots WHERE slot_id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Slot not found' });
        }
        res.json({ message: 'Slot removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getSlots, getSlotById, createSlot, updateSlot, deleteSlot };
