const pool = require('../config/db');

const getMyBookings = async (req, res) => {
    try {
        const [bookings] = await pool.query(`
            SELECT b.*, s.location, s.price_per_hour
            FROM Bookings b
            JOIN Parking_Slots s ON b.slot_id = s.slot_id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `, [req.user.id]);
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllBookings = async (req, res) => {
    try {
        const [bookings] = await pool.query(`
            SELECT b.*, u.name as user_name, u.email as user_email, s.location
            FROM Bookings b
            JOIN Users u ON b.user_id = u.user_id
            JOIN Parking_Slots s ON b.slot_id = s.slot_id
            ORDER BY b.created_at DESC
        `);
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createBooking = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { slot_id, start_time, end_time } = req.body;

        // Check if slot is available
        const [slots] = await connection.query('SELECT status, price_per_hour FROM Parking_Slots WHERE slot_id = ? FOR UPDATE', [slot_id]);
        if (slots.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Slot not found' });
        }
        if (slots[0].status !== 'available') {
            await connection.rollback();
            return res.status(400).json({ message: 'Slot is already booked' });
        }

        // Create booking
        const [bookingResult] = await connection.query(
            'INSERT INTO Bookings (user_id, slot_id, start_time, end_time) VALUES (?, ?, ?, ?)',
            [req.user.id, slot_id, start_time, end_time]
        );

        // Update slot status
        await connection.query('UPDATE Parking_Slots SET status = "booked" WHERE slot_id = ?', [slot_id]);

        // Calculate amount (simplified logic: hours * price)
        const start = new Date(start_time);
        const end = new Date(end_time);
        const hours = Math.ceil(Math.abs(end - start) / 36e5) || 1;
        const amount = hours * slots[0].price_per_hour;

        // Create payment record
        await connection.query(
            'INSERT INTO Payments (booking_id, amount, payment_status) VALUES (?, ?, "completed")',
            [bookingResult.insertId, amount]
        );

        await connection.commit();
        res.status(201).json({ message: 'Booking successful', booking_id: bookingResult.insertId });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
};

const autoAssignBooking = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Find first available slot
        const [slots] = await connection.query('SELECT slot_id, location, price_per_hour FROM Parking_Slots WHERE status = "available" LIMIT 1 FOR UPDATE');
        if (slots.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'No parking slots currently available' });
        }

        const slot = slots[0];
        const start_time = new Date();
        const end_time = new Date(start_time.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

        // Create booking
        const [bookingResult] = await connection.query(
            'INSERT INTO Bookings (user_id, slot_id, start_time, end_time) VALUES (?, ?, ?, ?)',
            [req.user.id, slot.slot_id, start_time.toISOString().slice(0, 19).replace('T', ' '), end_time.toISOString().slice(0, 19).replace('T', ' ')]
        );

        // Update slot status
        await connection.query('UPDATE Parking_Slots SET status = "booked" WHERE slot_id = ?', [slot.slot_id]);

        // Calculate amount
        const amount = 2 * slot.price_per_hour;

        // Create payment record
        await connection.query(
            'INSERT INTO Payments (booking_id, amount, payment_status) VALUES (?, ?, "completed")',
            [bookingResult.insertId, amount]
        );

        await connection.commit();
        res.status(201).json({ 
            message: 'Slot assigned successfully', 
            booking_id: bookingResult.insertId,
            location: slot.location,
            slot_id: slot.slot_id
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
};

const checkoutBooking = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { booking_id } = req.params;

        // Verify booking belongs to user and is active
        const [bookings] = await connection.query(
            'SELECT b.*, s.slot_id FROM Bookings b JOIN Parking_Slots s ON b.slot_id = s.slot_id WHERE b.booking_id = ? AND b.user_id = ? FOR UPDATE',
            [booking_id, req.user.id]
        );

        if (bookings.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Booking not found' });
        }

        const booking = bookings[0];
        if (booking.status === 'completed') {
            await connection.rollback();
            return res.status(400).json({ message: 'Booking already completed' });
        }

        // Mark booking as completed
        await connection.query(
            'UPDATE Bookings SET status = "completed", end_time = NOW() WHERE booking_id = ?',
            [booking_id]
        );

        // Free the slot
        await connection.query(
            'UPDATE Parking_Slots SET status = "available" WHERE slot_id = ?',
            [booking.slot_id]
        );

        await connection.commit();
        res.json({ message: 'Checkout successful. Have a safe drive!' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
};

module.exports = { getMyBookings, getAllBookings, createBooking, autoAssignBooking, checkoutBooking };
