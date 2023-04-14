export default async function ({ app, error }) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(
      new URL(`${app.$api.uri}${app.$api.path}/system/time/utc`),
      {
        mode: 'cors',
        cache: 'no-cache',
        signal: controller.signal
      }
    )
    if (!response.ok) {
      return error({
        isDown: true,
        statusCode: 500,
        message: 'API error.'
      })
    }
  } catch (err) {
    return error({
      isDown: true,
      statusCode: 500,
      message: 'API error.'
    })
  } finally {
    clearTimeout(id)
  }
}
