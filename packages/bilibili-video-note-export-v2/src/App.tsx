import { useEffect, useState } from 'react'
import { $, Logger } from '@tampermonkey-scripts/utils'

function ExportTools() {
  const [exportStyle, setExportStyle] = useState('default')
  const [includeAuthorInfo, setIncludeAuthorInfo] = useState(false)

  const [copying, setCopying] = useState(false)
  const [exporting, setExporting] = useState(false)

  const logger = new Logger('bilibili-video-note-export-v2')
  logger.debug('123')

  useEffect(() => {
    if (copying) {
      $('div.note-pc')?.classList.add('is-copying')
    } else {
      $('div.note-pc')?.classList.remove('is-copying')
    }
  }, [copying])

  useEffect(() => {
    if (exporting) {
      $('div.note-pc')?.classList.add('is-exporting')
    } else {
      $('div.note-pc')?.classList.remove('is-exporting')
    }
  }, [exporting])

  return (
    <div className="h-[85px] py-3 px-5 flex flex-col justify-between gap-1 box-border bg-white border-t border-b border-solid border-l-0 border-r-0 border-[#e3e5e7] text-sm">
      <div className="flex gap-2">
        <span>样式：</span>
        <div className="flex gap-2 items-center">
          <input
            type="radio"
            id="bilibili-video-note-export__default-style"
            name="export-style"
            checked={exportStyle === 'default'}
            onChange={() => {
              setExportStyle('default')
            }}
          />
          <label htmlFor="bilibili-video-note-export__default-style">默认样式</label>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="radio"
            id="bilibili-video-note-export__simple-style"
            name="export-style"
            checked={exportStyle === 'simple'}
            onChange={() => {
              setExportStyle('simple')
            }}
          />
          <label htmlFor="bilibili-video-note-export__simple-style">简洁样式</label>
        </div>
        <div className="flex gap-2 items-center ml-[10px]">
          <input
            type="checkbox"
            id="bilibili-video-note-export__include-author-info"
            name="include-author-info"
            checked={includeAuthorInfo}
            onChange={() => {
              setIncludeAuthorInfo(!includeAuthorInfo)
            }}
          />
          <label htmlFor="bilibili-video-note-export__include-author-info">包含发布者</label>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span>操作：</span>
        <div
          id="bilibili-video-note-export__copy-image"
          className="py-1 px-3 border-[#00aeec] border-solid border rounded-md text-[#00aeec] cursor-pointer hover:bg-[#00b5f6] hover:border-transparent hover:text-white"
          onClick={() => {
            setCopying(true)
            logger.info('复制为图片')
            setTimeout(() => {
              setCopying(false)
            }, 1000)
          }}
        >
          {copying ? '复制中...' : '复制为图片'}
        </div>
        <div
          id="bilibili-video-note-export__export-image"
          className="py-1 px-3 border-[#00aeec] border-solid border rounded-md text-[#00aeec] cursor-pointer hover:bg-[#00b5f6] hover:border-transparent hover:text-white"
          onClick={() => {
            setExporting(true)
            logger.info('导出为图片')
            setTimeout(() => {
              setExporting(false)
            }, 1000)
          }}
        >
          {exporting ? '导出中...' : '导出为图片'}
        </div>
      </div>
    </div>
  )
}

function App() {
  useEffect(() => {
    // TODO
  }, [])

  return (
    <div className="fixed bottom-[70px] right-5 bg-black p-4">
      <ExportTools />
    </div>
  )
}

export default App
