import Link from 'next/link';
import { openApiDocument } from '@gem-duel/contracts';
import { Section } from '@gem-duel/ui';

export default function HomePage() {
    return (
        <>
            <section className="gd-hero">
                <div className="gd-panel">
                    <p className="gd-muted">ZH</p>
                    <h2>新主应用入口已经切换到 Next.js App Router</h2>
                    <p>
                        当前仓库已经具备
                        monorepo、contracts、domain、core-engine、application、adapters、ui、
                        web、desktop 和 room-service 的骨架与第一条可运行主链路。
                    </p>
                    <p className="gd-muted">EN</p>
                    <p>
                        The repo now runs on a monorepo layout with a deterministic engine, typed
                        contracts, a Next.js shell, an Electron shell, and a Fastify room-service
                        scaffold.
                    </p>
                    <div className="gd-action-list">
                        <Link className="gd-link" href="/play/local">
                            Launch Local Demo
                        </Link>
                        <Link className="gd-link" href="/rooms">
                            Inspect Room APIs
                        </Link>
                        <Link className="gd-link" href="/rulebook">
                            Read Rulebook Strategy
                        </Link>
                    </div>
                </div>
                <div className="gd-panel">
                    <p className="gd-muted">Public Surface</p>
                    <pre>{JSON.stringify(openApiDocument.paths, null, 2)}</pre>
                </div>
            </section>

            <Section title="Refactor Status">
                <div className="gd-grid">
                    <div className="gd-card">
                        <strong>Apps</strong>
                        <span>web / desktop / room-service</span>
                    </div>
                    <div className="gd-card">
                        <strong>Packages</strong>
                        <span>contracts / domain / core-engine / application / adapters / ui</span>
                    </div>
                    <div className="gd-card">
                        <strong>Legacy</strong>
                        <span>Existing old/legacy-vite-electron remains read-only reference</span>
                    </div>
                </div>
            </Section>
        </>
    );
}
