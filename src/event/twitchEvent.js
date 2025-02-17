const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { twitch } = require('../config/config');
const { handleStreamEvent } = require('./eventHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.TWITCH_EVENTSUB_PORT || 3001;

// Middleware to capture raw request body for signature validation
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));

function verifyTwitchSignature(req) {
    console.log('📩 Headers Received:', req.headers);

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

    const hmacMessage = messageId + timestamp + req.rawBody;
    const hmac = `sha256=${crypto.createHmac('sha256', twitch.secret).update(hmacMessage).digest('hex')}`;

    const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac));
    if (!isValid) {
        console.log('❌ Invalid signature, rejecting request.');
    }
    return isValid;
}

app.post('/eventsub', (req, res) => {
    if (req.body.challenge) {
        console.log('🔄 Received Twitch challenge, responding...');
        return res.status(200).set('Content-Type', 'text/plain').send(req.body.challenge);
    }

    if (!verifyTwitchSignature(req)) {
        console.log('❌ Invalid signature, rejecting request.');
        return res.sendStatus(403);
    }

    console.log('✅ Verified Event Received:', req.body);
    handleStreamEvent(req.body);
    res.sendStatus(200);
});

// Check existing subscriptions
async function checkExistingSubscriptions() {
    try {
        const response = await axios.get('https://api.twitch.tv/helix/eventsub/subscriptions', {
            headers: {
                'Client-ID': twitch.clientId,
                'Authorization': `Bearer ${twitch.bearerToken}`,
            },
        });

        const existingSubscriptions = response.data.data;
        return existingSubscriptions.some(sub => sub.condition.broadcaster_user_id === twitch.broadcastId);
    } catch (error) {
        console.error('❌ Error checking existing subscriptions:', error.message);
        return false;
    }
}

// Subscribe to Twitch EventSub
async function subscribeToEventSub() {
    const alreadySubscribed = await checkExistingSubscriptions();
    if (alreadySubscribed) {
        console.log('⚠️ Already subscribed to EventSub.');
        return;
    }

    try {
        await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions', {
            type: 'stream.online',
            version: '1',
            condition: { broadcaster_user_id: twitch.broadcastId },
            transport: {
                method: 'webhook',
                callback: twitch.callback,
                secret: twitch.secret
            }
        }, {
            headers: {
                'Client-ID': twitch.clientId,
                'Authorization': `Bearer ${twitch.bearerToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Subscribed to stream.online');

        await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions', {
            type: 'stream.offline',
            version: '1',
            condition: { broadcaster_user_id: twitch.broadcastId },
            transport: {
                method: 'webhook',
                callback: twitch.callback,
                secret: twitch.secret
            }
        }, {
            headers: {
                'Client-ID': twitch.clientId,
                'Authorization': `Bearer ${twitch.bearerToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Subscribed to stream.offline');
    } catch (error) {
        console.error('❌ Failed to subscribe to EventSub:', error.response?.data || error.message);
    }
}

// Export the server so it can be used in server.js
async function startTwitchEventListener() {
    app.listen(PORT, async () => {
        console.log(`🎧 Twitch EventSub listening on port ${PORT}`);
        await subscribeToEventSub();
    });
}

module.exports = { startTwitchEventListener };
