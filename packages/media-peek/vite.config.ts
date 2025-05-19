import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // TAG: Monkey 引入 vite-plugin-monkey 插件
    monkey({
      entry: 'src/main.tsx',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'media-peek',
        match: ['*://*/*'],
        noframes: true
      },
      build: {
        externalGlobals: {
          // react: cdn.jsdelivr('React', 'cjs/react.production.js'),
          // 'react-dom': cdn.jsdelivr('ReactDOM', 'cjs/react-dom.production.js')
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    port: 9977
  }
})
