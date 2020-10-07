import _get from 'lodash/get'
import math from '@/lib/math'
import { jsonFormat } from '@/lib/utils'

export function resolveAttributes(attributes) {
  const resolved = { data: null, valid: true }

  try {
    resolved.data = JSON.parse(attributes)
  } catch (err) {
    resolved.error = `Parse error: ${err.message}.`
    resolved.valid = false
  }

  return resolved
}

export function resolveDatapoint(datapoint) {
  const resolved = { data: null, valid: true }

  try {
    resolved.data = JSON.parse(datapoint)
  } catch (err) {
    resolved.error = `Parse error: ${err.message}.`
    resolved.valid = false
  }

  return resolved
}

export function resolveExpr(expr, attributesResolved) {
  const resolved = { code: null, valid: true }

  expr = expr || ''
  expr = expr.replace(/@{([.\w]+)}/g, (m, p) =>
    _get(attributesResolved.data, p, null)
  )

  try {
    resolved.code = math.compile(expr)
  } catch (err) {
    resolved.error = `Compile error: ${err.message}.`
    resolved.valid = false
  }

  return resolved
}

export function resolveResult(datapointResolved, exprResolved) {
  const resolved = { valid: true }

  if (datapointResolved.valid) {
    const data = JSON.parse(JSON.stringify(datapointResolved.data))

    if (exprResolved.valid) {
      try {
        exprResolved.code.evaluate(data)
      } catch (err) {
        resolved.error = `Evaluate error: ${err.message}.`
        resolved.valid = false
      }
    }

    resolved.datapoint = jsonFormat(data)
  }

  return resolved
}
