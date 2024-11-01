export default (_, sessionChannel) => {
  return {
    broadcastLogin() {
      sessionChannel.postMessage('login')
    },
    broadcastLogout() {
      sessionChannel.postMessage('logout')
    }
  }
}
