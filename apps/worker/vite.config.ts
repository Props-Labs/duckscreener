import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { builtinModules } from 'module';

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
      external: [
        'throng', 
        'dotenv',
        'path',
        'fs',
        'ws',
        'graphql-ws',
        'graphql-request',
        'graphql',
        'ioredis',
        'fuels',
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`)
      ]
    },
    target: 'node18',
    commonjsOptions: {
      esmExternals: ['graphql-request', 'graphql-ws'],
      requireReturnsDefault: 'auto'
    }
  },
  resolve: {
    mainFields: ['module', 'main'],
    dedupe: ['mira-dex-ts']
  },
  optimizeDeps: {
    include: ['mira-dex-ts'],
    esbuildOptions: {
      target: 'node18',
      format: 'cjs'
    }
  }
}); 