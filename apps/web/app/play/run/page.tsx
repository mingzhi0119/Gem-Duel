import { resolveUiLocale } from '@gem-duel/ui';
import { RunPlayground } from '../components/run-playground';

const getFirstSearchParamValue = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

export default async function RunPlayPage({
    searchParams,
}: {
    searchParams?: Promise<{ lang?: string | string[]; mode?: string | string[] }>;
}) {
    const params = searchParams ? await searchParams : undefined;
    const locale = resolveUiLocale(getFirstSearchParamValue(params?.lang));
    const mode = getFirstSearchParamValue(params?.mode) === 'local' ? 'local' : 'ai';

    return <RunPlayground seed={20260417} mode={mode} locale={locale} />;
}
