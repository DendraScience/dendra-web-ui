import Vue from 'vue'
import math from '@/lib/math'
import moment from 'moment'

Vue.filter('formatUTC', (value, f) => {
  if (!value) return ''

  return moment(value)
    .utc()
    .format(f)
})

Vue.filter('round', (value, n = 1) => {
  if (!value) return ''

  return math.round(value, n)
})
