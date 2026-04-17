import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const restrictedLegacyImports = [
    'old',
    'old/*',
    'old/**',
    '../old/*',
    '../old/**',
    '../../old/*',
    '../../old/**',
    '../../../old/*',
    '../../../old/**',
];

const restrictedRandomImports = [
    'lodash.shuffle',
    'lodash.sample',
    'lodash.sampleSize',
    'array-shuffle',
    'fast-shuffle',
    'crypto',
    'crypto/*',
    'node:crypto',
];

const restrictedHostImports = [
    'electron',
    'electron/*',
    'fs',
    'fs/*',
    'node:fs',
    'node:fs/*',
    'net',
    'net/*',
    'node:net',
    'node:net/*',
    'http',
    'http/*',
    'node:http',
    'node:http/*',
];

const layerElements = [
    { type: 'domain', pattern: 'packages/domain/**' },
    { type: 'contracts', pattern: 'packages/contracts/**' },
    { type: 'core-engine', pattern: 'packages/core-engine/**' },
    { type: 'adapters', pattern: 'packages/adapters/**' },
    { type: 'application', pattern: 'packages/application/**' },
    { type: 'ui', pattern: 'packages/ui/**' },
    { type: 'web', pattern: 'apps/web/**' },
    { type: 'desktop', pattern: 'apps/desktop/**' },
    { type: 'room-service', pattern: 'apps/room-service/**' },
    { type: 'legacy', pattern: 'old/**' },
];

export default tseslint.config(
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.next/**',
            '**/.turbo/**',
            '**/coverage/**',
            'old/**',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    reactHooks.configs['recommended-latest'],
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        files: ['**/*.{ts,tsx,mts,cts}'],
        plugins: {
            boundaries,
        },
        settings: {
            'boundaries/elements': layerElements,
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            'no-restricted-imports': [
                'error',
                {
                    patterns: restrictedLegacyImports,
                },
            ],
            'boundaries/dependencies': [
                'error',
                {
                    default: 'allow',
                    rules: [
                        {
                            from: { type: 'domain' },
                            disallow: {
                                to: {
                                    type: [
                                        'contracts',
                                        'core-engine',
                                        'adapters',
                                        'application',
                                        'ui',
                                        'web',
                                        'desktop',
                                        'room-service',
                                        'legacy',
                                    ],
                                },
                            },
                        },
                        {
                            from: { type: 'contracts' },
                            disallow: {
                                to: {
                                    type: [
                                        'core-engine',
                                        'adapters',
                                        'application',
                                        'ui',
                                        'web',
                                        'desktop',
                                        'room-service',
                                        'legacy',
                                    ],
                                },
                            },
                        },
                        {
                            from: { type: 'core-engine' },
                            disallow: {
                                to: {
                                    type: [
                                        'adapters',
                                        'application',
                                        'ui',
                                        'web',
                                        'desktop',
                                        'room-service',
                                        'legacy',
                                    ],
                                },
                            },
                        },
                        {
                            from: { type: 'adapters' },
                            disallow: {
                                to: {
                                    type: [
                                        'application',
                                        'ui',
                                        'web',
                                        'desktop',
                                        'room-service',
                                        'legacy',
                                    ],
                                },
                            },
                        },
                        {
                            from: { type: 'application' },
                            disallow: {
                                to: {
                                    type: ['ui', 'web', 'desktop', 'room-service', 'legacy'],
                                },
                            },
                        },
                        {
                            from: { type: 'ui' },
                            disallow: {
                                to: {
                                    type: [
                                        'domain',
                                        'core-engine',
                                        'adapters',
                                        'application',
                                        'web',
                                        'desktop',
                                        'room-service',
                                        'legacy',
                                    ],
                                },
                            },
                        },
                        {
                            from: { type: 'web' },
                            disallow: {
                                to: {
                                    type: [
                                        'domain',
                                        'core-engine',
                                        'adapters',
                                        'desktop',
                                        'room-service',
                                        'legacy',
                                    ],
                                },
                            },
                        },
                        {
                            from: { type: 'desktop' },
                            disallow: {
                                to: {
                                    type: [
                                        'domain',
                                        'core-engine',
                                        'adapters',
                                        'web',
                                        'room-service',
                                        'legacy',
                                    ],
                                },
                            },
                        },
                        {
                            from: { type: 'room-service' },
                            disallow: {
                                to: {
                                    type: [
                                        'domain',
                                        'core-engine',
                                        'ui',
                                        'web',
                                        'desktop',
                                        'legacy',
                                    ],
                                },
                            },
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['apps/web/**/*.{ts,tsx,mts,cts}', 'apps/desktop/**/*.{ts,tsx,mts,cts}'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: ['@gem-duel/adapters', '@gem-duel/core-engine', '@gem-duel/domain'],
                },
            ],
        },
    },
    {
        files: ['packages/ui/**/*.{ts,tsx,mts,cts}'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        '@gem-duel/domain',
                        '@gem-duel/core-engine',
                        '@gem-duel/adapters',
                        '@gem-duel/application',
                    ],
                },
            ],
        },
    },
    {
        files: ['packages/domain/**/*.{ts,mts,cts}', 'packages/core-engine/**/*.{ts,mts,cts}'],
        rules: {
            'no-restricted-globals': [
                'error',
                { name: 'fetch', message: 'Pure core layers must not perform network IO.' },
                {
                    name: 'XMLHttpRequest',
                    message: 'Pure core layers must not perform network IO.',
                },
                { name: 'WebSocket', message: 'Pure core layers must not perform network IO.' },
                { name: 'window', message: 'Pure core layers must not touch browser globals.' },
                { name: 'document', message: 'Pure core layers must not touch browser globals.' },
                {
                    name: 'localStorage',
                    message: 'Pure core layers must not touch browser globals.',
                },
            ],
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        ...restrictedRandomImports,
                        ...restrictedHostImports,
                        ...restrictedLegacyImports,
                    ],
                },
            ],
            'no-restricted-properties': [
                'error',
                {
                    object: 'Math',
                    property: 'random',
                    message: 'Use explicit namespaced RNG streams instead of Math.random().',
                },
                {
                    object: 'Date',
                    property: 'now',
                    message: 'Use ClockPort instead of Date.now().',
                },
                {
                    object: 'performance',
                    property: 'now',
                    message: 'Use explicit timing inputs instead of performance.now().',
                },
            ],
            'no-restricted-syntax': [
                'error',
                {
                    selector: "NewExpression[callee.name='Date']",
                    message: 'Use ClockPort instead of constructing Date in pure core layers.',
                },
            ],
        },
    }
);
