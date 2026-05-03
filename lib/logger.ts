type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDev = process.env.NEXT_PUBLIC_APP_ENV === 'development'

function log(level: LogLevel, message: string, data?: unknown) {
  if (!isDev && level === 'debug') return

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data !== undefined ? { data } : {}),
  }

  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify(entry))
  } else if (level === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(JSON.stringify(entry))
  } else if (isDev) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry))
  }
}

export const logger = {
  debug: (msg: string, data?: unknown) => log('debug', msg, data),
  info: (msg: string, data?: unknown) => log('info', msg, data),
  warn: (msg: string, data?: unknown) => log('warn', msg, data),
  error: (msg: string, data?: unknown) => log('error', msg, data),
}
