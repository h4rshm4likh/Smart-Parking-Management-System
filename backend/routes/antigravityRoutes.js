const express = require('express');
const router = express.Router();
const { handleWebhook } = require('../controllers/antigravityController');

// Allow external service to post updates
router.post('/webhook', handleWebhook);

module.exports = router;
