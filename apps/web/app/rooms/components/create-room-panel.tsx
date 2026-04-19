'use client';

import { startTransition, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createRoomFromBrowser } from '@/lib/browser-room-service';
import { getUiMessages, OnlineLobbyScene, type UiLocale } from '@gem-duel/ui';
import { ProductBackLink } from '@/app/components/product-back-link';

const appendLang = (href: string, locale: UiLocale) =>
    locale === 'zh' ? `${href}${href.includes('?') ? '&' : '?'}lang=zh` : href;

export function CreateRoomPanel({ locale }: { locale: UiLocale }) {
    const router = useRouter();
    const messages = getUiMessages(locale).onlineArena;
    const [roomId, setRoomId] = useState<string | null>(null);
    const [joinRoomId, setJoinRoomId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const lobbyStatus = useMemo(() => {
        if (roomId) {
            return `${messages.footerPrefix}: ${messages.footerReady}`;
        }
        return `${messages.footerPrefix}: ${messages.footerIdle}`;
    }, [messages.footerIdle, messages.footerPrefix, messages.footerReady, roomId]);

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

    const openRoom = (targetRoomId: string) => {
        router.push(appendLang(`/rooms/${targetRoomId}`, locale));
    };

    const handleJoinSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmedRoomId = joinRoomId.trim();
        if (!trimmedRoomId) {
            return;
        }
        openRoom(trimmedRoomId);
    };

    return (
        <OnlineLobbyScene
            eyebrow={messages.eyebrow}
            title={messages.title}
            subtitle={<p>{messages.subtitle}</p>}
            topbar={
                <ProductBackLink href={appendLang('/', locale)}>
                    {messages.backHomeLabel}
                </ProductBackLink>
            }
            footer={<span className="gd-product-status-strip">{lobbyStatus}</span>}
            hostPanel={
                <>
                    <div className="gd-online-lobby-panel-header">
                        <div className="gd-online-lobby-panel-copy">
                            <h2>{messages.hostTitle}</h2>
                            <p>{messages.hostSummary}</p>
                        </div>
                        <span className="gd-shell-badge">Host</span>
                    </div>

                    <div className="gd-online-lobby-panel-body">
                        <div className="gd-online-lobby-id-card">
                            <span className="gd-muted">{messages.hostIdLabel}</span>
                            {roomId ? (
                                <code data-testid="online-lobby-room-id">{roomId}</code>
                            ) : (
                                <span className="gd-muted">{messages.hostIdleHint}</span>
                            )}
                        </div>
                        <p className="gd-muted">
                            {roomId ? messages.hostReadyHint : messages.hostIdleHint}
                        </p>
                    </div>

                    <div className="gd-online-lobby-panel-actions">
                        <div className="gd-online-lobby-inline-actions">
                            <button
                                type="button"
                                className="gd-button"
                                disabled={isSubmitting}
                                onClick={handleCreateRoom}
                            >
                                {isSubmitting
                                    ? messages.hostCreatingLabel
                                    : messages.hostCreateLabel}
                            </button>
                            {roomId ? (
                                <button
                                    type="button"
                                    className="gd-link"
                                    onClick={() => openRoom(roomId)}
                                >
                                    {messages.hostOpenLabel}
                                </button>
                            ) : null}
                        </div>
                        {error ? <p className="gd-error">{error}</p> : null}
                    </div>
                </>
            }
            joinPanel={
                <>
                    <div className="gd-online-lobby-panel-header">
                        <div className="gd-online-lobby-panel-copy">
                            <h2>{messages.joinTitle}</h2>
                            <p>{messages.joinSummary}</p>
                        </div>
                        <span className="gd-shell-badge">Join</span>
                    </div>

                    <form className="gd-online-lobby-panel-body" onSubmit={handleJoinSubmit}>
                        <label className="gd-form-field">
                            <span>{messages.joinInputLabel}</span>
                            <input
                                value={joinRoomId}
                                placeholder={messages.joinPlaceholder}
                                onChange={(event) => setJoinRoomId(event.target.value)}
                            />
                        </label>
                        <p className="gd-online-lobby-status gd-muted">
                            {joinRoomId.trim()
                                ? `${messages.joinInputLabel}: ${joinRoomId.trim()}`
                                : messages.joinDisabledHint}
                        </p>
                        <button
                            type="submit"
                            className="gd-button"
                            disabled={joinRoomId.trim().length === 0}
                        >
                            {messages.joinOpenLabel}
                        </button>
                    </form>
                </>
            }
        />
    );
}
