import { monkeyWindow } from '$'

import ReactSVG from '@/assets/react.svg'
import CountBtn from '@/components/count-btn'
import { Badge } from '@/components/ui/badge'

import { ThemeProvider } from './components/theme-provider'

function App() {
  console.log(window, 'App', monkeyWindow)
  console.log('parent', monkeyWindow.parent)
  // GM_addElement(document.body, 'div', { textContent: 'hello' })
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <main className="fixed right-0 top-0 flex flex-col items-center justify-center h-24 bg-red-500 z-[9999]">
        <div className="flex flex-col items-center gap-y-4">
          <div className="inline-flex items-center gap-x-4">
            <img src={ReactSVG} alt="React Logo" className="w-32" />
            <span className="text-6xl">+</span>
            <img src={'/vite.svg'} alt="Vite Logo" className="w-32" />
          </div>
          <a href="https://ui.shadcn.com" rel="noopener noreferrer nofollow" target="_blank">
            <Badge variant="outline">shadcn/ui</Badge>
          </a>
          <CountBtn />
        </div>
      </main>
    </ThemeProvider>
  )
}

export default App
