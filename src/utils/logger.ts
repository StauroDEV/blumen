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
    console.log('✅', ...args)
  },
}
