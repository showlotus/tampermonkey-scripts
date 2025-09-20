// ==UserScript==
// @name         网页失焦时视频继续播放
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  The video continues to play when the web page is out of focus
// @author       showlotus
// @match        https://cme.yiigle.com/course*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cme.yiigle.com
// @homepage     https://github.com/showlotus/tampermonkey-scripts/blob/main/packages/play-video-when-blur
// @supportURL   https://github.com/showlotus/tampermonkey-scripts/issues
// @grant        none
// @license      MIT
// ==/UserScript==

;(function () {
  'use strict'
  // 阻止 blur 事件
  const windowAddEventListener = window.addEventListener
  window.addEventListener = function (eventName, eventHandler) {
    if (eventName !== 'blur') {
      windowAddEventListener.call(this, eventName, eventHandler)
    }
  }

  // 阻止 visibilitychange 事件绑定
  const documentAddEventListener = document.addEventListener
  document.addEventListener = function (type, listener, options) {
    if (type === 'visibilitychange') {
      console.log('屏蔽 visibilitychange 事件绑定')
      return
    }
    return documentAddEventListener.call(this, type, listener, options)
  }

  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get() {
      return 'visible' // 永远返回 "visible"
    }
  })

  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get() {
      return false // 永远返回 false
    }
  })

  document.hasFocus = function () {
    return true // 永远返回 true
  }
})()
