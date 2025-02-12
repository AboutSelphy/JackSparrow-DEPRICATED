const express = require("express");
const { handleStreamStatus } = require("./eventHandler");
const verifyTwitchSignature = require("../utils/twitchSignatureValidator");

const router = express.Router();

// Handle Twitch EventSub for stream offline
router.post("/streamOffline", (req, res) => {
    if (!verifyTwitchSignature(req)) {
        console.log("⚠️ Invalid Twitch signature");
        return res.sendStatus(400);
    }

    if (req.headers["twitch-eventsub-message-type"] === "webhook_callback_verification") {
        return res.send(req.body.challenge);
    }

    if (req.headers["twitch-eventsub-message-type"] === "notification") {
        console.log("Stream is offline:", req.body);
        handleStreamStatus(req.body);
    }

    res.sendStatus(200);
});

module.exports = router;
