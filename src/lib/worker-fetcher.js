export class WorkerFetcher {
  constructor(options) {
    const headers = new Headers()

    headers.append('Content-Type', 'application/json')

    Object.assign(
      this,
      {
        api: {},
        processIds: {},
        headers
      },
      options
    )
  }

  messageHandler(event) {
    const { api, headers, processIds, processFetch, self } = this
    const { data } = event
    const { id } = data

    if (data.accessToken) {
      headers.set('Authorization', data.accessToken)
    }

    if (data.api) {
      Object.assign(api, data.api)
    }

    if (id !== undefined && data.cancel === true) {
      delete processIds[id]
    }

    if (id !== undefined && data.fetchSpec && !processIds[id]) {
      self.postMessage({ id, isFetching: true })

      processIds[id] = true
      processFetch(data).then(
        () => {
          self.postMessage({ id, isFetching: false })
          delete processIds[id]
        },
        err => {
          self.postMessage({
            id,
            error: {
              message: err.message,
              name: err.name
            },
            isFetching: false
          })
          delete processIds[id]
        }
      )
    }
  }
}
