import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import dts from 'vite-plugin-dts'
import pkg from './package.json'
import fs from 'fs'

export default defineConfig({
  build: {
    minify: true,
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'VueAsyncVirtualScroll',
      formats: ['es'],
    },
    copyPublicDir: false,
    rollupOptions: {
      // 确保外部化处理 vue 依赖，不打包进库
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
      plugins: [],
    },
  },
  plugins: [
    vue(),
    // @ts-ignore
    dts({ tsconfigPath: './tsconfig.app.json', rollupTypes: true }),
    viteStaticCopy({
      targets: [
        {
          src: './README.md',
          dest: '',
        },
      ],
    }),
    {
      name: 'modify-pkg-and-copy',
      apply: 'build',
      closeBundle() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { devDependencies, dependencies, scripts, ...newPkg } = pkg
        // 写入到 dist 目录
        const distPath = path.resolve(__dirname, 'dist/package.json')
        fs.writeFileSync(
          distPath,
          JSON.stringify({ ...newPkg, types: 'index.d.ts' }, null, 2),
          'utf-8',
        )
      },
    },
  ],
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
