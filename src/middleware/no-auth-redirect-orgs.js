export default function ({ redirect, store }) {
  const { auth } = store.state

  if (!auth.payload) return redirect('/orgs')
}
