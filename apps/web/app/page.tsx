import Link from 'next/link';
import { ENGINE_VERSION, SCHEMA_VERSION } from '@gem-duel/contracts';
import { Section } from '@gem-duel/ui';

export default function HomePage() {
    return (
        <>
            <section className="gd-hero">
                <div className="gd-panel">
                    <p className="gd-muted">ZH</p>
                    <h2>当前主页仍是验证壳，不是完整盘面 UI</h2>
                    <p>
                        当前仓库已完成重构工程边界收口，并提供本地、AI、在线与观战流程的
                        deterministic validation shell；完整产品盘面与后续整改顺序已转入 full-board
                        roadmap 跟踪。
                    </p>
                    <p className="gd-muted">EN</p>
                    <p>
                        This homepage currently exposes a deterministic validation shell for local,
                        AI, online, and spectator flows. It reflects engineering closure rather than
                        a player-complete board product, and the remaining product UI work is
                        tracked in the full-board roadmap.
                    </p>
                    <div className="gd-action-list">
                        <Link className="gd-link" href="/play/local">
                            Launch Local Validation
                        </Link>
                        <Link className="gd-link" href="/play/run">
                            Launch Roguelike Validation
                        </Link>
                        <Link className="gd-link" href="/rooms">
                            Open Room Validation
                        </Link>
                        <Link className="gd-link" href="/rulebook">
                            Read Rulebook Strategy
                        </Link>
                        <Link
                            className="gd-link"
                            href="https://github.com/mingzhi0119/Gem-Duel/blob/main/docs/10-architecture/full-board-ui-roadmap.md"
                            rel="noreferrer"
                            target="_blank"
                        >
                            Read Full-Board Roadmap
                        </Link>
                    </div>
                </div>
                <div className="gd-panel">
                    <p className="gd-muted">Validation Metadata</p>
                    <p>Schema Version: {SCHEMA_VERSION}</p>
                    <p>Engine Version: {ENGINE_VERSION}</p>
                    <p>
                        These versions are shown as internal validation metadata while the default
                        entrypoint remains a verification shell and not the final player-facing
                        board UI.
                    </p>
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
                        <span>Legacy extracts now live in docs/99-legacy and git history</span>
                    </div>
                </div>
            </Section>
        </>
    );
}
