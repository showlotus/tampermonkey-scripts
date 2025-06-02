import { defineConfig } from 'vite'
import monkey, { cdn } from 'vite-plugin-monkey'

console.log(
  'html2canvas',
  cdn.jsdelivr('html2canvas', 'dist/html2canvas.min.js')[1]('1.4.1', 'html2canvas')
)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=bilibili.com',
        namespace: 'bilibili-video-note-export',
        match: ['https://www.bilibili.com/video/*'],
        license: 'MIT',
        description: '导出 B 站视频笔记',
        author: 'showlotus',
        'run-at': 'document-end'
      },
      build: {
        externalGlobals: {
          html2canvas: cdn.jsdelivr('html2canvas', 'html2canvas@1.4.1/dist/html2canvas.min.js')
        }
      }
    })
  ]
})
