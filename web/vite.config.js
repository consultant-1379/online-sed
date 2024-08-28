import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  publicDir: 'res',
  test: {
    coverage: {
      reporter: ['text', 'lcov']
    }
  },
});
