import api from '@/lib/api'

export default (_, inject) => {
  inject('api', api)
}
