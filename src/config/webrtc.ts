// src/config/webrtc.ts

/**
 * Generates the ICE Server configuration for WebRTC.
 * Includes public STUN servers and optional private TURN servers.
 */
export const GET_ICE_SERVERS = (): RTCIceServer[] => {
    // 1. Always include free STUN servers as baseline
    // Optimized for China accessibility
    const servers: RTCIceServer[] = [
        { urls: 'stun:stun.qq.com:3478' }, // Tencent - Very reliable in China
        { urls: 'stun:stun.miwifi.com:3478' }, // Xiaomi
        { urls: 'stun:stun.chat.bilibili.com:3478' }, // Bilibili
        { urls: 'stun:global.stun.twilio.com:3478' }, // Global Backup
    ];

    // 2. Inject TURN credentials from Environment Variables (Security Best Practice)
    // NEVER commit hardcoded TURN credentials to Git.
    if (import.meta.env.VITE_TURN_USER && import.meta.env.VITE_TURN_PASS) {
        servers.push({
            urls: 'turn:global.turn.metered.ca:80', // Example Provider
            username: import.meta.env.VITE_TURN_USER,
            credential: import.meta.env.VITE_TURN_PASS,
        });
        servers.push({
            urls: 'turn:global.turn.metered.ca:443',
            username: import.meta.env.VITE_TURN_USER,
            credential: import.meta.env.VITE_TURN_PASS,
        });
    }

    return servers;
};

/**
 * Creates PeerJS configuration.
 * Allows runtime selection of Cloud or LAN mode.
 * @param mode - 'CLOUD' for public internet (PeerJS Cloud), 'LAN' for local network
 * @param hostIP - Optional: custom signaling server Host/IP. Required for 'LAN' guests to connect to host.
 */
export const getPeerConfig = (mode: 'CLOUD' | 'LAN' = 'CLOUD', hostIP?: string) => {
    if (mode === 'LAN') {
        return {
            host: hostIP || 'localhost',
            port: 9000,
            path: '/gemduel',
            secure: false,
            debug: 2,
            config: {
                iceServers: GET_ICE_SERVERS(),
                iceTransportPolicy: 'all' as RTCIceTransportPolicy,
            },
        };
    }

    // PeerJS Cloud Config (Default)
    return {
        secure: true, // Cloud requires SSL
        debug: 2,
        config: {
            iceServers: GET_ICE_SERVERS(),
            iceTransportPolicy: 'all' as RTCIceTransportPolicy,
        },
    };
};
