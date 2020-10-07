export function sampleAttributes() {
  return {
    height: 10
  }
}

export function sampleDatapoint() {
  return {
    d: {
      max: 220.8,
      min: 190.1
    },
    lt: '2019-10-26T12:40:00.000',
    t: '2019-10-26T20:40:00.000Z',
    v: 192.96,
    va: [192.92, 192.93]
  }
}

export function sampleExpr() {
  return 'v = number(v * @{height})'
}
