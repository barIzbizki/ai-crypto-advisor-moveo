import { useAuth } from '../context'
import { ContentCard } from '../components'

const SAMPLE_CONTENT = [
  { contentId: 'btc-daily-summary', title: 'BTC Daily Summary' },
  { contentId: 'eth-price-alert', title: 'ETH Price Alert' },
]

export function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Signed in as {user?.email}</p>
        <button type="button" className="btn" onClick={logout}>
          Log out
        </button>
      </div>
      <div className="content-cards">
        {SAMPLE_CONTENT.map((item) => (
          <ContentCard key={item.contentId} contentId={item.contentId} title={item.title} />
        ))}
      </div>
    </div>
  )
}
