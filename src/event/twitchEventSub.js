const WebSocket = require('ws');
const axios = require('axios');
const { twitch } = require('../config/config');

// Get OAuth token dynamically
const getOAuthToken = async () => {
    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: twitch.clientId,
                client_secret: twitch.secret,
                grant_type: 'client_credentials'
            }
        });

        const accessToken = response.data.access_token;
        console.log('✅ OAuth token obtained:', accessToken);
        return accessToken;
    } catch (error) {
        console.error('❌ Error obtaining OAuth token:', error.message);
        throw error;
    }
};

let ws;
let sessionId = null;

const connectEventSub = async () => {
    const accessToken = await getOAuthToken();

    ws = new WebSocket('wss://eventsub.wss.twitch.tv/ws');

    ws.on('open', () => console.log('📡 Connected to Twitch EventSub WebSocket'));

    ws.on('message', async (data) => {
        const message = JSON.parse(data);

        if (message.metadata?.message_type === 'session_welcome') {
            sessionId = message.payload.session.id;
            console.log(`🎉 WebSocket session started: ${sessionId}`);
            await subscribeToStreamOnline(sessionId, accessToken);  // Pass accessToken here
        }

        if (message.metadata?.message_type === 'notification') {
            const event = message.payload.event;
            if (event.broadcaster_user_name) {
                console.log(`🚀 ${event.broadcaster_user_name} is now LIVE!`);
            }
        }

        if (message.metadata?.message_type === 'session_keepalive') {
            console.log('💓 Keep-alive received from Twitch');
        }

        if (message.metadata?.message_type === 'revocation') {
            console.error('⚠️ Subscription revoked:', message.payload.subscription.status);
        }
    });

    ws.on('close', () => {
        console.warn('🔌 WebSocket closed, reconnecting in 5s...');
        setTimeout(connectEventSub, 5000);
    });

    ws.on('error', (error) => console.error('❌ WebSocket error:', error.message));
};

const subscribeToStreamOnline = async (sessionId, accessToken) => {
    try {
        console.log('🌐 Attempting to subscribe to stream.online event');
        const response = await axios.post(
            'https://api.twitch.tv/helix/eventsub/subscriptions',
            {
                type: 'stream.online',
                version: '1',
                condition: {
                    broadcaster_user_id: twitch.broadcastId // Make sure broadcastId is correct
                },
                transport: {
                    method: 'websocket',
                    session_id: sessionId // Ensure sessionId is correct
                }
            },
            {
                headers: {
                    'Client-ID': twitch.clientId,
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log(`✅ Subscribed to stream.online event:`, response.data);
    } catch (error) {
        console.error('❌ Subscription error:', error.response?.data || error.message);
    }
};

module.exports = { connectEventSub };
