// ==UserScript==
// @name         Beautify Docmost
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  优化 Docmost 界面样式
// @icon         https://docmost.com/favicon.ico
// @run-at       document-idle
// @match        https://*/*
// @match        http://*/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  const STYLES = [];

  STYLES.forEach(rule => GM_addStyle(rule));

  /**
   * 默认展开右侧目录面板
   */
  function autoExpandAsidePanel() {
    const TOGGLE_SELECTOR = '#main-content .mantine-Group-root button[aria-label="目录"]';
    const MAX_RETRIES = 20;
    const RETRY_INTERVAL = 300;
    let retries = 0;

    function tryClick() {
      const btn = document.querySelector(TOGGLE_SELECTOR);
      if (!btn) {
        if (++retries < MAX_RETRIES) setTimeout(tryClick, RETRY_INTERVAL);
        return;
      }
      if (btn.getAttribute('aria-expanded') !== 'true') {
        btn.click();
      }
    }

    tryClick();
  }

  autoExpandAsidePanel();
})();
