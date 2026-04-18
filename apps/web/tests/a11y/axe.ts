import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

const formatViolations = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) =>
    violations
        .map((violation) => {
            const targets = violation.nodes
                .flatMap((node) => node.target)
                .map((target) => (Array.isArray(target) ? target.join(' ') : target))
                .join(', ');
            return `${violation.id} (${violation.impact ?? 'unknown'}): ${targets}`;
        })
        .join('\n');

export const expectNoSeriousA11yViolations = async (page: Page, surface: string) => {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const blockingViolations = results.violations.filter(
        (violation) => violation.impact === 'critical' || violation.impact === 'serious'
    );

    expect(
        blockingViolations,
        blockingViolations.length === 0
            ? `${surface} should have no serious accessibility violations.`
            : `${surface} has serious accessibility violations:\n${formatViolations(blockingViolations)}`
    ).toEqual([]);
};
