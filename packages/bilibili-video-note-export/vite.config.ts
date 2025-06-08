import { defineConfig } from 'vite'
import monkey, { cdn } from 'vite-plugin-monkey'
import { vitePluginMainHmr } from './plugins/vite-plugin-main-hmr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vitePluginMainHmr({
      entry: 'src/main.ts'
    }),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: '导出 B 站视频笔记',
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=bilibili.com',
        namespace: 'bilibili-video-note-export',
        match: ['https://www.bilibili.com/video/*'],
        license: 'MIT',
        description: 'export bilibili video note',
        author: 'showlotus',
        'run-at': 'document-end',
        homepage:
          'https://github.com/showlotus/tampermonkey-scripts/blob/main/packages/bilibili-video-note-export',
        supportURL: 'https://github.com/showlotus/tampermonkey-scripts/issues'
      },
      build: {
        externalGlobals: {
          'modern-screenshot': cdn.jsdelivr('modernScreenshot', 'dist/index.js')
        }
      }
    })
  ]
})
