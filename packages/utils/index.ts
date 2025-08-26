export const $ = (selector: string) => {
  return document.querySelector(selector) as HTMLElement | null
}

export const $$ = (selector: string) => {
  return document.querySelectorAll(selector)
}

export class Logger {
  constructor(private readonly name: string) {
    this.name = name
  }

  debug(...args: any[]) {
    if (import.meta.env.PROD) return
    console.log(`%c[${this.name}]`, 'color: #666', ...args)
  }

  info(...args: any[]) {
    console.info(`%c[${this.name}]`, 'color: #2196F3', ...args)
  }

  warn(...args: any[]) {
    console.warn(`%c[${this.name}]`, 'color: #FF9800', ...args)
  }

  error(...args: any[]) {
    console.error(`%c[${this.name}]`, 'color: #F44336', ...args)
  }
}
