import { useAuth } from '../context'

export function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <section>
      <h1>Dashboard</h1>
      <p>Signed in as {user?.email}</p>
      <button type="button" onClick={logout}>
        Log out
      </button>
    </section>
  )
}
