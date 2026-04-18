export type UiLocale = 'en' | 'zh';

export interface UiMessages {
    boardScene: {
        hashLabel: string;
        marketTitle: string;
        marketSlotsLabel: string;
        boardTitle: string;
        boardCellsLabel: string;
        playersTitle: string;
        playerZonesLabel: string;
        promptsTitle: string;
        royalCourtTitle: string;
        selectionDraftTitle: string;
        runSidecarTitle: string;
        turnHudTitle: string;
        replayReadOnlyNote: string;
        additionalActionsTitle: string;
        additionalActionsNote: string;
        scenarioFixtureTitle: string;
        scenarioLabel: string;
        expectedHashLabel: string;
        replayHashUnavailableLabel: string;
    };
    replay: {
        eyebrow: string;
        titlePrefix: string;
        note: string;
        localeLabel: string;
        localeEnglish: string;
        localeChinese: string;
        timelineTitle: string;
        timelineLabel: string;
        previousStep: string;
        nextStep: string;
        stepPrefix: string;
        currentStepHash: string;
        storedHash: string;
        recomputedHash: string;
        hashCheck: string;
        eventCheck: string;
        hashMatch: string;
        hashMismatch: string;
        noSteps: string;
        keyboardHint: string;
        currentStepLabel: string;
    };
    terminalOverlay: {
        eyebrow: string;
        localTitle: string;
        replayTitle: string;
        roomTitle: string;
        winnerLabel: string;
        reasonLabel: string;
        hashLabel: string;
        unknownWinner: string;
        noReason: string;
    };
}

const messages: Record<UiLocale, UiMessages> = {
    en: {
        boardScene: {
            hashLabel: 'hash',
            marketTitle: 'Market',
            marketSlotsLabel: 'slots',
            boardTitle: 'Board',
            boardCellsLabel: 'cells',
            playersTitle: 'Players',
            playerZonesLabel: 'zones',
            promptsTitle: 'Prompts',
            royalCourtTitle: 'Royal Court',
            selectionDraftTitle: 'Selection Draft',
            runSidecarTitle: 'Run Sidecar',
            turnHudTitle: 'Turn HUD',
            replayReadOnlyNote:
                'Replay timeline is read-only and follows the authoritative bundle.',
            additionalActionsTitle: 'Additional Actions',
            additionalActionsNote:
                'Unmapped legal actions remain available here so this shared board surface never strands the session while later parity phases keep collapsing onto it.',
            scenarioFixtureTitle: 'Scenario Fixture',
            scenarioLabel: 'Scenario',
            expectedHashLabel: 'Expected finalStateHash',
            replayHashUnavailableLabel: 'Replay hash unavailable',
        },
        replay: {
            eyebrow: 'Replay Inspector',
            titlePrefix: 'Replay',
            note: 'Replay pages now reuse the shared BoardScene and stay read-only while stepping through the authoritative bundle timeline.',
            localeLabel: 'Language',
            localeEnglish: 'English',
            localeChinese: 'Chinese',
            timelineTitle: 'Replay Timeline',
            timelineLabel: 'Replay timeline',
            previousStep: 'Previous step',
            nextStep: 'Next step',
            stepPrefix: 'Replay Step',
            currentStepHash: 'Current Step Hash',
            storedHash: 'Stored Hash',
            recomputedHash: 'Recomputed Hash',
            hashCheck: 'Hash Check',
            eventCheck: 'Event Check',
            hashMatch: 'match',
            hashMismatch: 'mismatch',
            noSteps: 'No replay steps available.',
            keyboardHint: 'Keyboard: ArrowLeft / ArrowRight / Home / End',
            currentStepLabel: 'Current Step',
        },
        terminalOverlay: {
            eyebrow: 'Match Complete',
            localTitle: 'Local match finished',
            replayTitle: 'Replay final state',
            roomTitle: 'Authoritative match finished',
            winnerLabel: 'Winner',
            reasonLabel: 'Reason',
            hashLabel: 'Current finalStateHash',
            unknownWinner: 'unknown',
            noReason: 'none',
        },
    },
    zh: {
        boardScene: {
            hashLabel: '哈希',
            marketTitle: '市场',
            marketSlotsLabel: '槽位',
            boardTitle: '棋盘',
            boardCellsLabel: '格子',
            playersTitle: '玩家区',
            playerZonesLabel: '区域',
            promptsTitle: '提示栈',
            royalCourtTitle: '皇家廷臣',
            selectionDraftTitle: '草稿选择',
            runSidecarTitle: 'Run 侧栏',
            turnHudTitle: '回合 HUD',
            replayReadOnlyNote: '回放时间轴为只读视图，严格跟随权威 ReplayBundle。',
            additionalActionsTitle: '附加动作',
            additionalActionsNote:
                '尚未映射到主盘面的合法动作会暂时保留在这里，避免共享盘面在后续 parity 阶段之前把会话卡死。',
            scenarioFixtureTitle: '场景夹具',
            scenarioLabel: '场景',
            expectedHashLabel: '期望 finalStateHash',
            replayHashUnavailableLabel: '回放哈希暂不可用',
        },
        replay: {
            eyebrow: '回放检查器',
            titlePrefix: '回放',
            note: '回放页现在复用共享 BoardScene，并以只读方式沿着权威 bundle 时间轴前后查看。',
            localeLabel: '语言',
            localeEnglish: '英文',
            localeChinese: '中文',
            timelineTitle: '回放时间轴',
            timelineLabel: '回放时间轴',
            previousStep: '上一步',
            nextStep: '下一步',
            stepPrefix: '回放步骤',
            currentStepHash: '当前步骤哈希',
            storedHash: '存档哈希',
            recomputedHash: '重算哈希',
            hashCheck: '哈希校验',
            eventCheck: '事件校验',
            hashMatch: '一致',
            hashMismatch: '不一致',
            noSteps: '当前没有可用的回放步骤。',
            keyboardHint: '键盘：ArrowLeft / ArrowRight / Home / End',
            currentStepLabel: '当前步骤',
        },
        terminalOverlay: {
            eyebrow: '对局结束',
            localTitle: '本地对局已完成',
            replayTitle: '回放最终状态',
            roomTitle: '权威对局已完成',
            winnerLabel: '胜者',
            reasonLabel: '原因',
            hashLabel: '当前 finalStateHash',
            unknownWinner: '未知',
            noReason: '无',
        },
    },
};

export const resolveUiLocale = (locale?: string | null): UiLocale =>
    locale === 'zh' ? 'zh' : 'en';

export const getUiMessages = (locale: UiLocale): UiMessages => messages[locale];
