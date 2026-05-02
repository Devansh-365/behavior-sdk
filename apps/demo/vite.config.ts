/// <reference types="node" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Default: alias to TS source so Vite HMR fires on SDK source changes (fast DX).
// USE_SDK_PACKAGE=true: resolve via the workspace symlink → apps/sdk/dist/index.js,
// testing real consumer experience. Run `npm run demo:package` from root to use this.
const sdkSource = new URL('../sdk/src/index.ts', import.meta.url).pathname
const usePackage = process.env['USE_SDK_PACKAGE'] === 'true'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: usePackage ? {} : { 'behavior-sdk': sdkSource },
  },
  server: {
    open: true,
    port: 5173,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
  },
})
