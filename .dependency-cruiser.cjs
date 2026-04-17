/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: 'no-import-from-old',
            severity: 'error',
            comment: 'Active packages and apps must never depend on old/legacy-vite-electron.',
            from: {
                path: '^(apps|packages|tools)/',
            },
            to: {
                path: '^old/',
            },
        },
        {
            name: 'domain-no-workspace-deps',
            severity: 'error',
            from: {
                path: '^packages/domain/',
            },
            to: {
                path: '^(apps|packages)/',
                pathNot: '^packages/domain/',
            },
        },
        {
            name: 'contracts-only-domain',
            severity: 'error',
            from: {
                path: '^packages/contracts/',
            },
            to: {
                path: '^(apps|packages)/',
                pathNot: '^packages/contracts/|^packages/domain/',
            },
        },
        {
            name: 'core-engine-only-contracts-domain',
            severity: 'error',
            from: {
                path: '^packages/core-engine/',
            },
            to: {
                path: '^(apps|packages)/',
                pathNot: '^packages/core-engine/|^packages/contracts/|^packages/domain/',
            },
        },
        {
            name: 'adapters-only-core-contracts-domain',
            severity: 'error',
            from: {
                path: '^packages/adapters/',
            },
            to: {
                path: '^(apps|packages)/',
                pathNot:
                    '^packages/adapters/|^packages/contracts/|^packages/domain/|^packages/core-engine/',
            },
        },
        {
            name: 'application-only-bootstrap-adapters',
            severity: 'error',
            from: {
                path: '^packages/application/',
            },
            to: {
                path: '^(apps|packages)/',
                pathNot:
                    '^packages/application/|^packages/contracts/|^packages/domain/|^packages/core-engine/|^packages/adapters/',
            },
        },
        {
            name: 'ui-only-contracts',
            severity: 'error',
            from: {
                path: '^packages/ui/',
            },
            to: {
                path: '^(apps|packages)/',
                pathNot: '^packages/ui/|^packages/contracts/',
            },
        },
        {
            name: 'web-shell-no-low-level-packages',
            severity: 'error',
            from: {
                path: '^apps/web/',
            },
            to: {
                path: '^packages/',
                pathNot: '^packages/application/|^packages/contracts/|^packages/ui/',
            },
        },
        {
            name: 'desktop-shell-no-low-level-packages',
            severity: 'error',
            from: {
                path: '^apps/desktop/',
            },
            to: {
                path: '^packages/',
                pathNot: '^packages/application/|^packages/contracts/|^packages/ui/',
            },
        },
        {
            name: 'room-service-no-direct-domain-engine',
            severity: 'error',
            from: {
                path: '^apps/room-service/',
            },
            to: {
                path: '^packages/',
                pathNot: '^packages/application/|^packages/contracts/|^packages/adapters/',
            },
        },
    ],
    options: {
        tsPreCompilationDeps: true,
        combinedDependencies: false,
        enhancedResolveOptions: {
            extensions: ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs', '.json'],
        },
        exclude: {
            path: [
                '(^|/)node_modules/',
                '(^|/)dist/',
                '(^|/)coverage/',
                '(^|/)\\.next/',
                '(^|/)\\.turbo/',
                '(^|/)generated/',
                '(^|/)old/',
            ],
        },
    },
};
