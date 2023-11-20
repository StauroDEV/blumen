import { SupportedMethods } from '../types.js'

export const logger = {
  start(...args: unknown[]) {
    console.log('📦', ...args)
  },
  info(...args: unknown[]) {
    console.info('🛈 ', ...args)
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
