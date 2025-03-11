import pino from 'pino'

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true, // Enables color output
      translateTime: 'HH:MM:ss Z', // Timestamp formatting
      ignore: 'pid,hostname', // Remove unnecessary fields
    },
  },
})
