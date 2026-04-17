import Link from 'next/link';
import { PLAYGROUND_SCENES } from './scene-fixtures';

export default function PlaygroundIndexPage() {
    return (
        <section className="gd-scene-frame" data-testid="playground-gallery">
            <header className="gd-scene-frame-header">
                <div>
                    <p className="gd-scene-eyebrow">Phase 2.5 Visual Harness</p>
                    <h2>Static Scene Gallery</h2>
                    <p className="gd-muted">
                        ZH: 这些页面是 `packages/ui` 的静态场景宿主，用于为 Phase 3 primitives 和
                        visual baselines 提供稳定入口。 EN: These pages are the static scene host
                        for `packages/ui`, giving Phase 3 primitives and visual baselines a stable
                        entrypoint.
                    </p>
                </div>
                <div className="gd-scene-badge-group">
                    <span className="gd-shell-badge">phase-2.5</span>
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
