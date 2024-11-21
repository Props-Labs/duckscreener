import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/server.ts'),
      formats: ['cjs'],
      fileName: 'server'
    },
    rollupOptions: {
      external: ['throng', 'mira-dex-ts']
    }
  },
  optimizeDeps: {
    include: ['mira-dex-ts']
  },
  resolve: {
    alias: {
      'mira-dex-ts': resolve(__dirname, 'node_modules/mira-dex-ts/dist/index.js')
    }
  }
}); 