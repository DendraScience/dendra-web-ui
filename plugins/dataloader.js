global.regeneratorRuntime = require('regenerator-runtime')
const dataloader = require('@dendra-science/dataloader')

export default ({app}) => {
  dataloader.configure({
    logger: app.$logger
  })

  app.$dataloader = dataloader
}
