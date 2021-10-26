import winston from 'winston'

const create = () => {
  const logFormat = winston.format.combine(winston.format.splat(), winston.format.simple())
  return winston.createLogger({ transports: [new winston.transports.Console()], format: logFormat })
}

export default { create }
