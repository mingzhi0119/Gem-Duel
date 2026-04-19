import { getUiMessages, PlayerEntryScene, resolveUiLocale } from '@gem-duel/ui';
import { ProductBackLink } from '@/app/components/product-back-link';
import { ProductEntryLinkCard } from '@/app/components/product-entry-link-card';

const appendLang = (href: string, locale: 'en' | 'zh') =>
    locale === 'zh' ? `${href}${href.includes('?') ? '&' : '?'}lang=zh` : href;

export default async function ClassicHubPage({
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
            variant="hub"
            title={messages.classicHubTitle}
            subtitle={<p>{messages.classicHubSubtitle}</p>}
            topbar={
                <ProductBackLink href={appendLang('/', locale)}>
                    {messages.backHomeLabel}
                </ProductBackLink>
            }
        >
            <ProductEntryLinkCard
                href={appendLang('/play/local', locale)}
                title={messages.localTitle}
                summary={messages.localSummary}
                tone="local"
            />
            <ProductEntryLinkCard
                href={appendLang('/play/ai', locale)}
                title={messages.aiTitle}
                summary={messages.aiSummary}
                tone="ai"
            />
        </PlayerEntryScene>
    );
}
