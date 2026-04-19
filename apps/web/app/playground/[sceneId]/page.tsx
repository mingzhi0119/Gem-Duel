import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlaygroundSceneFrame } from '@gem-duel/ui';
import { PLAYGROUND_SCENES, getPlaygroundScene } from '../scene-fixtures';

export function generateStaticParams() {
    return PLAYGROUND_SCENES.map((scene) => ({
        sceneId: scene.id,
    }));
}

export default async function PlaygroundScenePage({
    params,
}: {
    params: Promise<{ sceneId: string }>;
}) {
    const { sceneId } = await params;
    const scene = getPlaygroundScene(sceneId);

    if (!scene) {
        notFound();
    }

    return (
        <div className="gd-utility-route">
            <div className="gd-scene-stack">
                <nav className="gd-action-list" aria-label="Playground scenes">
                    <Link href="/playground" className="gd-link">
                        Scene Gallery
                    </Link>
                    {PLAYGROUND_SCENES.map((candidate) => (
                        <Link
                            key={candidate.id}
                            href={`/playground/${candidate.id}`}
                            className="gd-link"
                        >
                            {candidate.shortLabel}
                        </Link>
                    ))}
                </nav>

                <PlaygroundSceneFrame
                    eyebrow={scene.eyebrow}
                    title={scene.title}
                    description={<p>{scene.summary}</p>}
                    viewModel={scene.viewModel}
                    note={scene.note}
                    sidecarTitle={scene.sidecarTitle}
                    sidecar={scene.sidecar}
                    extraPanels={scene.extraPanels}
                />
            </div>
        </div>
    );
}
