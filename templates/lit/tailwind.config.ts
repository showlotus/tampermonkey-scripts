import type { Config } from 'tailwindcss'

const config: Config = {
  mode: 'jit',
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {},
    extend: {}
  },
  // 禁用 Tailwind 的默认样式
  corePlugins: {
    preflight: false
  },
  plugins: []
}

export default config
