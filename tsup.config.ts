import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/validate.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  minify: false,
  external: ['../data/data.json'],
  sourcemap: true,
  shims: true,
})
