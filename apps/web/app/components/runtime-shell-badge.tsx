'use client';

import { useEffect, useState } from 'react';

type DesktopShellBridge = {
    getVersion: () => Promise<string>;
};

export function RuntimeShellBadge() {
    const [label, setLabel] = useState('Web Shell');

    useEffect(() => {
        const desktopShell = (
            globalThis as typeof globalThis & {
                desktopShell?: DesktopShellBridge;
            }
        ).desktopShell;

        if (!desktopShell) {
            setLabel('Web Shell');
            return;
        }

        desktopShell
            .getVersion()
            .then((version) => {
                setLabel(`Desktop Shell v${version}`);
            })
            .catch(() => {
                setLabel('Desktop Shell');
            });
    }, []);

    return <span className="gd-shell-badge">{label}</span>;
}
