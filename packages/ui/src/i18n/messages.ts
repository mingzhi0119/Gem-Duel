export type UiLocale = 'en' | 'zh';

export interface UiMessages {
    drawer: {
        openLabel: string;
        closeLabel: string;
    };
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
    sessionRail: {
        title: string;
        summaryTitle: string;
        statusLabel: string;
        viewerLabel: string;
        surfaceLabel: string;
        hashLabel: string;
        themeTitle: string;
        themeDarkLabel: string;
        themeLightLabel: string;
        themeSystemLabel: string;
        styleTitle: string;
        styleCurrentLabel: string;
        styleLockedNote: string;
        rulesLabel: string;
        rulesNote: string;
        restartLabel: string;
        reloadLabel: string;
        restartNote: string;
        reloadNote: string;
        viewerPlayer: string;
        viewerSpectator: string;
        surfacePlay: string;
        surfaceRoom: string;
        surfaceReplay: string;
        statusWaitingOpponent: string;
        statusActive: string;
        statusCompleted: string;
        statusReplay: string;
        statusResyncing: string;
        statusDisconnected: string;
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
        drawer: {
            openLabel: 'View',
            closeLabel: 'Close',
        },
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
        sessionRail: {
            title: 'Session Rail',
            summaryTitle: 'Session Summary',
            statusLabel: 'Status',
            viewerLabel: 'Viewer',
            surfaceLabel: 'Surface',
            hashLabel: 'Hash',
            themeTitle: 'Theme',
            themeDarkLabel: 'Dark',
            themeLightLabel: 'Light',
            themeSystemLabel: 'System',
            styleTitle: 'Style',
            styleCurrentLabel: 'Default Tactical',
            styleLockedNote: 'Locked until additional validated style packs ship.',
            rulesLabel: 'Rules',
            rulesNote: 'Open the shared rulebook in a dedicated route.',
            restartLabel: 'Restart',
            reloadLabel: 'Reload View',
            restartNote: 'Reload this route to restart the in-memory session.',
            reloadNote: 'Reload this route to refresh the current observer surface.',
            viewerPlayer: 'player',
            viewerSpectator: 'spectator',
            surfacePlay: 'play',
            surfaceRoom: 'room',
            surfaceReplay: 'replay',
            statusWaitingOpponent: 'waiting-opponent',
            statusActive: 'active',
            statusCompleted: 'completed',
            statusReplay: 'replay',
            statusResyncing: 'resyncing',
            statusDisconnected: 'disconnected',
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
        drawer: {
            openLabel: '查看',
            closeLabel: '关闭',
        },
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
        sessionRail: {
            title: '会话边栏',
            summaryTitle: '会话摘要',
            statusLabel: '状态',
            viewerLabel: '视角',
            surfaceLabel: '表面',
            hashLabel: '哈希',
            themeTitle: '主题',
            themeDarkLabel: '深色',
            themeLightLabel: '浅色',
            themeSystemLabel: '跟随系统',
            styleTitle: '风格',
            styleCurrentLabel: '默认战术壳',
            styleLockedNote: '在更多通过验证的 style pack 落地前，当前风格保持锁定。',
            rulesLabel: '规则',
            rulesNote: '在独立路由中打开共享 rulebook。',
            restartLabel: '重开',
            reloadLabel: '重载视图',
            restartNote: '重新加载当前路由，以重置内存态 session。',
            reloadNote: '重新加载当前路由，以刷新当前观测视图。',
            viewerPlayer: '玩家',
            viewerSpectator: '观战',
            surfacePlay: '对局',
            surfaceRoom: '房间',
            surfaceReplay: '回放',
            statusWaitingOpponent: '等待对手',
            statusActive: '进行中',
            statusCompleted: '已完成',
            statusReplay: '回放',
            statusResyncing: '重同步中',
            statusDisconnected: '已断开',
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
