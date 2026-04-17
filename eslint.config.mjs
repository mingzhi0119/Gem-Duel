import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const restrictedLegacyImports = [
    'src',
    'src/*',
    'src/**',
    '../src/*',
    '../src/**',
    '../../src/*',
    '../../src/**',
    '../../../src/*',
    '../../../src/**',
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
        files: ['**/*.{ts,tsx,mts,cts}'],
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
        },
    }
);
