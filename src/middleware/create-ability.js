export default function ({ redirect, route, store }) {
  const validateName = route.path && route.path.split('/')[1]

  if (!store.$canCreate(validateName)) return redirect('/')
}
