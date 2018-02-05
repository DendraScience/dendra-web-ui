import logger from '@dendra-science/console-logger'
import {configure} from '@dendra-science/task-machine'

export default ({app, isDev}) => {
  logger.enabled = isDev

  app.$logger = logger

  configure({logger})
}
