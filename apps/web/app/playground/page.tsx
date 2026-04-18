import Link from 'next/link';
import { PLAYGROUND_SCENES } from './scene-fixtures';

export default function PlaygroundIndexPage() {
    return (
        <section className="gd-scene-frame" data-testid="playground-gallery">
            <header className="gd-scene-frame-header">
                <div>
                    <p className="gd-scene-eyebrow">Phase 3 Shared Primitives</p>
                    <h2>Static Scene Gallery</h2>
                    <p className="gd-muted">
                        ZH: 这些页面是 `packages/ui` 的静态场景宿主，用于覆盖完整 Phase 3 board
                        primitives、shared drawers 和 visual baselines。 EN: These pages are the
                        static scene host for `packages/ui`, covering the Phase 3 board primitives,
                        shared drawers, and visual baselines.
                    </p>
                </div>
                <div className="gd-scene-badge-group">
                    <span className="gd-shell-badge">phase-3</span>
                    <span className="gd-shell-badge">check-visual</span>
                </div>
            </header>

            <div className="gd-scene-link-grid">
                {PLAYGROUND_SCENES.map((scene) => (
                    <Link
                        key={scene.id}
                        href={`/playground/${scene.id}`}
                        className="gd-scene-link-card"
                    >
                        <strong>{scene.title}</strong>
                        <span>{scene.summary}</span>
                        <span className="gd-muted">{scene.eyebrow}</span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
