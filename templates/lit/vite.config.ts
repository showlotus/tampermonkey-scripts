import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'
import { hmrPlugin, presets } from 'vite-plugin-web-components-hmr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'tampermonkey-scripts-template-lit',
        match: ['https://www.google.com.hk']
      }
    }),
    hmrPlugin({
      include: ['./src/**/*.ts'],
      presets: [presets.lit]
    })
  ],
  build: {
    assetsInlineLimit: Infinity
  }
})
