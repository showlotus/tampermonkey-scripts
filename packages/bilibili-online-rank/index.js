// ==UserScript==
// @name         显示 B 站视频在线人数排名
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  The video online rank of bilibili is displayed
// @author       showlotus
// @match        https://www.bilibili.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @homepage     https://github.com/showlotus/tampermonkey-scripts/blob/main/packages/bilibili-online-rank
// @supportURL   https://github.com/showlotus/tampermonkey-scripts/issues
// @grant        none
// @run-at       document-end
// @license      MIT
// ==/UserScript==

;(function () {
  'use strict'

  class Logger {
    constructor(name) {
      this.name = name
      this.info('🚀 start...')
    }

    info(...args) {
      console.info(`%c[${this.name}]`, 'color: #2196F3', ...args)
    }

    warn(...args) {
      console.warn(`%c[${this.name}]`, 'color: #FF9800', ...args)
    }

    error(...args) {
      console.error(`%c[${this.name}]`, 'color: #F44336', ...args)
    }
  }

  const logger = new Logger('bilibili-online-rank')

  const container = document.querySelector('div.bili-header__channel > div.channel-icons')
  if (container && !container.hasAttribute('__has_rank_icon')) {
    const a = document.createElement('a')
    a.href = 'https://online.梦.link/'
    a.target = '_blank'
    a.setAttribute('class', 'channel-icons__item')
    a.innerHTML = /* html */ `
    <div class="icon-bg" style="background-color: #2196F3;">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 48 48" class="icon-bg--icon"><g fill="none" stroke="#fff" stroke-linejoin="round" stroke-width="4"><path stroke-linecap="round" d="M17 18H4v24h13z"/><path d="M30 6H17v36h13z"/><path stroke-linecap="round" d="M43 26H30v16h13z"/></g></svg>
    </div>
    <span class="icon-title">在线榜</span>
  `
    container.appendChild(a)
    container.setAttribute('__has_rank_icon', 'true')
    logger.info('🎉 rank icon injected')
  }
})()
