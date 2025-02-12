const crypto = require("crypto");
const { twitch } = require("../config/config");


function verifyTwitchSignature(req) {
    const messageId = req.headers["twitch-eventsub-message-id"];
    const timestamp = req.headers["twitch-eventsub-message-timestamp"];
    const receivedSignature = req.headers["twitch-eventsub-signature"];
    const body = req.rawBody; // Must use raw body, not parsed JSON

    if (!messageId || !timestamp || !receivedSignature || !body) {
        console.log("⚠️ Missing signature headers");
        return false;
    }

    const secret = twitch.secret;
    if (!secret) {
        console.log("⚠️ Missing Twitch secret key");
        return false;
    }

    const hmacMessage = messageId + timestamp + body;
    const hmac = crypto.createHmac("sha256", secret).update(hmacMessage).digest("hex");
    const expectedSignature = `sha256=${hmac}`;

    if (expectedSignature !== receivedSignature) {
        console.log("🚨 Invalid Twitch signature!");
        return false;
    }

    return true;
}

module.exports = verifyTwitchSignature;
