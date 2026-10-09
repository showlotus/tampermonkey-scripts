export interface SiteConfig {
  match: string
  captchaSelector: string
  inputSelector: string
  submitSelector?: string
}

export const SITE_CONFIGS: SiteConfig[] = [
  {
    match: 'itestuser.sendinfo.com.cn',
    captchaSelector: 'img.code-img',
    inputSelector: 'input[placeholder="请输入验证码"]'
  },
  {
    match: 'itestwap.sendinfo.com.cn',
    captchaSelector: 'div.tel-code.input-box > img',
    inputSelector: 'div.tel-code.input-box > input'
  },
  {
    match: 'localhost',
    captchaSelector: 'div.tel-code.input-box > img',
    inputSelector: 'div.tel-code.input-box > input'
  }
]

export function findSiteConfig(hostname: string): SiteConfig | null {
  return SITE_CONFIGS.find(config => config.match === hostname) || null
}
