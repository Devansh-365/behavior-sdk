import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'iife'],
  globalName: 'BehaviorSDK',    // window.BehaviorSDK.collect() when embedded via <script> tag
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2020',
  minify: false,
})
