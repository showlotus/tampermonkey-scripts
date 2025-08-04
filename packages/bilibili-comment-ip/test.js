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
  // 拦截 fetch 和 XMLHttpRequest 请求
  console.log('🚀 开始设置请求拦截器...')

  const PROXY_URL_LIST = [
    'api.bilibili.com/x/v2/reply/wbi/main',
    'api.bilibili.com/x/v2/reply/reply',
    'api.bilibili.com/x/v2/reply/wbi/replies'
  ]

  const isTargetUrl = url => {
    return PROXY_URL_LIST.some(proxyUrl => url.includes(proxyUrl))
  }

  // 保存原始的 fetch 函数
  const originalFetch = window.fetch

  // 重写 fetch 函数
  window.fetch = async function (input, init) {
    // 安全地获取 URL
    let url
    try {
      if (typeof input === 'string') {
        url = input
      } else if (input instanceof Request) {
        url = input.url
      } else if (input && input.url) {
        url = input.url
      } else {
        // 如果无法获取 URL，直接使用原始 fetch
        return originalFetch(input, init)
      }
    } catch (error) {
      console.warn('⚠️ [Fetch] 无法解析请求 URL:', error)
      return originalFetch(input, init)
    }

    // 检查是否是目标 API
    if (isTargetUrl(url)) {
      console.log('🚀 [Fetch] 拦截到 Bilibili 评论请求:', url)

      try {
        // 获取请求参数
        const urlObj = new URL(url, window.location.origin)
        const params = Object.fromEntries(urlObj.searchParams.entries())
        console.log('📋 [Fetch] 请求参数:', params)

        // 发起原始请求
        const response = await originalFetch(input, init)

        // 克隆响应以便读取
        const responseClone = response.clone()
        const responseData = await responseClone.json()

        console.log('✅ [Fetch] 原始请求成功，返回真实数据')
        console.log('📊 [Fetch] 原始响应数据:', responseData)

        // 修改响应数据
        responseData?.data?.replies?.forEach(reply => {
          reply.member.uname += ` <${reply.reply_control.location}>`

          reply.replies?.forEach(rp => {
            rp.member.uname += ` <${rp.reply_control.location}>`
          })
        })

        console.log('🔧 [Fetch] 修改后的响应数据:', responseData)

        // 返回修改后的响应
        return new Response(JSON.stringify(responseData), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        })
      } catch (error) {
        console.error('❌ [Fetch] 原始请求失败:', error)
        throw error
      }
    }

    // 对于其他请求，使用原始的 fetch
    return originalFetch(input, init)
  }

  // 保存原始的 XMLHttpRequest
  const OriginalXHR = window.XMLHttpRequest

  // 重写 XMLHttpRequest
  window.XMLHttpRequest1 = function () {
    const xhr = new OriginalXHR()

    // 保存原始的 open 方法
    const originalOpen = xhr.open
    const originalSend = xhr.send

    // 重写 open 方法
    xhr.open = function (method, url, ...args) {
      // 检查是否是目标 API
      if (isTargetUrl(url)) {
        console.log('🚀 [XHR] 拦截到 Bilibili 评论请求:', url)

        try {
          // 获取请求参数
          const urlObj = new URL(url, window.location.origin)
          const params = Object.fromEntries(urlObj.searchParams.entries())
          console.log('📋 [XHR] 请求参数:', params)
        } catch (error) {
          console.warn('⚠️ [XHR] 无法解析请求参数:', error)
        }
      }

      // 调用原始的 open 方法
      return originalOpen.call(this, method, url, ...args)
    }

    // 重写 send 方法
    xhr.send = function (data) {
      // 添加响应监听器
      xhr.addEventListener('load', function () {
        if (xhr.responseURL && xhr.responseURL.includes('api.bilibili.com/x/v2/reply/reply')) {
          try {
            const responseData = JSON.parse(xhr.responseText)
            console.log('✅ [XHR] 原始请求成功，返回真实数据')
            console.log('📊 [XHR] 原始响应数据:', responseData)

            // 修改响应数据
            if (responseData.data && responseData.data.replies) {
              responseData.data.replies.forEach(reply => {
                reply.member.uname += ` <${reply.reply_control.location}>`

                if (reply.replies) {
                  reply.replies.forEach(reply => {
                    reply.member.uname += ` <${reply.reply_control.location}>`
                  })
                }
              })
            }

            console.log('🔧 [XHR] 修改后的响应数据:', responseData)

            // 重写响应文本
            Object.defineProperty(xhr, 'responseText', {
              value: JSON.stringify(responseData),
              writable: false
            })
          } catch (error) {
            console.error('❌ [XHR] 解析响应数据失败:', error)
          }
        }
      })

      // 调用原始的 send 方法
      return originalSend.call(this, data)
    }

    return xhr
  }

  console.log('✅ 拦截器设置完成')

  // Your code here...
})()
