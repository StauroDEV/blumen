import colors from 'picocolors'
import { isTTY } from '../constants.js'
import type { SupportedMethods } from '../types.js'

const { bgGreen, bgYellow, bgRed, cyan, green } = colors

const responseStatus = (status: number) => {
  if (status < 300) return bgGreen(status)
  else if (status < 400) return bgYellow(status)
  else return bgRed(status)
}

export const logger = {
  start(...args: unknown[]) {
    console.log('📦', ...args)
  },
  info(...args: unknown[]) {
    console.info('🟢', ...args)
  },
  error(...args: unknown[]) {
    console.error('🚨', ...args)
  },
  warn(...args: unknown[]) {
    console.warn('⚠️', ...args)
  },
  success(...args: unknown[]) {
    console.log('✔', ...args)
  },
  request(method: 'GET' | 'POST' | 'PUT', url: string, status: number) {
    if (isTTY)
      console.log(
        '\n',
        method === 'GET' ? cyan(method) : green(method),
        url,
        responseStatus(status),
      )
    else console.log('\n', method, url, status)
  },
  text(...args: unknown[]) {
    console.log(...args)
  },
}

export const deployMessage = (provider: string, supports: SupportedMethods) => {
  switch (supports) {
    case 'pin':
      return `📌 to ${provider}`
    case 'upload':
      return `💾 to ${provider}`
    case 'both':
      return `💾 and 📌 to ${provider}`
  }
}
