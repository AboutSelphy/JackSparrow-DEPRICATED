function handleStreamStatus(event) {
    const { subscription, event: eventData } = event;

    if (subscription.type === "stream.online") {
        console.log(`🎥 Stream started for ${eventData.broadcaster_user_name}`);
        // Add any actions to trigger when the stream goes live (e.g., send a Discord message)
    } else if (subscription.type === "stream.offline") {
        console.log(`📴 Stream ended for ${eventData.broadcaster_user_name}`);
        // Add any actions to trigger when the stream ends
    }
}

module.exports = { handleStreamStatus };
