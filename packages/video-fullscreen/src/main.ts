import './style.css'

interface Video extends HTMLVideoElement {
  __video_fullscreen_icon: HTMLElement
}

const callback: ResizeObserverCallback = entries => {
  console.log('video has changed', entries)
  entries.forEach(entry => {
    const target = entry.target as Video
    if (target.__video_fullscreen_icon) {
      document.body.removeChild(target.__video_fullscreen_icon)
    }

    console.log(entry.contentRect)
    const { left, width, top } = target.getBoundingClientRect()
    const position = { left: left + width, top }
    createIcon(target, position)
  })
}

function createIcon(
  target: HTMLVideoElement,
  position: { left: number; top: number }
) {
  const { left, top } = position
  const div = document.createElement('div')
  const size = 10
  div.className = 'video-fullscreen-icon'
  div.style.cssText = /* style */ `
    position: fixed;
    z-index: 999999;
    left: ${left - size * 2}px;
    top: ${top}px;
    width: 0;
    height: 0;
    border: ${size}px solid red;
    border-color: red red transparent transparent;
  `
  div.addEventListener('click', () => {
    // const cloneVideo = target.cloneNode(true) as HTMLElement
    // cloneVideo.style.cssText = /* style */ `
    //   position: fixed;
    //   right: 0;
    //   bottom: 0;
    // `
    // document.body.appendChild(cloneVideo)

    target.classList.toggle('video-fullscreen')
  })
  document.body.appendChild(div)
  ;(target as any).__video_fullscreen_icon = div
}

function observeVideo(video: HTMLVideoElement) {
  const observer = new ResizeObserver(callback)
  observer.observe(video)
}

document.querySelectorAll('video').forEach(video => {
  console.log(video)
  observeVideo(video)
})
