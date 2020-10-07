/**
 * SEE: https://www.timeanddate.com/time/zones/
 * SEE: https://www.timetemperature.com/abbreviations/united_states_time_zone_abbreviations.shtml
 */
import { utcOffsetHours } from '@/lib/date'

export const timeZoneAbbrs = [
  'SST',
  'HAST',
  'AKST',
  'PST',
  'MST',
  'CST',
  'EST',
  'AST',
  'UTC',
  'CHST'
]

export const timeZoneOffsets = {
  SST: -39600,
  HAST: -36000,
  AKST: -32400,
  PST: -28800,
  MST: -25200,
  CST: -21600,
  EST: -18000,
  AST: -14400,
  UTC: 0,
  CHST: 36000
}

export const timeZoneItems = timeZoneAbbrs.map(abbr => {
  const offset = timeZoneOffsets[abbr]
  return {
    abbr,
    offset,
    text: `${abbr} (UTC ${utcOffsetHours(offset)} hours)`
  }
})
