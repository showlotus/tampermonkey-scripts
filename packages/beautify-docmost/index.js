// ==UserScript==
// @name         Beautify Docmost
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  优化 Docmost 界面样式
// @icon         https://docmost.com/favicon.ico
// @run-at       document-idle
// @match        https://*/*
// @match        http://*/*
// ==/UserScript==

(function () {
  "use strict";

  /*
   * 默认展开右侧目录面板，并在切换文档时保持展开
   */
  function autoExpandAsidePanel() {
    const TOGGLE_SELECTOR = '#main-content .mantine-Group-root button[aria-label="目录"]';
    const MAX_RETRIES = 20;
    const RETRY_INTERVAL = 300;
    let retries = 0;
    let observedBtn = null;
    let attrObserver = null;

    /*
     * 若按钮处于折叠状态则点击展开
     */
    function expandIfNeeded(btn) {
      if (btn.getAttribute('aria-expanded') !== 'true') {
        btn.click();
      }
    }

    /*
     * 为按钮绑定 aria-expanded 属性监听，折叠时自动展开
     */
    function watchBtn(btn) {
      if (btn === observedBtn) return;
      if (attrObserver) attrObserver.disconnect();
      observedBtn = btn;
      expandIfNeeded(btn);
      attrObserver = new MutationObserver(function () {
        expandIfNeeded(btn);
      });
      attrObserver.observe(btn, { attributes: true, attributeFilter: ['aria-expanded'] });
    }

    /*
     * 在 DOM 中查找按钮，找到则绑定监听
     */
    function findAndWatch() {
      var btn = document.querySelector(TOGGLE_SELECTOR);
      if (btn) {
        watchBtn(btn);
        return true;
      }
      return false;
    }

    /*
     * 带重试的首次查找，未找到时按间隔重试
     */
    function tryFind() {
      if (findAndWatch()) return;
      if (++retries < MAX_RETRIES) setTimeout(tryFind, RETRY_INTERVAL);
    }

    tryFind();

    var container = document.querySelector('#main-content');
    if (container) {
      new MutationObserver(function () {
        if (!observedBtn || !document.contains(observedBtn)) {
          findAndWatch();
        }
      }).observe(container, { childList: true, subtree: true });
    }
  }

  autoExpandAsidePanel();
})();
