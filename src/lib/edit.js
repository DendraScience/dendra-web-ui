import _pickBy from 'lodash/pickBy'
import _reduce from 'lodash/reduce'

const arrays = [
  'actions',
  'datastream_ids',
  'external_links',
  'intervals',
  'involved_parties',
  'station_ids'
]
const fields = [
  'description',
  'full_name',
  'is_active',
  'is_enabled',
  'is_geo_protected',
  'is_hidden',
  'is_stationary',
  'name',
  'slug',
  'source_type',
  'state',
  'station_id',
  'time_zone',
  'title'
]
const objects = ['access_levels', 'attributes', 'geo', 'terms']

export function setData(instance) {
  const data = _pickBy(instance, (value, key) => {
    return (
      (arrays.includes(key) && value && value.length) ||
      (objects.includes(key) && value && Object.keys(value).length) ||
      fields.includes(key)
    )
  })
  if (data.geo) {
    const { geoCoordinates } = instance
    data.geo.coordinates = [
      parseFloat(geoCoordinates.lng),
      parseFloat(geoCoordinates.lat)
    ]
    if (geoCoordinates.ele > '')
      data.geo.coordinates.push(parseFloat(geoCoordinates.ele))
  }

  return data
}

export function unsetData(instance) {
  return _reduce(
    instance,
    (result, value, key) => {
      if (
        (arrays.includes(key) && (!value || value.length === 0)) ||
        (objects.includes(key) && (!value || Object.keys(value).length === 0))
      )
        result[key] = ''
      return result
    },
    {}
  )
}

export function createData(instance) {
  return setData(instance)
}

export function patchData(instance) {
  return { $set: setData(instance), $unset: unsetData(instance) }
}
