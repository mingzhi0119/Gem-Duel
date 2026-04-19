import { resolveUiLocale } from '@gem-duel/ui';
import { RulebookClient } from './rulebook-client';
import type { RulebookLocale } from './rulebook-content';

export default async function RulebookPage({
    searchParams,
}: {
    searchParams?: Promise<{ lang?: string | string[] }>;
}) {
    const params = searchParams ? await searchParams : undefined;
    const rawLang = Array.isArray(params?.lang) ? params?.lang[0] : params?.lang;
    const locale = resolveUiLocale(rawLang) as RulebookLocale;

    return <RulebookClient initialLocale={locale} />;
}
