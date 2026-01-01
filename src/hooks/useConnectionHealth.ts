import { useCallback, useEffect, useRef, useState } from 'react';
import { DataConnection } from 'peerjs';
import { NetworkMessage } from '../types/network';

const PING_INTERVAL_MS = 2000;
const TIMEOUT_THRESHOLD_MS = 6000; // Missed 3 pings = trouble

export const useConnectionHealth = (
    connection: DataConnection | null,
    sendMessage: (msg: NetworkMessage) => void
) => {
    const [latency, setLatency] = useState<number>(0);
    const [isUnstable, setIsUnstable] = useState(false);
    const lastPongRef = useRef<number>(Date.now());
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // 1. Heartbeat Loop
    useEffect(() => {
        if (!connection || !connection.open) return;

        // Reset timer on connection open
        lastPongRef.current = Date.now();

        pingIntervalRef.current = setInterval(() => {
            const now = Date.now();

            // Check for timeout
            if (now - lastPongRef.current > TIMEOUT_THRESHOLD_MS) {
                console.warn('[NET] Connection unstable: No PONG received.');
                setIsUnstable(true);
                // Optional: Trigger active reconnection logic here
            } else {
                setIsUnstable(false);
            }

            sendMessage({ type: 'HEARTBEAT_PING', timestamp: now });
        }, PING_INTERVAL_MS);

        return () => {
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        };
    }, [connection, sendMessage]);

    // 2. Message Handler (Call this from useOnlineManager when data arrives)
    const handleHeartbeat = useCallback(
        (msg: NetworkMessage) => {
            if (msg.type === 'HEARTBEAT_PING') {
                sendMessage({ type: 'HEARTBEAT_PONG', timestamp: msg.timestamp });
            } else if (msg.type === 'HEARTBEAT_PONG') {
                const rtt = Date.now() - msg.timestamp;
                setLatency(rtt);
                lastPongRef.current = Date.now();
                setIsUnstable(false);
            }
        },
        [sendMessage]
    );

    return { latency, isUnstable, handleHeartbeat };
};
