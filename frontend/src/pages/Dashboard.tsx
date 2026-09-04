import { useEffect, useState } from 'react'
import { useAuth } from '../context'
import { ContentCard } from '../components'
import { getFeedback } from '../api'
import type { FeedbackResponse } from '../api'
import { getDisplayName } from '../utils/displayName'

interface NewsItem {
  content_id: string
  headline: string
  description: string
  source: string
  date: string
}

interface PriceItem {
  content_id: string
  name: string
  symbol: string
  price: number | null
  market_cap: number | null
  change_24h: number | null
  unavailable: boolean
}

interface InsightItem {
  content_id: string
  content: string
}

interface MemeItem {
  content_id: string
  image_url: string
  caption: string | null
}

type SectionState<T> = {
  status: 'loading' | 'success' | 'error' | 'empty'
  data: T[]
  error: string | null
}

export function DashboardPage() {
  const { user, logout, token } = useAuth()

  const [news, setNews] = useState<SectionState<NewsItem>>({
    status: 'loading',
    data: [],
    error: null,
  })
  const [prices, setPrices] = useState<SectionState<PriceItem>>({
    status: 'loading',
    data: [],
    error: null,
  })
  const [insight, setInsight] = useState<SectionState<InsightItem>>({
    status: 'loading',
    data: [],
    error: null,
  })
  const [meme, setMeme] = useState<SectionState<MemeItem>>({
    status: 'loading',
    data: [],
    error: null,
  })

  const [feedback, setFeedback] = useState<Record<string, FeedbackResponse>>({})

  useEffect(() => {
    if (!user || !token) return

    const fetchDashboardContent = async () => {
      try {
        const [newsRes, pricesRes, insightRes, memeRes] = await Promise.allSettled([
          fetch('/api/dashboard/news', { headers: { Authorization: `Bearer ${token}` } }).then(
            r => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))),
          ),
          fetch('/api/dashboard/prices', { headers: { Authorization: `Bearer ${token}` } }).then(
            r => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))),
          ),
          fetch('/api/dashboard/insight', { headers: { Authorization: `Bearer ${token}` } }).then(
            r => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))),
          ),
          fetch('/api/dashboard/meme', { headers: { Authorization: `Bearer ${token}` } }).then(
            r => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))),
          ),
        ])

        const newsItems: NewsItem[] = newsRes.status === 'fulfilled' ? newsRes.value : []
        const priceItems: PriceItem[] = pricesRes.status === 'fulfilled' ? pricesRes.value : []
        const insightItems: InsightItem[] = insightRes.status === 'fulfilled' ? [insightRes.value] : []
        const memeItems: MemeItem[] = memeRes.status === 'fulfilled' ? [memeRes.value] : []

        setNews({
          status: newsItems.length > 0 ? 'success' : 'empty',
          data: newsItems,
          error: newsRes.status === 'rejected' ? 'Failed to load news' : null,
        })
        setPrices({
          status: priceItems.length > 0 ? 'success' : 'empty',
          data: priceItems,
          error: pricesRes.status === 'rejected' ? 'Failed to load prices' : null,
        })
        setInsight({
          status: insightItems.length > 0 ? 'success' : 'empty',
          data: insightItems,
          error: insightRes.status === 'rejected' ? 'Failed to load insight' : null,
        })
        setMeme({
          status: memeItems.length > 0 ? 'success' : 'empty',
          data: memeItems,
          error: memeRes.status === 'rejected' ? 'Failed to load meme' : null,
        })

        const allContentIds = [
          ...newsItems.map(n => n.content_id),
          ...priceItems.map(p => p.content_id),
          ...insightItems.map(i => i.content_id),
          ...memeItems.map(m => m.content_id),
        ]

        if (allContentIds.length > 0) {
          try {
            const feedbackData = await getFeedback(allContentIds, token)
            const feedbackMap = feedbackData.reduce(
              (acc, fb) => {
                acc[fb.content_id] = fb
                return acc
              },
              {} as Record<string, FeedbackResponse>,
            )
            setFeedback(feedbackMap)
          } catch {
            setFeedback({})
          }
        }
      } catch (err) {
        console.error('Dashboard load error:', err)
      }
    }

    fetchDashboardContent()
  }, [user, token])

  const displayName = user ? getDisplayName(user.name || null, user.email) : 'Guest'

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {displayName}!</h1>
        <p>Your personalized crypto dashboard</p>
        <button type="button" className="btn btn-secondary" onClick={logout}>
          Log out
        </button>
      </div>

      <div className="dashboard-sections">
        <section className="dashboard-section">
          <h2>Market News</h2>
          {news.status === 'loading' && <p className="section-loading">Loading news...</p>}
          {news.status === 'error' && <p className="section-error">{news.error}</p>}
          {news.status === 'empty' && <p className="section-empty">No news available</p>}
          {news.status === 'success' && (
            <div className="section-content">
              {news.data.map(item => (
                <ContentCard
                  key={item.content_id}
                  contentId={item.content_id}
                  title={item.headline}
                  initialVote={feedback[item.content_id]?.is_upvote}
                />
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Coin Prices</h2>
          {prices.status === 'loading' && <p className="section-loading">Loading prices...</p>}
          {prices.status === 'error' && <p className="section-error">{prices.error}</p>}
          {prices.status === 'empty' && <p className="section-empty">No prices available</p>}
          {prices.status === 'success' && (
            <div className="section-content">
              {prices.data.map(item => (
                <ContentCard
                  key={item.content_id}
                  contentId={item.content_id}
                  title={`${item.symbol} - $${item.price?.toFixed(2) ?? 'N/A'}`}
                  initialVote={feedback[item.content_id]?.is_upvote}
                />
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Today's Insight</h2>
          {insight.status === 'loading' && <p className="section-loading">Generating insight...</p>}
          {insight.status === 'error' && <p className="section-error">{insight.error}</p>}
          {insight.status === 'empty' && <p className="section-empty">No insight available</p>}
          {insight.status === 'success' && (
            <div className="section-content">
              {insight.data.map(item => (
                <ContentCard
                  key={item.content_id}
                  contentId={item.content_id}
                  title={item.content}
                  initialVote={feedback[item.content_id]?.is_upvote}
                />
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Fun Crypto Meme</h2>
          {meme.status === 'loading' && <p className="section-loading">Loading meme...</p>}
          {meme.status === 'error' && <p className="section-error">{meme.error}</p>}
          {meme.status === 'empty' && <p className="section-empty">No meme available</p>}
          {meme.status === 'success' && (
            <div className="section-content">
              {meme.data.map(item => (
                <ContentCard
                  key={item.content_id}
                  contentId={item.content_id}
                  title={item.caption || 'Crypto Meme'}
                  initialVote={feedback[item.content_id]?.is_upvote}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
