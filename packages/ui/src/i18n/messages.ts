export type UiLocale = 'en' | 'zh';

export interface UiMessages {
    playerEntry: {
        homeEyebrow: string;
        homeTitle: string;
        homeSubtitle: string;
        homeFooterHint: string;
        classicTitle: string;
        classicSummary: string;
        roguelikeTitle: string;
        roguelikeSummary: string;
        roguelikeBadge: string;
        onlineTitle: string;
        onlineSummary: string;
        onlineKicker: string;
        backHomeLabel: string;
        classicHubTitle: string;
        classicHubSubtitle: string;
        roguelikeHubTitle: string;
        roguelikeHubSubtitle: string;
        localTitle: string;
        localSummary: string;
        aiTitle: string;
        aiSummary: string;
        runLocalTitle: string;
        runLocalSummary: string;
        runAiTitle: string;
        runAiSummary: string;
    };
    onlineArena: {
        eyebrow: string;
        title: string;
        subtitle: string;
        backHomeLabel: string;
        backArenaLabel: string;
        hostTitle: string;
        hostSummary: string;
        hostIdLabel: string;
        hostCreateLabel: string;
        hostCreatingLabel: string;
        hostOpenLabel: string;
        hostIdleHint: string;
        hostReadyHint: string;
        joinTitle: string;
        joinSummary: string;
        joinInputLabel: string;
        joinPlaceholder: string;
        joinOpenLabel: string;
        joinDisabledHint: string;
        footerPrefix: string;
        footerIdle: string;
        footerReady: string;
    };
    runDraft: {
        eyebrow: string;
        starterTitle: string;
        rewardTitle: string;
        draftPhaseLabel: string;
        rewardPhaseLabel: string;
        recordLabel: string;
        matchLabel: string;
        winsLabel: string;
        lossesLabel: string;
        modeLabel: string;
        modeLocal: string;
        modeAi: string;
        selectHint: string;
        starterNote: string;
        rewardNote: string;
    };
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
        boardStatsTitle: string;
        playersTitle: string;
        playerZonesLabel: string;
        promptsTitle: string;
        royalCourtTitle: string;
        selectionDraftTitle: string;
        runSidecarTitle: string;
        turnHudTitle: string;
        controlsTitle: string;
        notesTitle: string;
        errorTitle: string;
        refreshLabel: string;
        actionCounterLabel: string;
        actionCancelLabel: string;
        actionConfirmLabel: string;
        replayReadOnlyNote: string;
        additionalActionsTitle: string;
        additionalActionsNote: string;
        scenarioFixtureTitle: string;
        scenarioLabel: string;
        expectedHashLabel: string;
        replayHashUnavailableLabel: string;
        toolbar: {
            takeGems: string;
            reserve: string;
            buy: string;
            privilege: string;
            replenishBoard: string;
        };
    };
    sessionRail: {
        title: string;
        summaryTitle: string;
        statusLabel: string;
        viewerLabel: string;
        surfaceLabel: string;
        hashLabel: string;
        hashUnavailableLabel: string;
        themeTitle: string;
        themeDarkLabel: string;
        themeLightLabel: string;
        themeSystemLabel: string;
        styleTitle: string;
        styleStatusLabel: string;
        styleCurrentLabel: string;
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
        playerEntry: {
            homeEyebrow: 'Tactical Reimagined',
            homeTitle: 'Gem Duel',
            homeSubtitle:
                'Choose a player path and enter the shared tactical shell without leaving the rebuilt Web/Desktop architecture.',
            homeFooterHint: 'Select a mode to begin.',
            classicTitle: 'Classic',
            classicSummary: 'Standard rules. Pure strategy.',
            roguelikeTitle: 'Roguelike',
            roguelikeSummary: 'Random starter buffs and distinct playstyles.',
            roguelikeBadge: 'New',
            onlineTitle: 'Online Duel',
            onlineSummary: 'Remote multiplayer through the authoritative room shell.',
            onlineKicker: 'Remote Multiplayer',
            backHomeLabel: 'Return to Title',
            classicHubTitle: 'Select Opponent',
            classicHubSubtitle: 'Classic Mode',
            roguelikeHubTitle: 'Select Opponent',
            roguelikeHubSubtitle: 'Roguelike Mode',
            localTitle: 'Local PvP',
            localSummary: 'Play with a friend locally.',
            aiTitle: 'vs AI (Solo)',
            aiSummary: 'Challenge the Gem Bot.',
            runLocalTitle: 'Local Run',
            runLocalSummary: 'Draft buffs and play each roguelike match locally.',
            runAiTitle: 'AI Run',
            runAiSummary: 'Draft buffs and duel the bot through the same run shell.',
        },
        onlineArena: {
            eyebrow: 'Global Matchmaking',
            title: 'Online Arena',
            subtitle:
                'Host an authoritative room or open an existing room ID to continue inside the live shared board.',
            backHomeLabel: 'Return to Title',
            backArenaLabel: 'Return to Arena',
            hostTitle: 'Host Game',
            hostSummary: 'Create a room and wait for a challenger.',
            hostIdLabel: 'Your Match ID',
            hostCreateLabel: 'Create Room',
            hostCreatingLabel: 'Creating…',
            hostOpenLabel: 'Open Room',
            hostIdleHint: 'Create a room to generate an authoritative match ID.',
            hostReadyHint: 'Room created. Share the ID, then enter the room when ready.',
            joinTitle: 'Join Game',
            joinSummary: 'Enter an existing room ID to duel.',
            joinInputLabel: 'Opponent Match ID',
            joinPlaceholder: 'Paste room ID here',
            joinOpenLabel: 'Open Room',
            joinDisabledHint: 'Enter a room ID to continue.',
            footerPrefix: 'Status',
            footerIdle: 'Awaiting room selection',
            footerReady: 'Room ready',
        },
        runDraft: {
            eyebrow: 'Roguelike Draft',
            starterTitle: 'Choose a Starter Buff',
            rewardTitle: 'Choose the Next Reward',
            draftPhaseLabel: 'Starter Draft',
            rewardPhaseLabel: 'Reward Draft',
            recordLabel: 'Record',
            matchLabel: 'Match',
            winsLabel: 'Wins',
            lossesLabel: 'Losses',
            modeLabel: 'Mode',
            modeLocal: 'Local',
            modeAi: 'AI',
            selectHint: 'Select one option to continue.',
            starterNote: 'Pick one starter buff to begin the run.',
            rewardNote: 'Pick one reward buff to launch the next match.',
        },
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
            boardStatsTitle: 'Board Stock',
            playersTitle: 'Players',
            playerZonesLabel: 'zones',
            promptsTitle: 'Prompts',
            royalCourtTitle: 'Royal Court',
            selectionDraftTitle: 'Selection Draft',
            runSidecarTitle: 'Run Sidecar',
            turnHudTitle: 'Turn HUD',
            controlsTitle: 'Controls',
            notesTitle: 'Session Notes',
            errorTitle: 'Session Error',
            refreshLabel: 'Refresh',
            actionCounterLabel: 'Action',
            actionCancelLabel: 'Cancel selection',
            actionConfirmLabel: 'Confirm selection',
            replayReadOnlyNote:
                'Replay timeline is read-only and follows the authoritative bundle.',
            additionalActionsTitle: 'Additional Actions',
            additionalActionsNote:
                'Unmapped legal actions remain available here so this shared board surface never strands the session while later parity phases keep collapsing onto it.',
            scenarioFixtureTitle: 'Scenario Fixture',
            scenarioLabel: 'Scenario',
            expectedHashLabel: 'Expected finalStateHash',
            replayHashUnavailableLabel: 'Replay hash unavailable',
            toolbar: {
                takeGems: 'Take gems',
                reserve: 'Reserve',
                buy: 'Buy',
                privilege: 'Privilege',
                replenishBoard: 'Replenish board',
            },
        },
        sessionRail: {
            title: 'Session Rail',
            summaryTitle: 'Session Summary',
            statusLabel: 'Status',
            viewerLabel: 'Viewer',
            surfaceLabel: 'Surface',
            hashLabel: 'Hash',
            hashUnavailableLabel: 'Live hash unavailable',
            themeTitle: 'Theme',
            themeDarkLabel: 'Dark',
            themeLightLabel: 'Light',
            themeSystemLabel: 'System',
            styleTitle: 'Style',
            styleStatusLabel: 'Current',
            styleCurrentLabel: 'Default Tactical',
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
        playerEntry: {
            homeEyebrow: '战术重构版',
            homeTitle: 'Gem Duel',
            homeSubtitle: '选择玩家路径，进入共享的战术壳层；Web 与 Desktop 仍沿用同一套重构架构。',
            homeFooterHint: '选择一个模式开始。',
            classicTitle: '经典模式',
            classicSummary: '标准规则，纯策略对局。',
            roguelikeTitle: 'Roguelike',
            roguelikeSummary: '随机起始 Buff 与不同玩法风格。',
            roguelikeBadge: '新',
            onlineTitle: '在线对决',
            onlineSummary: '通过权威房间壳层进行远程多人对局。',
            onlineKicker: '远程多人',
            backHomeLabel: '返回标题页',
            classicHubTitle: '选择对手',
            classicHubSubtitle: '经典模式',
            roguelikeHubTitle: '选择对手',
            roguelikeHubSubtitle: 'Roguelike 模式',
            localTitle: '本地双人',
            localSummary: '与身边的玩家进行本地对局。',
            aiTitle: '对战 AI',
            aiSummary: '挑战 Gem Bot。',
            runLocalTitle: '本地 Run',
            runLocalSummary: '先选 Buff，再以本地方式推进 Roguelike Run。',
            runAiTitle: 'AI Run',
            runAiSummary: '先选 Buff，再通过同一套 Run 壳层挑战 AI。',
        },
        onlineArena: {
            eyebrow: '全局匹配',
            title: '在线竞技场',
            subtitle: '创建一个权威房间，或输入现有房间 ID，然后继续进入实时共享主盘面。',
            backHomeLabel: '返回标题页',
            backArenaLabel: '返回竞技场',
            hostTitle: '主持房间',
            hostSummary: '创建房间并等待挑战者加入。',
            hostIdLabel: '你的房间 ID',
            hostCreateLabel: '创建房间',
            hostCreatingLabel: '创建中…',
            hostOpenLabel: '进入房间',
            hostIdleHint: '先创建房间，生成一个权威房间 ID。',
            hostReadyHint: '房间已创建。分享 ID，并在准备好后进入房间。',
            joinTitle: '加入房间',
            joinSummary: '输入现有房间 ID 并继续对决。',
            joinInputLabel: '对手房间 ID',
            joinPlaceholder: '在这里粘贴房间 ID',
            joinOpenLabel: '打开房间',
            joinDisabledHint: '请输入房间 ID 后继续。',
            footerPrefix: '状态',
            footerIdle: '等待选择房间',
            footerReady: '房间已就绪',
        },
        runDraft: {
            eyebrow: 'Roguelike 草稿',
            starterTitle: '选择起始 Buff',
            rewardTitle: '选择下一项奖励',
            draftPhaseLabel: '起始草稿',
            rewardPhaseLabel: '奖励草稿',
            recordLabel: '战绩',
            matchLabel: '对局',
            winsLabel: '胜场',
            lossesLabel: '负场',
            modeLabel: '模式',
            modeLocal: '本地',
            modeAi: 'AI',
            selectHint: '选择一个选项后继续。',
            starterNote: '选择一个起始 Buff 来开启这局 Run。',
            rewardNote: '选择一个奖励 Buff，然后进入下一场对局。',
        },
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
            boardStatsTitle: '棋盘库存',
            playersTitle: '玩家区',
            playerZonesLabel: '区域',
            promptsTitle: '提示栈',
            royalCourtTitle: '皇家廷臣',
            selectionDraftTitle: '草稿选择',
            runSidecarTitle: 'Run 侧栏',
            turnHudTitle: '回合 HUD',
            controlsTitle: '控制面板',
            notesTitle: '会话说明',
            errorTitle: '会话错误',
            refreshLabel: '刷新',
            actionCounterLabel: '行动',
            actionCancelLabel: '取消选择',
            actionConfirmLabel: '确认选择',
            replayReadOnlyNote: '回放时间轴为只读视图，严格跟随权威 ReplayBundle。',
            additionalActionsTitle: '附加动作',
            additionalActionsNote:
                '尚未映射到主盘面的合法动作会暂时保留在这里，避免共享盘面在后续 parity 阶段之前把会话卡死。',
            scenarioFixtureTitle: '场景夹具',
            scenarioLabel: '场景',
            expectedHashLabel: '期望 finalStateHash',
            replayHashUnavailableLabel: '回放哈希暂不可用',
            toolbar: {
                takeGems: '拿取宝石',
                reserve: '预购',
                buy: '购买',
                privilege: '使用特权',
                replenishBoard: '补充棋盘',
            },
        },
        sessionRail: {
            title: '会话边栏',
            summaryTitle: '会话摘要',
            statusLabel: '状态',
            viewerLabel: '视角',
            surfaceLabel: '表面',
            hashLabel: '哈希',
            hashUnavailableLabel: '实时哈希暂不可用',
            themeTitle: '主题',
            themeDarkLabel: '深色',
            themeLightLabel: '浅色',
            themeSystemLabel: '跟随系统',
            styleTitle: '风格',
            styleStatusLabel: '当前',
            styleCurrentLabel: '默认战术壳',
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
