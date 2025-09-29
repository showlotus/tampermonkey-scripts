declare module 'normalize-wheel' {
  interface WheelEventNormalized {
    spinX: number
    spinY: number
    pixelX: number
    pixelY: number
  }

  function normalizeWheel(event: WheelEvent): WheelEventNormalized

  export default normalizeWheel
}
