import services from '@dendra-science/client-services'

export default ({app}) => {
  // TODO: Don't hardcode
  services.init({
    io: {
      options: {
        path: '/api/v1/socket.io'
      },
      uri: 'http://128.32.109.75' // Preview environment
    }
  })

  app.$services = services
}
