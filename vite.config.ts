import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-router': ['react-router'],
          'vendor-firebase': [
            'firebase/app',
            'firebase/auth',
            'firebase/database',
            'firebase/analytics',
          ],
          'vendor-i18n': [
            'i18next',
            'react-i18next',
            'i18next-browser-languagedetector',
          ],
          'vendor-ui': ['lucide-react', 'vaul', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toggle', '@radix-ui/react-separator'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
