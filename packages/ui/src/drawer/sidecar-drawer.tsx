'use client';

import {
    useEffect,
    useId,
    useRef,
    useState,
    type KeyboardEvent as ReactKeyboardEvent,
    type ReactNode,
} from 'react';

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

const getFocusableElements = (root: HTMLElement | null) =>
    root
        ? Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
              (element) =>
                  !element.hasAttribute('disabled') &&
                  element.getAttribute('aria-hidden') !== 'true'
          )
        : [];

export const SidecarDrawer = ({
    title,
    children,
    mode = 'panel',
    triggerLabel,
    triggerSummary = null,
    triggerBadge = null,
    triggerTestId,
    panelTestId,
    placement = 'rail',
    size = 'narrow',
    openLabel = 'View',
    closeLabel = 'Close',
    triggerVariant = 'default',
}: {
    title: string;
    children: ReactNode;
    mode?: 'panel' | 'drawer';
    triggerLabel?: string;
    triggerSummary?: ReactNode;
    triggerBadge?: ReactNode;
    triggerTestId?: string;
    panelTestId?: string;
    placement?: 'rail' | 'floating';
    size?: 'narrow' | 'wide';
    openLabel?: string;
    closeLabel?: string;
    triggerVariant?: 'default' | 'icon';
}) => {
    const dialogId = useId();
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (mode !== 'drawer' || !open) {
            return;
        }

        const previousActiveElement =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const focusPanel = window.requestAnimationFrame(() => {
            const focusables = getFocusableElements(panelRef.current);
            (focusables[0] ?? panelRef.current)?.focus();
        });

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setOpen(false);
                return;
            }

            if (event.key !== 'Tab') {
                return;
            }

            const focusables = getFocusableElements(panelRef.current);
            if (focusables.length === 0) {
                event.preventDefault();
                panelRef.current?.focus();
                return;
            }

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (!first || !last) {
                event.preventDefault();
                panelRef.current?.focus();
                return;
            }
            const activeElement =
                document.activeElement instanceof HTMLElement ? document.activeElement : null;

            if (event.shiftKey) {
                if (
                    !activeElement ||
                    activeElement === first ||
                    activeElement === panelRef.current
                ) {
                    event.preventDefault();
                    last.focus();
                }
                return;
            }

            if (activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            window.cancelAnimationFrame(focusPanel);
            document.removeEventListener('keydown', handleKeyDown);
            previousActiveElement?.focus();
        };
    }, [mode, open]);

    if (mode === 'panel') {
        return (
            <section className="gd-sidecar-drawer">
                <div className="gd-section-header">
                    <h2>{title}</h2>
                </div>
                <div>{children}</div>
            </section>
        );
    }

    const handleClose = () => {
        setOpen(false);
        triggerRef.current?.focus();
    };

    const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            handleClose();
        }
    };

    return (
        <div
            className={
                placement === 'floating'
                    ? 'gd-sidecar-drawer-launcher is-floating'
                    : 'gd-sidecar-drawer-launcher'
            }
        >
            <button
                ref={triggerRef}
                type="button"
                className={
                    triggerVariant === 'icon'
                        ? 'gd-sidecar-drawer-trigger is-icon'
                        : placement === 'floating'
                          ? 'gd-sidecar-drawer-trigger is-floating'
                          : 'gd-sidecar-drawer-trigger'
                }
                data-testid={triggerTestId}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={dialogId}
                onClick={() => setOpen(true)}
            >
                {triggerVariant === 'icon' ? (
                    <>
                        <span className="gd-visually-hidden">{triggerLabel ?? title}</span>
                        {triggerBadge ?? <span className="gd-shell-badge">{openLabel}</span>}
                    </>
                ) : (
                    <>
                        <span className="gd-sidecar-drawer-trigger-copy">
                            <strong>{triggerLabel ?? title}</strong>
                            {triggerSummary ? (
                                <span className="gd-sidecar-drawer-trigger-summary">
                                    {triggerSummary}
                                </span>
                            ) : null}
                        </span>
                        {triggerBadge ?? <span className="gd-shell-badge">{openLabel}</span>}
                    </>
                )}
            </button>

            {open ? (
                <div
                    className="gd-sidecar-drawer-backdrop"
                    role="presentation"
                    onClick={handleClose}
                >
                    <div
                        ref={panelRef}
                        id={dialogId}
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        tabIndex={-1}
                        data-testid={panelTestId}
                        className={
                            size === 'wide'
                                ? 'gd-sidecar-drawer-dialog is-wide'
                                : 'gd-sidecar-drawer-dialog'
                        }
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={handlePanelKeyDown}
                    >
                        <div className="gd-sidecar-drawer-dialog-header">
                            <span className="gd-shell-badge">{triggerLabel ?? title}</span>
                            <button
                                type="button"
                                className="gd-button gd-button-muted"
                                onClick={handleClose}
                            >
                                {closeLabel}
                            </button>
                        </div>
                        <div className="gd-sidecar-drawer-dialog-body">{children}</div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
