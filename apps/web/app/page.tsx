import { getUiMessages, PlayerEntryScene, resolveUiLocale } from '@gem-duel/ui';
import { ProductEntryLinkCard } from './components/product-entry-link-card';

const appendLang = (href: string, locale: 'en' | 'zh') =>
    locale === 'zh' ? `${href}${href.includes('?') ? '&' : '?'}lang=zh` : href;

export default async function HomePage({
    searchParams,
}: {
    searchParams?: Promise<{ lang?: string | string[] }>;
}) {
    const params = searchParams ? await searchParams : undefined;
    const rawLang = Array.isArray(params?.lang) ? params?.lang[0] : params?.lang;
    const locale = resolveUiLocale(rawLang);
    const messages = getUiMessages(locale).playerEntry;

    return (
        <PlayerEntryScene
            variant="landing"
            eyebrow={messages.homeEyebrow}
            title={messages.homeTitle}
            subtitle={<p>{messages.homeSubtitle}</p>}
            footer={<span>{messages.homeFooterHint}</span>}
        >
            <ProductEntryLinkCard
                href={appendLang('/play/classic', locale)}
                title={messages.classicTitle}
                summary={messages.classicSummary}
                tone="classic"
            />
            <ProductEntryLinkCard
                href={appendLang('/play/roguelike', locale)}
                title={messages.roguelikeTitle}
                summary={messages.roguelikeSummary}
                tone="roguelike"
                badge={
                    <span className="gd-player-entry-card-badge is-roguelike">
                        {messages.roguelikeBadge}
                    </span>
                }
            />
            <ProductEntryLinkCard
                href={appendLang('/rooms', locale)}
                title={messages.onlineTitle}
                summary={messages.onlineSummary}
                tone="online"
                meta={<span className="gd-product-status-strip">{messages.onlineKicker}</span>}
            />
        </PlayerEntryScene>
    );
}
