import feathersClient from '../feathersClient'
import queryBuilders from './queryBuilders'

export default {
  result (spec, model) {
    let result = []
    let step = Promise.resolve()

    /*
      Set up a promise chain to find and concatenate multiple results.
     */
    spec.find_actions.forEach(action => {
      const service = feathersClient.service(action.path)
      if (!service) return

      const builder = queryBuilders[spec.query_builder]
      if (!builder) return

      step = step.then(() => {
        return service.find({
          query: builder(spec, model, action.query)
        })
      }).then(res => {
        // TODO: Deal with options: placeholder, sortByAttributes
        if (Array.isArray(res) && res.length > 0) {
          result = result.concat(res)
        }
      })
    })

    return step.then(() => {
      return result
    })
  }
}
