import { dateFormats, dateTimeFormats, timeFormats } from '@/lib/date'

export default (_, inject) => {
  inject('dateFormats', dateFormats)
  inject('dateTimeFormats', dateTimeFormats)
  inject('timeFormats', timeFormats)
}
