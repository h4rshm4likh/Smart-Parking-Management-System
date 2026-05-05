const pool = require('../config/db');

// Webhook simulation for Antigravity Connect
const handleWebhook = async (req, res) => {
    try {
        const { event, payload } = req.body;
        console.log(`[Antigravity Connect] Received webhook event: ${event}`);

        if (event === 'slot_status_update') {
            const { slot_id, status } = payload;
            
            // Validate
            if (!slot_id || !['available', 'booked'].includes(status)) {
                return res.status(400).json({ message: 'Invalid payload' });
            }

            // Update slot
            await pool.query('UPDATE Parking_Slots SET status = ? WHERE slot_id = ?', [status, slot_id]);
            
            // Note: In a real app, this might trigger a websocket event to update the frontend
            console.log(`[Antigravity Connect] Slot ${slot_id} updated to ${status}`);
            return res.json({ message: 'Webhook processed successfully' });
        }

        res.status(400).json({ message: 'Unknown event type' });
    } catch (error) {
        console.error('[Antigravity Connect] Error processing webhook:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { handleWebhook };
