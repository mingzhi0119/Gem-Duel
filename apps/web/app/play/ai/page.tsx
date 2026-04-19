import { resolveUiLocale } from '@gem-duel/ui';
import { MatchPlayground } from '../components/match-playground';

const getFirstSearchParamValue = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

export default async function AiPlayPage({
    searchParams,
}: {
    searchParams?: Promise<{ lang?: string | string[] }>;
}) {
    const params = searchParams ? await searchParams : undefined;
    const locale = resolveUiLocale(getFirstSearchParamValue(params?.lang));

    return <MatchPlayground mode="ai" seed={20260416} aiEnabled={true} locale={locale} />;
}
