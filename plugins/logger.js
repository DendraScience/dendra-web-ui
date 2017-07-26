import logger from '@dendra-science/console-logger'

export default ({app}) => {
  // TODO: Don't hardcode
  logger.enabled = true

  app.$logger = logger
}
