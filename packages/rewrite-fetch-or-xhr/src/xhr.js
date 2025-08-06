/**
 * XHR 重写拦截器
 * 提供对 XMLHttpRequest 的拦截和修改功能
 */
class XHRInterceptor {
  constructor() {
    this.originalXHR = window.XMLHttpRequest;
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.isIntercepting = false;
  }

  /**
   * 添加请求拦截器
   * @param {Function} interceptor - 拦截器函数，接收 config 参数
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * 添加响应拦截器
   * @param {Function} interceptor - 拦截器函数，接收 response 参数
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * 开始拦截 XHR 请求
   */
  startIntercepting() {
    if (this.isIntercepting) {
      console.warn('⚠️ XHR 拦截器已经在运行中');
      return;
    }

    const originalXHR = this.originalXHR;
    const self = this;

    // 重写 XMLHttpRequest 构造函数
    window.XMLHttpRequest = function() {
      const xhr = new originalXHR();
      const originalOpen = xhr.open;
      const originalSend = xhr.send;
      const originalSetRequestHeader = xhr.setRequestHeader;
      
      let requestConfig = {
        method: '',
        url: '',
        headers: {},
        data: null,
        async: true,
        user: null,
        password: null
      };

      // 重写 open 方法
      xhr.open = function(method, url, async = true, user = null, password = null) {
        requestConfig = {
          method: method.toUpperCase(),
          url: url,
          headers: {},
          data: null,
          async,
          user,
          password
        };

        // 应用请求拦截器
        self.requestInterceptors.forEach(interceptor => {
          try {
            requestConfig = interceptor(requestConfig) || requestConfig;
          } catch (error) {
            console.error('❌ 请求拦截器执行失败:', error);
          }
        });

        console.log('🚀 XHR 请求拦截:', requestConfig);
        return originalOpen.call(this, requestConfig.method, requestConfig.url, requestConfig.async, requestConfig.user, requestConfig.password);
      };

      // 重写 setRequestHeader 方法
      xhr.setRequestHeader = function(name, value) {
        requestConfig.headers[name] = value;
        return originalSetRequestHeader.call(this, name, value);
      };

      // 重写 send 方法
      xhr.send = function(data) {
        requestConfig.data = data;

        // 添加响应处理
        const originalOnReadyStateChange = xhr.onreadystatechange;
        
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            const response = {
              status: xhr.status,
              statusText: xhr.statusText,
              responseText: xhr.responseText,
              responseXML: xhr.responseXML,
              responseURL: xhr.responseURL,
              headers: self.parseResponseHeaders(xhr.getAllResponseHeaders()),
              config: requestConfig
            };

            // 应用响应拦截器
            self.responseInterceptors.forEach(interceptor => {
              try {
                interceptor(response);
              } catch (error) {
                console.error('❌ 响应拦截器执行失败:', error);
              }
            });

            console.log('📦 XHR 响应拦截:', response);
          }

          // 调用原始的 onreadystatechange
          if (originalOnReadyStateChange) {
            originalOnReadyStateChange.call(this);
          }
        };

        return originalSend.call(this, requestConfig.data);
      };

      return xhr;
    };

    // 复制原始构造函数的属性
    Object.setPrototypeOf(window.XMLHttpRequest, originalXHR);
    Object.defineProperty(window.XMLHttpRequest, 'prototype', {
      value: originalXHR.prototype,
      writable: false
    });

    this.isIntercepting = true;
    console.log('✅ XHR 拦截器已启动');
  }

  /**
   * 停止拦截 XHR 请求
   */
  stopIntercepting() {
    if (!this.isIntercepting) {
      console.warn('⚠️ XHR 拦截器未在运行');
      return;
    }

    window.XMLHttpRequest = this.originalXHR;
    this.isIntercepting = false;
    console.log('🛑 XHR 拦截器已停止');
  }

  /**
   * 解析响应头字符串
   * @param {string} headerStr - 响应头字符串
   * @returns {Object} 解析后的响应头对象
   */
  parseResponseHeaders(headerStr) {
    const headers = {};
    if (!headerStr) return headers;

    headerStr.split('\r\n').forEach(line => {
      const parts = line.split(': ');
      if (parts.length === 2) {
        headers[parts[0].toLowerCase()] = parts[1];
      }
    });

    return headers;
  }

  /**
   * 重置拦截器
   */
  reset() {
    this.stopIntercepting();
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }
}

// 使用示例
const xhrInterceptor = new XHRInterceptor();

// 添加请求拦截器示例
xhrInterceptor.addRequestInterceptor((config) => {
  console.log('🔧 请求拦截器执行:', config);
  
  // 修改请求头
  config.headers['Custom-Header'] = 'intercepted-value';
  config.headers['X-Timestamp'] = Date.now().toString();
  
  // 可以修改 URL、方法等
  if (config.url.includes('/api/')) {
    config.url = config.url.replace('/api/', '/v2/api/');
  }
  
  return config;
});

// 添加响应拦截器示例
xhrInterceptor.addResponseInterceptor((response) => {
  console.log('📥 响应拦截器执行:', response);
  
  // 可以在这里处理响应数据
  if (response.status === 200) {
    console.log('✅ 请求成功:', response.config.url);
  } else {
    console.warn('⚠️ 请求失败:', response.status, response.config.url);
  }
});

// 启动拦截器
xhrInterceptor.startIntercepting();

// 测试函数
function testXHRInterception() {
  console.log('🧪 开始测试 XHR 拦截');
  
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://jsonplaceholder.typicode.com/posts/1');
  xhr.setRequestHeader('Content-Type', 'application/json');
  
  xhr.onload = function() {
    console.log('📄 响应内容:', this.responseText);
  };
  
  xhr.onerror = function() {
    console.error('❌ 请求失败');
  };
  
  xhr.send();
}

// 高级使用示例：条件拦截
function setupConditionalInterception() {
  const conditionalInterceptor = new XHRInterceptor();
  
  // 只拦截特定域名的请求
  conditionalInterceptor.addRequestInterceptor((config) => {
    if (config.url.includes('api.example.com')) {
      config.headers['Authorization'] = 'Bearer your-token-here';
      console.log('🔐 添加认证头到 API 请求');
    }
    return config;
  });
  
  // 拦截并修改响应
  conditionalInterceptor.addResponseInterceptor((response) => {
    if (response.config.url.includes('user-data')) {
      console.log('👤 用户数据请求完成:', response.status);
      
      // 可以在这里触发自定义事件
      window.dispatchEvent(new CustomEvent('userDataLoaded', {
        detail: { response }
      }));
    }
  });
  
  return conditionalInterceptor;
}

// 导出给全局使用
window.XHRInterceptor = XHRInterceptor;
window.xhrInterceptor = xhrInterceptor;
window.testXHRInterception = testXHRInterception;
window.setupConditionalInterception = setupConditionalInterception;

console.log('🎉 XHR 拦截器已加载完成！');
console.log('💡 使用方法:');
console.log('1. testXHRInterception() - 测试基础拦截功能');
console.log('2. xhrInterceptor.stopIntercepting() - 停止拦截');
console.log('3. xhrInterceptor.startIntercepting() - 重新开始拦截');
console.log('4. setupConditionalInterception() - 创建条件拦截器');
