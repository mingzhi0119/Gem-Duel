import { getUiMessages, PlayerEntryScene, resolveUiLocale } from '@gem-duel/ui';
import { ProductBackLink } from '@/app/components/product-back-link';
import { ProductEntryLinkCard } from '@/app/components/product-entry-link-card';

const appendLang = (href: string, locale: 'en' | 'zh') =>
    locale === 'zh' ? `${href}${href.includes('?') ? '&' : '?'}lang=zh` : href;

export default async function RoguelikeHubPage({
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
            title={messages.roguelikeHubTitle}
            subtitle={<p>{messages.roguelikeHubSubtitle}</p>}
            topbar={
                <ProductBackLink href={appendLang('/', locale)}>
                    {messages.backHomeLabel}
                </ProductBackLink>
            }
        >
            <ProductEntryLinkCard
                href={appendLang('/play/run?mode=local', locale)}
                title={messages.runLocalTitle}
                summary={messages.runLocalSummary}
                tone="local"
            />
            <ProductEntryLinkCard
                href={appendLang('/play/run?mode=ai', locale)}
                title={messages.runAiTitle}
                summary={messages.runAiSummary}
                tone="roguelike"
            />
        </PlayerEntryScene>
    );
}
