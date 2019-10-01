import moment from 'moment'

export const dateFormats = {
  y2md: 'YY-MM-DD',
  y4md: 'YYYY-MM-DD'
}

export const timeFormats = {
  hm12: 'h:mm a'
}

export function dateRangeFromItem(item) {
  return {
    from: item.beginsAt ? item.beginsAt.format(dateFormats.y4md) : null,
    fromEnabled: !!item.beginsAt,
    fromTime: item.beginsAt ? item.beginsAt.format(timeFormats.hm12) : null,
    to: item.endsBefore ? item.endsBefore.format(dateFormats.y4md) : null,
    toEnabled: !!item.endsBefore,
    toTime: item.endsBefore ? item.endsBefore.format(timeFormats.hm12) : null
  }
}

export function defaultDateRange() {
  const date = moment()
  const time = moment('0000', 'HHmm', true)

  return {
    from: date.format(dateFormats.y4md),
    fromEnabled: true,
    fromTime: time.format(timeFormats.hm12),
    to: date.add(1, 'd').format(dateFormats.y4md),
    toEnabled: true,
    toTime: time.format(timeFormats.hm12)
  }
}

export function newDateRange() {
  return {
    from: null,
    fromEnabled: true,
    fromTime: null,
    to: null,
    toEnabled: true,
    toTime: null
  }
}

export function resolveDateRange(dateRange) {
  const resolved = { from: null, to: null, valid: true }

  let from
  let to

  if (dateRange.fromEnabled) {
    const date = moment(dateRange.from, dateFormats.y4md, true)
    const time = moment(dateRange.fromTime, timeFormats.hm12, true)

    if (date.isValid() && time.isValid()) {
      from = moment(
        `${date.format('YYYYMMDD')} ${time.format('HHmm')}`,
        'YYYYMMDD HHmm',
        true
      )
      resolved.from = from.toISOString()
    } else {
      resolved.valid = false
    }
  }

  if (dateRange.toEnabled) {
    const date = moment(dateRange.to, dateFormats.y4md, true)
    const time = moment(dateRange.toTime, timeFormats.hm12, true)

    if (date.isValid() && time.isValid()) {
      to = moment(
        `${date.format('YYYYMMDD')} ${time.format('HHmm')}`,
        'YYYYMMDD HHmm',
        true
      )
      resolved.to = to.toISOString()
    } else {
      resolved.valid = false
    }
  }

  if (from && to && !from.isBefore(to)) resolved.valid = false

  return resolved
}

export function resolvedToIntervalMoment(resolved) {
  const newInterval = {}

  if (resolved.from) {
    newInterval.begins_at = resolved.from
    newInterval.ends_before = moment(resolved.from).add(1, 'ms')
  }

  return newInterval
}

export function resolvedToIntervalRange(resolved) {
  const newInterval = {}

  if (resolved.from) newInterval.begins_at = resolved.from
  if (resolved.to) newInterval.ends_before = resolved.to

  return newInterval
}

export function updateDateRange(dateRange, value) {
  const from = value.from && moment(value.from)
  const to = value.to && moment(value.to)

  dateRange.from = from && from.isValid() ? from.format(dateFormats.y4md) : null
  dateRange.to = to && to.isValid() ? to.format(dateFormats.y4md) : null
}
