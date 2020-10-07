import logger from '@dendra-science/console-logger'

export default ({ isDev }, inject) => {
  logger.enabled = isDev

  inject('logger', logger)
}
