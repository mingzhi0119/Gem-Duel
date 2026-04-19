export { ActionList } from './primitives/action-list';
export { Section } from './primitives/section';
export { SnapshotSummary } from './primitives/snapshot-summary';
export { BoardSceneScaffold } from './board/board-scaffold';
export { BoardGrid } from './board/board-grid';
export { TokenCell } from './board/token-cell';
export { CardSlot } from './board/card-slot';
export { MarketStack } from './board/market-stack';
export { ReserveTray } from './board/reserve-tray';
export { PlayerZone } from './board/player-zone';
export { RoyalCourt } from './board/royal-court';
export { PromptBanner } from './board/prompt-banner';
export { SelectionOverlay } from './board/selection-overlay';
export { RunPanel } from './board/run-panel';
export { TurnHud } from './hud/turn-hud';
export { getUiMessages, resolveUiLocale, type UiLocale, type UiMessages } from './i18n/messages';
export { SidecarDrawer } from './drawer/sidecar-drawer';
export {
    ReplayDrawer,
    type ReplayDrawerModel,
    type ReplayDrawerStep,
} from './drawer/replay-drawer';
export { AiTraceDrawer, type AiTraceCandidate, type AiTraceEntry } from './drawer/ai-trace-drawer';
export { RoomTable } from './tables/room-table';
export { BoardScene, type BoardSceneScenarioMeta, type BoardSceneSlots } from './views/board-scene';
export { PlayerEntryScene } from './views/player-entry-scene';
export { OnlineLobbyScene } from './views/online-lobby-scene';
export { DraftChoiceScene } from './views/draft-choice-scene';
export { MatchView } from './views/match-view';
export { TerminalOverlay } from './views/terminal-overlay';
export { PlaygroundSceneFrame } from './playground/scene-frame';
export {
    DEFAULT_RESOLVED_SHELL_THEME,
    DEFAULT_SHELL_THEME_MODE,
    SHELL_PRESENTATION_SYNC_EVENT,
    SHELL_STYLE_QUERY_PARAM,
    SHELL_STYLE_STORAGE_KEY,
    SHELL_THEME_MODES,
    SHELL_THEME_QUERY_PARAM,
    SHELL_THEME_STORAGE_KEY,
    resolveResolvedShellTheme,
    resolveShellPresentation,
    resolveShellThemeMode,
    type ResolvedShellTheme,
    type ShellThemeMode,
} from './styles/shell-presentation';
export {
    DEFAULT_SHELL_STYLE_ID,
    SHELL_STYLE_IDS,
    SHELL_STYLE_REGISTRY,
    isShellStyleId,
    resolveShellStyleId,
    type ShellStyleDefinition,
    type ShellStyleId,
} from './styles/style-registry';
