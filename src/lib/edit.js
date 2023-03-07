import _pickBy from 'lodash/pickBy'
import _reduce from 'lodash/reduce'

const arrays = [
  'actions',
  'datapoints_config',
  'datastream_ids',
  'derived_from_datastream_ids',
  'external_links',
  'intervals',
  'involved_parties',
  'station_ids',
  'roles'
]
const booleans = [
  'is_active',
  'is_enabled',
  'is_geo_protected',
  'is_hidden',
  'is_stationary'
]
const fields = [
  'company_type',
  'derivation_description',
  'derivation_method',
  'description',
  'full_name',
  'model',
  'name',
  'oem_company_id',
  'reseller_company_id',
  'slug',
  'source_type',
  'state',
  'station_id',
  'thing_type_id',
  'time_zone',
  'title',
  'url',
  'email',
  'password',
  'person_id'
]
const objects = [
  'access_levels',
  'attributes',
  'general_config',
  'geo',
  'terms'
]

export function defaultAnnotation(org) {
  return {
    actions: [],
    datastream_ids: [],
    description: '',
    intervals: [],
    involved_parties: [],
    organization_id: org._id,
    station_ids: [],
    title: ''
  }
}

export function defaultCompany() {
  return {
    company_type: 'corporation',
    description: '',
    full_name: '',
    name: '',
    url: ''
  }
}

export function defaultDatastream(org) {
  return {
    access_levels: {},
    attributes: {},
    datapoints_config: [],
    derived_from_datastream_ids: [],
    description: '',
    general_config: null,
    geo: null,
    geoCoordinates: {
      ele: null,
      lat: 0,
      lng: 0
    },
    involved_parties: [],
    is_enabled: true,
    is_geo_protected: false,
    is_hidden: false,
    name: '',
    organization_id: org._id,
    source_type: 'sensor',
    state: 'ready',
    station_id: null,
    terms: {},
    thing_type_id: null
  }
}

export function defaultStation(org) {
  return {
    access_levels: {},
    description: '',
    external_links: [],
    full_name: '',
    general_config: null,
    geo: null,
    geoCoordinates: {
      ele: null,
      lat: 0,
      lng: 0
    },
    involved_parties: [],
    is_active: true,
    is_enabled: true,
    is_geo_protected: false,
    is_hidden: false,
    is_stationary: true,
    name: '',
    organization_id: org._id,
    slug: 'new-station',
    state: 'ready',
    time_zone: 'PST'
  }
}

export function defaultThingType() {
  return {
    description: '',
    external_links: [],
    is_enabled: true,
    model: '',
    name: ''
  }
}

export function defaultUser() {
  return {
    email: '',
    full_name: '',
    name: '',
    roles: []
  }
}

export function setData(instance) {
  const data = _pickBy(instance, (value, key) => {
    return (
      (arrays.includes(key) && value && value.length) ||
      booleans.includes(key) ||
      (fields.includes(key) && !!value) ||
      (objects.includes(key) && value && Object.keys(value).length)
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
        (arrays.includes(key) && !(value && value.length)) ||
        (fields.includes(key) && !value) ||
        (objects.includes(key) && !(value && Object.keys(value).length))
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
  const patch = { $set: setData(instance), $unset: unsetData(instance) }
  return patch
}
