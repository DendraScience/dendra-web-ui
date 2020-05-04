import math from '@/lib/math'
import moment from 'moment'

// Reasonable min and max dates to perform low-level querying
// NOTE: Didn't use min/max integer since db date conversion could choke
// NOTE: Revised to be within InfluxDB default dates
const MIN_TIME = Date.UTC(1800, 1, 2)
const MAX_TIME = Date.UTC(2200, 1, 2)

export const dateFormats = {
  m3dy: 'MMM D, Y',
  y2md: 'YY-MM-DD',
  y4md: 'YYYY-MM-DD'
}

export const dateTimeFormats = {
  m3dy_hm24: 'MMM D, Y HH:mm',
  y4md_hm24: 'YYYY-MM-DD HH:mm'
}

export const timeFormats = {
  hm12: 'h:mm a',
  hm24: 'HH:mm'
}

export function dateFormat(value, key = 'y4md') {
  return moment.utc(value).format(dateFormats[key])
}

export function dateFormatLocal(value, key = 'y4md') {
  return moment(value).format(dateFormats[key])
}

export function dateRangeFromItem(item) {
  return {
    from: item.beginsAt ? item.beginsAt.format(dateFormats.y4md) : null,
    fromEnabled: !!item.beginsAt,
    fromTime: item.beginsAt ? item.beginsAt.format(timeFormats.hm24) : null,
    timeZone: item.timeZone || 'UTC',
    to: item.endsBefore ? item.endsBefore.format(dateFormats.y4md) : null,
    toEnabled: !!item.endsBefore,
    toTime: item.endsBefore ? item.endsBefore.format(timeFormats.hm24) : null,
    utcOffset: item.utcOffset || 0
  }
}

export function dateTimeFormat(value, key = 'y4md_hm24') {
  return moment.utc(value).format(dateTimeFormats[key])
}

export function dateTimeFormatExtra(
  value,
  key = 'y4md_hm24',
  offset = 0,
  timeZone
) {
  const m = moment.utc(value)
  const t = m.valueOf()

  if (t === MIN_TIME) return 'First row'
  if (t === MAX_TIME) return 'No end'

  const s = m.add(offset, 's').format(dateTimeFormats[key])

  return timeZone ? `${s} ${timeZone}` : s
}

export function dateTimeFormatLocal(value, key = 'y4md_hm24') {
  return moment(value).format(dateTimeFormats[key])
}

export function defaultDateRange(item = {}) {
  const date = moment()
  const time = moment('0000', 'HHmm', true)

  return {
    from: date.format(dateFormats.y4md),
    fromEnabled: true,
    fromTime: time.format(timeFormats.hm24),
    timeZone: item.timeZone || 'UTC',
    to: date.add(1, 'd').format(dateFormats.y4md),
    toEnabled: true,
    toTime: time.format(timeFormats.hm24),
    utcOffset: item.utcOffset || 0
  }
}

export function newDateRange() {
  return {
    from: null,
    fromEnabled: true,
    fromTime: null,
    timeZone: 'UTC',
    to: null,
    toEnabled: true,
    toTime: null,
    utcOffset: 0
  }
}

export function resolveDateRange(dateRange) {
  const timeZone = dateRange.timeZone || 'UTC'
  const utcOffset = dateRange.utcOffset || 0
  const resolved = {
    from: null,
    timeZone,
    to: null,
    utcFrom: null,
    utcOffset,
    utcTo: null,
    valid: true
  }

  let from
  let to

  if (dateRange.fromEnabled) {
    from = moment.utc(
      `${dateRange.from} ${dateRange.fromTime}`,
      dateTimeFormats.y4md_hm24,
      true
    )

    if (from.isValid()) {
      resolved.from = from.toISOString()
      resolved.utcFrom = moment(from)
        .add(-utcOffset, 's')
        .toISOString()
    } else resolved.valid = false
  }

  if (dateRange.toEnabled) {
    to = moment.utc(
      `${dateRange.to} ${dateRange.toTime}`,
      dateTimeFormats.y4md_hm24,
      true
    )

    if (to.isValid()) {
      resolved.to = to.toISOString()
      resolved.utcTo = moment(to)
        .add(-utcOffset, 's')
        .toISOString()
    } else resolved.valid = false
  }

  if (from && to && !from.isBefore(to)) resolved.valid = false

  return resolved
}

export function resolvedToIntervalMoment(resolved) {
  const newInterval = {}

  if (resolved.from) {
    newInterval.begins_at = resolved.utcFrom
    newInterval.ends_before = moment(resolved.utcFrom).add(1, 'ms')
  }

  return newInterval
}

export function resolvedToIntervalRange(resolved) {
  const newInterval = {}

  if (resolved.from) newInterval.begins_at = resolved.utcFrom
  if (resolved.to) newInterval.ends_before = resolved.utcTo

  return newInterval
}

export function timeFormat(value, key = 'hm24') {
  return moment.utc(value).format(timeFormats[key])
}

export function timeFormatLocal(value, key = 'hm24') {
  return moment.format(timeFormats[key])
}

export function timeFromNow(value, ...args) {
  return moment(value).fromNow(...args)
}

export function updateDateRange(dateRange, value) {
  const from = value.from && moment.utc(value.from)
  const to = value.to && moment.utc(value.to)

  dateRange.fromEnabled = from && from.isValid()
  dateRange.from = dateRange.fromEnabled ? from.format(dateFormats.y4md) : null

  dateRange.toEnabled = to && to.isValid()
  dateRange.to = dateRange.toEnabled ? to.format(dateFormats.y4md) : null
}

export function utcOffsetHours(value) {
  return `${value < 0 ? '' : '+'}${math.round(
    math.unit(value | 0, 's').toNumber('h'),
    2
  )}`
}
