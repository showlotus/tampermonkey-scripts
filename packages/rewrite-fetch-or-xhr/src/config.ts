import type { Rule } from './types'

// 改写规则表：修改后执行 pnpm build 生成新的 dist 产物再重新安装
// match 同时作用于请求 URL 与响应 URL（fetch 重定向后按最终 URL 匹配）
// 响应改写说明：replace 基于响应体文本做替换；status/headers 仅对 fetch 生效，XHR 会忽略
export const rules: Rule[] = [
  // {
  //   name: '改写响应示例',
  //   enabled: true,
  //   match: /example\.com\/api\/user/,
  //   response: {
  //     replace: { from: '"vip":false', to: '"vip":true' },
  //   },
  // },
  // {
  //   name: '重定向请求示例',
  //   enabled: false,
  //   match: /example\.com\/api\/old/,
  //   request: {
  //     url: 'https://example.com/api/new',
  //     headers: { 'X-Custom': 'value' },
  //   },
  // },
]
