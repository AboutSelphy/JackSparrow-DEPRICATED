const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { twitch } = require('../config/config');
require('dotenv').config();

const app = express();
const PORT = process.env.TWITCH_EVENTSUB_PORT || 3001;


// Middleware to capture raw request body for signature validation
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString(); // Ensure raw body is available
    }
}));

function verifyTwitchSignature(req) {
    console.log('📩 Headers Received:', req.headers); // Log headers

    const messageId = req.header('Twitch-Eventsub-Message-Id');
    const timestamp = req.header('Twitch-Eventsub-Message-Timestamp');
    const signature = req.header('Twitch-Eventsub-Message-Signature');

    if (!messageId || !timestamp || !signature) {
        console.log('⚠️ Missing signature headers.');
        return false;
    }

    console.log(`🛑 Signature Details:
    - Message ID: ${messageId}
    - Timestamp: ${timestamp}
    - Signature: ${signature}`);

    const hmacMessage = messageId + timestamp + req.rawBody; // Ensure you're using the correct body format
    const hmac = `sha256=${crypto.createHmac('sha256', twitch.secret).update(hmacMessage).digest('hex')}`;

    const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
    if (!isValid) {
        console.log('❌ Invalid signature, rejecting request.');
    }
    return isValid;
}

// Event handler for stream status
function handleStreamEvent(event) {
    const eventType = event.event.type;

    switch (eventType) {
        case 'live': // Add case for 'live' event type
            console.log(`🎥 ${event.event.broadcaster_user_name} is now live!`);
            // Implement any logic when stream goes online, e.g., notify Discord, log, etc.
            break;

        case 'stream.offline':
            console.log(`⛔ ${event.event.broadcaster_name} is now offline.`);
            // Implement any logic when stream goes offline
            break;

        default:
            console.log(`⚠️ Unknown event type: ${eventType}`);
    }
}

app.post('/eventsub', (req, res) => {
    if (req.body.challenge) {
        console.log('🔄 Received Twitch challenge, responding...');
        return res.status(200)
            .set('Content-Type', 'text/plain')
            .send(req.body.challenge);
    }

    if (!verifyTwitchSignature(req)) {
        console.log('❌ Invalid signature, rejecting request.');
        return res.sendStatus(403);
    }

    console.log('✅ Verified Event Received:', req.body);

    // Event Handling Logic
    const event = req.body;
    handleStreamEvent(event); // Pass event to handler

    res.sendStatus(200);
});

// Export the server so it can be used in server.js
module.exports.listen = function() {
    app.listen(PORT, () => {
        console.log(`✅ Twitch EventSub webhook listening on port ${PORT}`);
    });
};
