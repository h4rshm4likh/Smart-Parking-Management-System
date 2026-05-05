const express = require('express');
const router = express.Router();
const { getMyBookings, getAllBookings, createBooking, autoAssignBooking, checkoutBooking } = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/mybookings', protect, getMyBookings);
router.get('/', protect, adminOnly, getAllBookings);
router.post('/auto-assign', protect, autoAssignBooking);
router.post('/', protect, createBooking);
router.patch('/:booking_id/checkout', protect, checkoutBooking);

module.exports = router;
