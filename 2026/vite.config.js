import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, '../common/src'),
      '@year': path.resolve(__dirname, './src'),
    },
  },
  // The app entry and shared components live in ../common (outside this year's
  // folder / Vite root), so allow the dev server to serve files from the repo
  // root. Without this, `npm run dev` 403s on the shared modules.
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
  base: './',
});
