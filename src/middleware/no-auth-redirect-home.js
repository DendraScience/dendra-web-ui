export default function({ redirect, store }) {
  const { auth } = store.state

  if (!auth.payload) return

  return redirect('/')
}
