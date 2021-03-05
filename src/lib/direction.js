export const directionAbbrs = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW'
]

/**
 * Convert wind direction degrees to a directional index [0...15].
 */
export function degToIndex(deg) {
  return Math.abs(
    Math.round(((deg % 360) + (deg < 0 ? 360 : 0) - 11.25) / 22.5)
  )
}
