import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=bilibili.com',
        namespace: 'bilibili-video-note-export',
        // match: ['https://www.bilibili.com/video/*'],
        match: ['https://www.google.com'],
        license: 'MIT',
        description: '导出视频笔记',
        author: 'showlotus'
      }
    })
  ]
})
