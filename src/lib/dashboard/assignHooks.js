import moment from 'moment'
import {manipulateMoment} from '@dendra-science/utils-moment'

export default {
  result (spec, model, res) {
    const opts = spec.options
    const topic = spec.topic
    const channel = model.$store.getters['channels/get'](topic)
    const cursor = channel.cursor

    model.$store.commit('channels/setResult', {
      topic,
      result: res
    })

    /*
      Move the cursor for incremental fetching.
     */
    if (cursor) {
      const newCursor = {}

      if (opts && opts.cursorDate && Array.isArray(res) && res.length > 0) {
        newCursor.start = cursor.pos.clone()
        newCursor.pos = cursor.pos.clone()
        newCursor.end = cursor.end.clone()

        manipulateMoment(newCursor.pos, opts.cursorDate)

        // Clamp pos to the end time
        newCursor.pos = moment.min(newCursor.pos, newCursor.end)
      } else {
        newCursor.start = newCursor.pos = newCursor.end = cursor.end.clone()
      }

      model.$store.commit('channels/setCursor', {
        topic,
        cursor: newCursor
      })
    }
  }
}
