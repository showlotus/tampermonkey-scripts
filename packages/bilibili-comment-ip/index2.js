// ==UserScript==
// @name         显示 B 站视频评论 IP 归属地
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  The video comment ip of bilibili is displayed
// @author       showlotus
// @match        https://www.bilibili.com/video/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @homepage     https://github.com/showlotus/tampermonkey-scripts/blob/main/packages/bilibili-comment-ip
// @supportURL   https://github.com/showlotus/tampermonkey-scripts/issues
// @grant        none
// @run-at       document-end
// @license      MIT
// ==/UserScript==

;(function () {
  'use strict'

  const logger = {
    info: (...args) => {
      console.info('%c[bilibili-comment-ip]', 'color: #FB7299', ...args)
    }
  }

  const unwatchList = []

  /**
   * 获取页面中所有匹配选择器的元素，包括 Shadow DOM 内的元素
   * @param {string} selector - CSS 选择器
   * @param {HTMLElement|DocumentFragment} [root=document] - 搜索的根节点
   * @returns {Array<HTMLElement>} 匹配的元素数组
   */
  function querySelectorAllDeep(selector, root = document) {
    const result = []

    // 在普通 DOM 中查找
    const lightDomMatches = root.querySelectorAll(selector)
    lightDomMatches.forEach(el => result.push(el))

    // 查找所有 Shadow DOM 宿主
    const shadowHosts = root.querySelectorAll('*')

    shadowHosts.forEach(host => {
      if (host.shadowRoot) {
        // 递归搜索 Shadow DOM
        const shadowMatches = querySelectorAllDeep(selector, host.shadowRoot)
        shadowMatches.forEach(el => result.push(el))
      }
    })

    return result
  }

  function injectCommentIP() {
    logger.info('execution')

    unwatchList.forEach(unwatch => unwatch())
    unwatchList.length = 0

    querySelectorAllDeep('bili-comment-replies-renderer').forEach(n => {
      const unwatch = watchDomMutation(n.shadowRoot, injectCommentIP)
      unwatchList.push(unwatch)
    })

    querySelectorAllDeep('bili-comment-action-buttons-renderer').forEach(n => {
      const ip = n.__data.reply_control.location
      const pubdateEl = n.shadowRoot.querySelector('#pubdate')

      if (pubdateEl.hasAttribute('__has_ip')) return

      pubdateEl.innerHTML += `&nbsp;&nbsp;${ip}`
      pubdateEl.setAttribute('__has_ip', '')
    })
  }

  function watchDomMutation(target, callback, options = { immediate: true }) {
    options.immediate && callback()
    const ob = new MutationObserver(callback)
    ob.observe(target, {
      childList: true,
      subtree: true
    })

    return () => {
      ob.disconnect()
    }
  }

  setTimeout(() => {
    logger.info('start')
    watchDomMutation(document.querySelector('#commentapp'), injectCommentIP)
  }, 3000)
})()
