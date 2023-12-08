import { bgGreen, bgRed, bgYellow, cyan, green } from 'colorette'
import { SupportedMethods } from '../types.js'
import { isTTY } from '../constants.js'

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
    console.info('🟢 ', ...args)
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
  request(method: 'GET' | 'POST' | 'PUT', url: string, status: number, body?: unknown) {
    if (isTTY) console.log('\n', method === 'GET' ? cyan(method) : green(method), url, responseStatus(status), body)
    else console.log('\n', method, url, status, body)
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
