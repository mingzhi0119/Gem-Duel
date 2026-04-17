'use client';

import { startTransition, useState } from 'react';
import Link from 'next/link';
import { createRoomFromBrowser } from '@/lib/browser-room-service';
import { Section } from '@gem-duel/ui';

export function CreateRoomPanel() {
    const [roomId, setRoomId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateRoom = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            const room = await createRoomFromBrowser({
                mode: 'online',
                seed: 20260417,
                flags: {
                    roguelike: false,
                    onlineAuthoritative: true,
                    aiEnabled: false,
                },
            });
            startTransition(() => {
                setRoomId(room.roomId);
            });
        } catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError.message : 'Failed to create room.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Section title="Create Authoritative Room">
            <p className="gd-muted">
                ZH: Step 06 起，Web 直接创建 room-service 房间，然后通过 `room.join` / `room.watch`
                接入实时流。 EN: Starting in Step 06, the Web shell creates a room-service room
                first and then enters the live stream through `room.join` or `room.watch`.
            </p>
            <div className="gd-action-list">
                <button
                    type="button"
                    className="gd-button"
                    disabled={isSubmitting}
                    onClick={handleCreateRoom}
                >
                    {isSubmitting ? 'Creating…' : 'Create Online Room'}
                </button>
                {roomId ? (
                    <Link className="gd-link" href={`/rooms/${roomId}`}>
                        Open {roomId}
                    </Link>
                ) : null}
            </div>
            {error ? <p className="gd-error">{error}</p> : null}
        </Section>
    );
}
