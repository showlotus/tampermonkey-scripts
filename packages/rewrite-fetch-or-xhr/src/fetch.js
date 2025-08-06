/**
 * Fetch 重写拦截器
 * 提供对 fetch API 的拦截和修改功能
 */
class FetchInterceptor {
  constructor() {
    this.originalFetch = window.fetch;
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
    this.isIntercepting = false;
  }

  /**
   * 添加请求拦截器
   * @param {Function} interceptor - 拦截器函数，接收 url 和 options 参数，返回修改后的参数
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
   * 添加错误拦截器
   * @param {Function} interceptor - 拦截器函数，接收 error 参数
   */
  addErrorInterceptor(interceptor) {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * 开始拦截 fetch 请求
   */
  startIntercepting() {
    if (this.isIntercepting) {
      console.warn('⚠️ Fetch 拦截器已经在运行中');
      return;
    }

    const originalFetch = this.originalFetch;
    const self = this;

    // 重写 fetch 函数
    window.fetch = async function(input, init = {}) {
      try {
        // 处理请求参数
        let url = input;
        let options = { ...init };

        // 如果 input 是 Request 对象，提取 URL 和配置
        if (input instanceof Request) {
          url = input.url;
          options = {
            method: input.method,
            headers: input.headers,
            body: input.body,
            mode: input.mode,
            credentials: input.credentials,
            cache: input.cache,
            redirect: input.redirect,
            referrer: input.referrer,
            referrerPolicy: input.referrerPolicy,
            integrity: input.integrity,
            keepalive: input.keepalive,
            signal: input.signal,
            ...options
          };
        }

        // 标准化请求配置
        const requestConfig = {
          url: url.toString(),
          method: (options.method || 'GET').toUpperCase(),
          headers: self.normalizeHeaders(options.headers),
          body: options.body,
          mode: options.mode,
          credentials: options.credentials,
          cache: options.cache,
          redirect: options.redirect,
          referrer: options.referrer,
          referrerPolicy: options.referrerPolicy,
          integrity: options.integrity,
          keepalive: options.keepalive,
          signal: options.signal,
          timestamp: Date.now()
        };

        console.log('🚀 Fetch 请求拦截:', requestConfig);

        // 应用请求拦截器
        let modifiedUrl = requestConfig.url;
        let modifiedOptions = { ...options };

        for (const interceptor of self.requestInterceptors) {
          try {
            const result = await interceptor(modifiedUrl, modifiedOptions, requestConfig);
            if (result && typeof result === 'object') {
              if (result.url !== undefined) modifiedUrl = result.url;
              if (result.options !== undefined) modifiedOptions = result.options;
            }
          } catch (error) {
            console.error('❌ 请求拦截器执行失败:', error);
          }
        }

        // 执行原始 fetch 请求
        const startTime = performance.now();
        const response = await originalFetch.call(this, modifiedUrl, modifiedOptions);
        const endTime = performance.now();

        // 创建响应对象副本以便拦截器使用
        const responseClone = response.clone();
        
        // 构建响应信息
        const responseInfo = {
          url: response.url,
          status: response.status,
          statusText: response.statusText,
          headers: self.responseHeadersToObject(response.headers),
          ok: response.ok,
          redirected: response.redirected,
          type: response.type,
          bodyUsed: response.bodyUsed,
          requestConfig: requestConfig,
          responseTime: Math.round(endTime - startTime),
          timestamp: Date.now()
        };

        console.log('📦 Fetch 响应拦截:', responseInfo);

        // 应用响应拦截器
        for (const interceptor of self.responseInterceptors) {
          try {
            await interceptor(responseClone.clone(), responseInfo);
          } catch (error) {
            console.error('❌ 响应拦截器执行失败:', error);
          }
        }

        return response;

      } catch (error) {
        console.error('❌ Fetch 请求失败:', error);

        // 应用错误拦截器
        for (const interceptor of self.errorInterceptors) {
          try {
            await interceptor(error, { url, options: init });
          } catch (interceptorError) {
            console.error('❌ 错误拦截器执行失败:', interceptorError);
          }
        }

        throw error;
      }
    };

    // 保持原始 fetch 的属性
    Object.defineProperty(window.fetch, 'name', { value: 'fetch' });
    
    this.isIntercepting = true;
    console.log('✅ Fetch 拦截器已启动');
  }

  /**
   * 停止拦截 fetch 请求
   */
  stopIntercepting() {
    if (!this.isIntercepting) {
      console.warn('⚠️ Fetch 拦截器未在运行');
      return;
    }

    window.fetch = this.originalFetch;
    this.isIntercepting = false;
    console.log('🛑 Fetch 拦截器已停止');
  }

  /**
   * 标准化请求头
   * @param {Headers|Object|Array} headers - 请求头
   * @returns {Object} 标准化后的请求头对象
   */
  normalizeHeaders(headers) {
    const normalized = {};
    
    if (!headers) return normalized;

    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        normalized[key.toLowerCase()] = value;
      });
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => {
        normalized[key.toLowerCase()] = value;
      });
    } else if (typeof headers === 'object') {
      Object.entries(headers).forEach(([key, value]) => {
        normalized[key.toLowerCase()] = value;
      });
    }

    return normalized;
  }

  /**
   * 将响应头转换为对象
   * @param {Headers} headers - 响应头 Headers 对象
   * @returns {Object} 响应头对象
   */
  responseHeadersToObject(headers) {
    const headerObj = {};
    headers.forEach((value, key) => {
      headerObj[key.toLowerCase()] = value;
    });
    return headerObj;
  }

  /**
   * 重置拦截器
   */
  reset() {
    this.stopIntercepting();
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }

  /**
   * 获取拦截器状态
   * @returns {Object} 拦截器状态信息
   */
  getStatus() {
    return {
      isIntercepting: this.isIntercepting,
      requestInterceptors: this.requestInterceptors.length,
      responseInterceptors: this.responseInterceptors.length,
      errorInterceptors: this.errorInterceptors.length
    };
  }
}

// 创建全局实例
const fetchInterceptor = new FetchInterceptor();

// 添加请求拦截器示例
fetchInterceptor.addRequestInterceptor(async (url, options, config) => {
  console.log('🔧 请求拦截器执行:', config);
  
  // 添加自定义请求头
  const headers = new Headers(options.headers);
  headers.set('X-Custom-Header', 'intercepted-fetch');
  headers.set('X-Timestamp', Date.now().toString());
  headers.set('X-User-Agent', navigator.userAgent);
  
  // 修改 URL 示例 - 添加查询参数
  const urlObj = new URL(url);
  urlObj.searchParams.set('intercepted', 'true');
  
  // 可以修改请求方法
  if (config.method === 'GET' && url.includes('/api/secure/')) {
    console.log('🔐 将 GET 请求转换为 POST');
    options.method = 'POST';
    options.headers = headers;
    options.body = JSON.stringify({ originalUrl: url });
    headers.set('Content-Type', 'application/json');
  }
  
  return {
    url: urlObj.toString(),
    options: {
      ...options,
      headers: headers
    }
  };
});

// 添加响应拦截器示例
fetchInterceptor.addResponseInterceptor(async (response, responseInfo) => {
  console.log('📥 响应拦截器执行:', responseInfo);
  
  // 检查响应状态
  if (responseInfo.ok) {
    console.log(`✅ 请求成功: ${responseInfo.url} (${responseInfo.responseTime}ms)`);
  } else {
    console.warn(`⚠️ 请求失败: ${responseInfo.status} ${responseInfo.statusText} - ${responseInfo.url}`);
  }
  
  // 检查响应类型
  const contentType = responseInfo.headers['content-type'];
  if (contentType && contentType.includes('application/json')) {
    try {
      const data = await response.json();
      console.log('📄 JSON 响应数据:', data);
      
      // 可以在这里触发自定义事件
      window.dispatchEvent(new CustomEvent('fetchJsonResponse', {
        detail: { data, responseInfo }
      }));
    } catch (error) {
      console.error('❌ JSON 解析失败:', error);
    }
  }
  
  // 性能监控
  if (responseInfo.responseTime > 3000) {
    console.warn(`🐌 慢请求检测: ${responseInfo.url} 耗时 ${responseInfo.responseTime}ms`);
  }
});

// 添加错误拦截器示例
fetchInterceptor.addErrorInterceptor(async (error, requestInfo) => {
  console.error('💥 Fetch 错误拦截器执行:', error, requestInfo);
  
  // 网络错误处理
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    console.error('🌐 网络连接错误，可能是跨域或网络问题');
    
    // 可以在这里实现重试逻辑
    window.dispatchEvent(new CustomEvent('fetchNetworkError', {
      detail: { error, requestInfo }
    }));
  }
  
  // 超时错误处理
  if (error.name === 'AbortError') {
    console.error('⏰ 请求超时或被中止');
  }
});

// 启动拦截器
fetchInterceptor.startIntercepting();

// 测试函数
async function testFetchInterception() {
  console.log('🧪 开始测试 Fetch 拦截');
  
  try {
    // 测试 GET 请求
    const response1 = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    const data1 = await response1.json();
    console.log('📄 GET 响应:', data1);
    
    // 测试 POST 请求
    const response2 = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Post',
        body: 'This is a test post from fetch interceptor',
        userId: 1
      })
    });
    const data2 = await response2.json();
    console.log('📄 POST 响应:', data2);
    
  } catch (error) {
    console.error('❌ 测试请求失败:', error);
  }
}

// 高级使用示例：条件拦截
function setupConditionalFetchInterception() {
  const conditionalInterceptor = new FetchInterceptor();
  
  // 只拦截特定域名的请求
  conditionalInterceptor.addRequestInterceptor(async (url, options, config) => {
    if (url.includes('api.github.com')) {
      const headers = new Headers(options.headers);
      headers.set('Authorization', 'token your-github-token');
      console.log('🔐 添加 GitHub API 认证');
      
      return {
        url,
        options: { ...options, headers }
      };
    }
  });
  
  // API 缓存示例
  const cache = new Map();
  conditionalInterceptor.addRequestInterceptor(async (url, options, config) => {
    if (config.method === 'GET' && url.includes('/api/cache/')) {
      const cacheKey = `${config.method}:${url}`;
      if (cache.has(cacheKey)) {
        console.log('💾 返回缓存数据');
        const cachedData = cache.get(cacheKey);
        
        // 创建模拟响应
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(new Response(JSON.stringify(cachedData), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }));
          }, 50);
        });
      }
    }
  });
  
  // 缓存成功响应
  conditionalInterceptor.addResponseInterceptor(async (response, responseInfo) => {
    if (responseInfo.ok && responseInfo.requestConfig.method === 'GET' && 
        responseInfo.url.includes('/api/cache/')) {
      const cacheKey = `${responseInfo.requestConfig.method}:${responseInfo.url}`;
      try {
        const data = await response.json();
        cache.set(cacheKey, data);
        console.log('💾 数据已缓存');
      } catch (error) {
        console.error('❌ 缓存数据失败:', error);
      }
    }
  });
  
  return conditionalInterceptor;
}

// 请求重试工具
class FetchRetryInterceptor extends FetchInterceptor {
  constructor(maxRetries = 3, retryDelay = 1000) {
    super();
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.retryMap = new Map();
  }
  
  /**
   * 带重试的 fetch 请求
   * @param {string} url - 请求 URL
   * @param {Object} options - 请求选项
   * @param {number} retryCount - 当前重试次数
   */
  async fetchWithRetry(url, options = {}, retryCount = 0) {
    try {
      const response = await this.originalFetch(url, options);
      
      // 如果响应不成功且可以重试
      if (!response.ok && retryCount < this.maxRetries && 
          this.shouldRetry(response.status)) {
        console.warn(`🔄 请求失败，准备重试 (${retryCount + 1}/${this.maxRetries}): ${response.status}`);
        
        await this.delay(this.retryDelay * Math.pow(2, retryCount)); // 指数退避
        return this.fetchWithRetry(url, options, retryCount + 1);
      }
      
      return response;
    } catch (error) {
      if (retryCount < this.maxRetries && this.shouldRetryOnError(error)) {
        console.warn(`🔄 请求异常，准备重试 (${retryCount + 1}/${this.maxRetries}):`, error.message);
        
        await this.delay(this.retryDelay * Math.pow(2, retryCount));
        return this.fetchWithRetry(url, options, retryCount + 1);
      }
      
      throw error;
    }
  }
  
  /**
   * 判断是否应该重试（基于状态码）
   */
  shouldRetry(status) {
    return [408, 429, 500, 502, 503, 504].includes(status);
  }
  
  /**
   * 判断是否应该重试（基于错误类型）
   */
  shouldRetryOnError(error) {
    return error.name === 'TypeError' || error.name === 'NetworkError';
  }
  
  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出给全局使用
window.FetchInterceptor = FetchInterceptor;
window.fetchInterceptor = fetchInterceptor;
window.testFetchInterception = testFetchInterception;
window.setupConditionalFetchInterception = setupConditionalFetchInterception;
window.FetchRetryInterceptor = FetchRetryInterceptor;

console.log('🎉 Fetch 拦截器已加载完成！');
console.log('💡 使用方法:');
console.log('1. testFetchInterception() - 测试基础拦截功能');
console.log('2. fetchInterceptor.stopIntercepting() - 停止拦截');
console.log('3. fetchInterceptor.startIntercepting() - 重新开始拦截');
console.log('4. setupConditionalFetchInterception() - 创建条件拦截器');
console.log('5. new FetchRetryInterceptor() - 创建带重试功能的拦截器');
