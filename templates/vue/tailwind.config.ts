import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  // important: '#tampermonkey-scripts-template',
  content: ['./src/**/*.{vue,js,ts,jsx,tsx,css}'],
  theme: {
    container: {},
    extend: {}
  },
  // corePlugins: {
  //   preflight: false
  // },
  plugins: []
}

export default config
