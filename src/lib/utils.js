/**
 * Escapes user input that is to be treated as a literal string within a regular expression.
 * SEE: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
 */
export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function idRandom() {
  return Math.floor(Math.random() * 10000)
}

export function jsonFormat(data) {
  return JSON.stringify(data, null, 2)
}

export function queryIs(is) {
  if (is === true || is === 'true') return true
  if (is === false || is === 'false') return false

  return null
}
