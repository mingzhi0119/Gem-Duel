import Link from 'next/link';
import { Section } from '@gem-duel/ui';

export default function RoomsPage() {
    return (
        <>
            <Section title="Room Service Contract">
                <p className="gd-muted">
                    ZH: 在线房间的权威逻辑应由 room-service 承担，Next.js 这里只保留 BFF 和页面壳。
                    EN: The authoritative online match lifecycle lives in room-service; the Next app
                    only hosts the shell and BFF routes.
                </p>
                <div className="gd-action-list">
                    <Link className="gd-link" href="/rooms/demo-room">
                        Open Demo Room Route
                    </Link>
                </div>
            </Section>
        </>
    );
}
