import { resolveUiLocale } from '@gem-duel/ui';
import { MatchPlayground } from '../components/match-playground';
import { isLocalPhase4ScenarioId, type LocalPhase4ScenarioId } from './scenarios';

const getFirstSearchParamValue = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

export default async function LocalPlayPage({
    searchParams,
}: {
    searchParams?: Promise<{
        scenario?: string | string[];
        shell?: string | string[];
        lang?: string | string[];
    }>;
}) {
    const params = searchParams ? await searchParams : undefined;
    const shell = getFirstSearchParamValue(params?.shell) === 'debug' ? 'debug' : 'default';
    const rawScenario = getFirstSearchParamValue(params?.scenario);
    const locale = resolveUiLocale(getFirstSearchParamValue(params?.lang));
    const scenarioId: LocalPhase4ScenarioId | null =
        rawScenario && isLocalPhase4ScenarioId(rawScenario) ? rawScenario : null;

    return (
        <MatchPlayground
            mode="local"
            seed={20260416}
            aiEnabled={false}
            roguelike={false}
            shellMode={shell}
            scenarioId={scenarioId}
            locale={locale}
        />
    );
}
