import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Alias the SDK package to its source so Vite HMR fires on SDK source changes.
// In production build (`vite build`), Vite still follows this alias and bundles
// the SDK source — eliminating the dev/prod resolution divergence risk.
const sdkSource = new URL('../sdk/src/index.ts', import.meta.url).pathname

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'behavior-sdk': sdkSource,
    },
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
