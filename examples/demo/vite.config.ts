import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@google-cloud/vertexai': path.resolve(__dirname, 'src/vertexai-empty.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['@google-cloud/vertexai'],
  },
  ssr: {
    external: ['@google-cloud/vertexai'],
  },
  build: {
    rollupOptions: {
      external: ['@google-cloud/vertexai'],
    },
  },
  define: {
    'process.env': {},
  },
});
