import type { Config } from 'tailwindcss'

const config: Config = {
  mode: 'jit',
  darkMode: ['class'],
  // 添加样式命名空间，避免样式冲突
  important: '#tampermonkey-scripts-template-js',
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
