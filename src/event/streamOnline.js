const express = require('express');
const { handleStreamStatus } = require('./eventHandler');
const verifyTwitchSignature = require('../utils/twitchSignatureValidator');

const router = express.Router();

// Handle Twitch EventSub for stream online
router.post('/streamOnline', (req, res) => {
    // Verify the signature first
    if (!verifyTwitchSignature(req)) {
        console.log('⚠️ Invalid Twitch signature');
        return res.sendStatus(400); // Invalid signature, return error
    }

    // Respond to the EventSub webhook challenge if necessary
    if (req.headers['twitch-eventsub-message-type'] === 'webhook_callback_verification') {
        return res.send(req.body.challenge); // Respond to the verification challenge
    }

    // Handle the stream online event
    if (req.headers['twitch-eventsub-message-type'] === 'notification') {
        console.log('Stream is online:', req.body);
        handleStreamStatus(req.body);  // Call the event handler to process the notification
    }

    res.sendStatus(200);  // Acknowledge the receipt of the notification
});

module.exports = router;