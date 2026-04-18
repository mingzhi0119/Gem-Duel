import type { UiRunPanel, VisibleSnapshot } from '@gem-duel/contracts';

export const buildRunPanel = (snapshot: VisibleSnapshot): UiRunPanel | null =>
    snapshot.runContext
        ? {
              runId: snapshot.runContext.runId,
              matchIndex: snapshot.runContext.matchIndex,
              wins: snapshot.runContext.wins,
              losses: snapshot.runContext.losses,
              activeBuffIds: snapshot.runContext.activeBuffs.map((buff) => buff.id),
          }
        : null;
