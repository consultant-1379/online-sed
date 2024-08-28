import { defineConfig } from 'vitest/config';
import Vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    Vue(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 5000,
    coverage: {
      reporter: ['text', 'lcov']
    }
  },
});