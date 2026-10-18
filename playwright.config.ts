import { defineConfig } from '@playwright/test';
const liveURL = process.env.PLAYWRIGHT_BASE_URL;
export default defineConfig({
  testDir: './tests/browser',
  use: { baseURL: liveURL || 'http://127.0.0.1:4173/one-glass-of-water/' },
  webServer: liveURL ? undefined : {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/one-glass-of-water/',
    reuseExistingServer: false,
  },
});
