import { GM_getValue, GM_setValue } from '$'

export interface SiteConfig {
  match: string
  captchaSelector: string
  inputSelector: string
  submitSelector?: string
}

export function getSiteConfigs(): SiteConfig[] {
  return GM_getValue<SiteConfig[]>('siteConfigs', [])
}

export function saveSiteConfigs(configs: SiteConfig[]) {
  GM_setValue('siteConfigs', configs)
}

export function findSiteConfig(hostname: string): SiteConfig | null {
  return getSiteConfigs().find(config => config.match === hostname) || null
}
