import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './apps/web/tests/visual',
    fullyParallel: false,
    outputDir: './tmp/playwright/test-results',
    reporter: 'line',
    use: {
        baseURL: process.env.GEM_DUEL_VISUAL_BASE_URL ?? 'http://127.0.0.1:3101',
        colorScheme: 'light',
        headless: true,
        viewport: {
            width: 1440,
            height: 2200,
        },
    },
});
