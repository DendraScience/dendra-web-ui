import moment from 'moment'
import {manipulateMoment} from '@dendra-science/utils-moment'

export default {
  seriesAsc (spec, model) {
    const opts = spec.options
    const topic = spec.topic
    const channel = model.$store.getters['channels/get'](topic)
    const dashboard = model.$store.getters['dashboards/current']
    const systemTime = model.$store.getters['systemTime/current']

    if (!channel.range) {
      /*
        Compute the range for the entire series to be fetched.
       */
      const range = {}
      let time = moment(systemTime.now)

      if (!(opts && opts.useWallTime === true)) {
        // Wall time is based on the user's local timezome
        // Default is local time, based on the dashboard's offset
        const offset = dashboard.utc_offset
        time = time.add(typeof offset === 'number' ? offset : 0, 's').utc()
      }

      range.start = time.clone()
      range.end = time.clone()

      if (opts) {
        if (opts.startDate) manipulateMoment(range.start, opts.startDate)
        if (opts.endDate) manipulateMoment(range.end, opts.endDate)
      }

      model.$store.commit('channels/setRange', {
        topic,
        range
      })
    }

    if (!channel.cursor) {
      /*
        Compute the cursor for incremental fetching.
       */
      const range = channel.range
      const cursor = {}

      cursor.start = range.start.clone()
      cursor.pos = range.start.clone()
      cursor.end = range.end.clone()

      if (opts) {
        if (opts.cursorDate) manipulateMoment(cursor.pos, opts.cursorDate)
      }

      model.$store.commit('channels/setCursor', {
        topic,
        cursor
      })
    }
  }
}
