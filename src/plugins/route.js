export default ({ app, store }) => {
  app.router.beforeEach((to, from, next) =>
    next(!store.state.session.isTokenExpired)
  )
}
