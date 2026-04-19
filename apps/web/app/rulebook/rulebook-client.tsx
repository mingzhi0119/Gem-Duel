'use client';

import { useState } from 'react';
import { ProductBackLink } from '../components/product-back-link';
import {
    RULEBOOK_FACTS,
    RULEBOOK_PAGE_COPY,
    RULEBOOK_SECTIONS,
    RULEBOOK_SOURCES,
    type RulebookLocale,
} from './rulebook-content';

const panelStyle = {
    background:
        'linear-gradient(180deg, rgba(255,255,255,0.05), transparent 18%), linear-gradient(180deg, rgba(10,18,31,0.96), rgba(7,13,24,0.98))',
    borderColor: 'var(--gd-border)',
    boxShadow: '0 26px 48px rgba(0, 0, 0, 0.28)',
} as const;

const chipStyle = {
    background: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(148, 163, 184, 0.22)',
} as const;

const shellStyle = {
    background:
        'radial-gradient(circle at top, rgba(255,204,102,0.08), transparent 20%), radial-gradient(circle at 14% 10%, rgba(105,215,255,0.10), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 18%), linear-gradient(180deg, rgba(4,10,20,0.88), rgba(6,14,27,0.98))',
    borderColor: 'var(--gd-border)',
    boxShadow: 'var(--gd-style-stage-glow, 0 28px 64px rgba(0,0,0,0.36))',
} as const;

export function RulebookClient({ initialLocale }: { initialLocale: RulebookLocale }) {
    const [locale, setLocale] = useState<RulebookLocale>(initialLocale);

    return (
        <div className="gd-utility-route">
            <section
                data-testid="rulebook-shell"
                className="relative overflow-hidden rounded-[2rem] border p-4 md:p-5 xl:p-6"
                style={shellStyle}
            >
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-50"
                    style={{
                        background:
                            'repeating-linear-gradient(90deg, transparent 0 54px, rgba(109,133,170,0.08) 54px 55px), repeating-linear-gradient(180deg, transparent 0 54px, rgba(109,133,170,0.08) 54px 55px)',
                    }}
                />
                <div className="relative grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)]">
                    <aside className="grid gap-4 xl:sticky xl:top-6 xl:self-start">
                        <section
                            className="grid gap-4 rounded-[1.6rem] border p-5"
                            style={panelStyle}
                        >
                            <ProductBackLink href="/">
                                {RULEBOOK_PAGE_COPY.backLabel[locale]}
                            </ProductBackLink>

                            <div className="grid gap-2">
                                <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-200/80">
                                    {RULEBOOK_PAGE_COPY.localeLabel[locale]}
                                </p>
                                <div className="flex gap-2">
                                    {(['zh', 'en'] as const).map((option) => {
                                        const active = locale === option;
                                        return (
                                            <button
                                                key={option}
                                                type="button"
                                                data-testid={`rulebook-locale-${option}`}
                                                aria-pressed={active}
                                                onClick={() => setLocale(option)}
                                                className={`min-h-10 rounded-full border px-4 text-sm font-semibold tracking-[0.12em] transition ${
                                                    active
                                                        ? 'text-slate-950'
                                                        : 'text-slate-100 hover:-translate-y-px'
                                                }`}
                                                style={{
                                                    ...chipStyle,
                                                    background: active
                                                        ? 'linear-gradient(180deg, rgba(255,230,173,0.98), rgba(255,204,102,0.92))'
                                                        : chipStyle.background,
                                                }}
                                            >
                                                {option === 'zh' ? '中文' : 'EN'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-200/80">
                                    {RULEBOOK_PAGE_COPY.navLabel[locale]}
                                </p>
                                <nav
                                    aria-label={RULEBOOK_PAGE_COPY.navLabel[locale]}
                                    data-testid="rulebook-nav"
                                    className="grid gap-2"
                                >
                                    {RULEBOOK_SECTIONS.map((section, index) => (
                                        <a
                                            key={section.id}
                                            href={`#${section.id}`}
                                            className="flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm text-slate-100 transition hover:-translate-y-px"
                                            style={chipStyle}
                                        >
                                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-300/12 font-mono text-[0.72rem] text-cyan-100">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <span className="min-w-0 leading-5">
                                                {section.title[locale]}
                                            </span>
                                        </a>
                                    ))}
                                </nav>
                            </div>

                            <div className="grid gap-3">
                                <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-200/80">
                                    {RULEBOOK_PAGE_COPY.sourcesLabel[locale]}
                                </p>
                                <div className="grid gap-2">
                                    {RULEBOOK_SOURCES.map((source) => (
                                        <a
                                            key={source.href}
                                            href={source.href}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="grid gap-1 rounded-2xl border px-3 py-3 text-sm text-slate-100 transition hover:-translate-y-px"
                                            style={chipStyle}
                                        >
                                            <strong className="text-sm text-slate-50">
                                                {source.label[locale]}
                                            </strong>
                                            <span className="text-[0.82rem] leading-5 text-slate-300">
                                                {source.note[locale]}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section
                            className="grid gap-3 rounded-[1.6rem] border p-5"
                            style={panelStyle}
                        >
                            <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-cyan-200/80">
                                {RULEBOOK_PAGE_COPY.factsLabel[locale]}
                            </p>
                            <div className="grid gap-2">
                                {RULEBOOK_FACTS.map((fact) => (
                                    <article
                                        key={fact.label.en}
                                        className="grid gap-1 rounded-2xl border px-3 py-3"
                                        style={chipStyle}
                                    >
                                        <span className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-amber-100/80">
                                            {fact.label[locale]}
                                        </span>
                                        <p className="m-0 text-sm leading-6 text-slate-100">
                                            {fact.value[locale]}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </aside>

                    <div className="grid gap-4">
                        <header
                            className="grid gap-5 rounded-[1.8rem] border px-5 py-6 md:px-7 md:py-7"
                            style={panelStyle}
                        >
                            <div className="grid gap-3">
                                <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.28em] text-cyan-200/80">
                                    {RULEBOOK_PAGE_COPY.eyebrow[locale]}
                                </p>
                                <h1 className="m-0 text-4xl font-semibold tracking-[-0.04em] text-slate-50 md:text-6xl">
                                    {RULEBOOK_PAGE_COPY.title[locale]}
                                </h1>
                                <p className="m-0 max-w-4xl text-base leading-7 text-slate-300 md:text-lg">
                                    {RULEBOOK_PAGE_COPY.subtitle[locale]}
                                </p>
                                <p className="m-0 max-w-4xl text-sm leading-7 text-slate-400 md:text-[0.98rem]">
                                    {RULEBOOK_PAGE_COPY.description[locale]}
                                </p>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
                                {RULEBOOK_FACTS.map((fact) => (
                                    <article
                                        key={fact.label.en}
                                        className="grid gap-2 rounded-[1.4rem] border px-4 py-4"
                                        style={chipStyle}
                                    >
                                        <span className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-cyan-100/80">
                                            {fact.label[locale]}
                                        </span>
                                        <strong className="text-[0.96rem] leading-6 text-slate-50">
                                            {fact.value[locale]}
                                        </strong>
                                    </article>
                                ))}
                            </div>
                        </header>

                        <div className="grid gap-4">
                            {RULEBOOK_SECTIONS.map((section, index) => (
                                <section
                                    id={section.id}
                                    key={section.id}
                                    className="scroll-mt-6 rounded-[1.8rem] border px-5 py-5 md:px-6 md:py-6"
                                    style={panelStyle}
                                >
                                    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                                        <div className="grid gap-3">
                                            <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.26em] text-cyan-200/80">
                                                {section.eyebrow[locale]}
                                            </p>
                                            <h2 className="m-0 text-2xl font-semibold tracking-[-0.04em] text-slate-50 md:text-3xl">
                                                {section.title[locale]}
                                            </h2>
                                            <p className="m-0 max-w-4xl text-[0.98rem] leading-7 text-slate-300">
                                                {section.summary[locale]}
                                            </p>
                                        </div>
                                        <span
                                            aria-hidden="true"
                                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border font-mono text-sm text-amber-100/90"
                                            style={chipStyle}
                                        >
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                    </div>

                                    <ul className="mt-5 grid gap-3 pl-5 text-slate-100 marker:text-amber-200 md:mt-6">
                                        {section.bullets.map((bullet) => (
                                            <li
                                                key={`${section.id}-${bullet.en}`}
                                                className="text-[0.98rem] leading-7"
                                            >
                                                {bullet[locale]}
                                            </li>
                                        ))}
                                    </ul>

                                    {section.callout ? (
                                        <div
                                            className="mt-5 rounded-[1.3rem] border px-4 py-4 text-sm leading-7 text-amber-50 md:mt-6"
                                            style={{
                                                borderColor: 'rgba(255, 214, 122, 0.32)',
                                                background:
                                                    'linear-gradient(180deg, rgba(255,213,117,0.18), transparent 22%), linear-gradient(180deg, rgba(122,78,12,0.72), rgba(65,40,4,0.78))',
                                            }}
                                        >
                                            {section.callout[locale]}
                                        </div>
                                    ) : null}
                                </section>
                            ))}
                        </div>

                        <section
                            className="grid gap-4 rounded-[1.8rem] border px-5 py-5 md:px-6 md:py-6"
                            style={panelStyle}
                        >
                            <div className="grid gap-2">
                                <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.26em] text-cyan-200/80">
                                    {RULEBOOK_PAGE_COPY.sourcesLabel[locale]}
                                </p>
                                <h2 className="m-0 text-2xl font-semibold tracking-[-0.04em] text-slate-50">
                                    {locale === 'en'
                                        ? 'Where This Summary Comes From'
                                        : '这份摘要从哪里来'}
                                </h2>
                                <p className="m-0 max-w-4xl text-[0.98rem] leading-7 text-slate-300">
                                    {RULEBOOK_PAGE_COPY.sourceNote[locale]}
                                </p>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                {RULEBOOK_SOURCES.map((source) => (
                                    <a
                                        key={source.href}
                                        href={source.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="grid gap-2 rounded-[1.3rem] border px-4 py-4 transition hover:-translate-y-px"
                                        style={chipStyle}
                                    >
                                        <strong className="text-base text-slate-50">
                                            {source.label[locale]}
                                        </strong>
                                        <span className="text-sm leading-6 text-slate-300">
                                            {source.note[locale]}
                                        </span>
                                        <span className="text-[0.78rem] uppercase tracking-[0.16em] text-cyan-100/80">
                                            {locale === 'en' ? 'Open source' : '打开来源'}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </section>
        </div>
    );
}
