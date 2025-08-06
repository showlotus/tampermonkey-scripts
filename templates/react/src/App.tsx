import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col gap-4 p-8 text-center rounded-2xl flex justify-center items-center fixed bottom-[70px] right-5 bg-black border-[#5384ed] border-solid">
      <div className="flex items-center gap-4">
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <span className="text-2xl font-bold">+</span>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <button
        className="counter rounded-lg border border-[#3e3e3e] px-5 py-2.5 text-base text-white font-medium font-inherit bg-[#1a1a1a] cursor-pointer transition-colors duration-250 hover:text-[#5384ed] hover:border-[#5384ed] border-solid"
        onClick={() => setCount(count => count + 1)}
      >
        count is {count}
      </button>
    </div>
  )
}

export default App
