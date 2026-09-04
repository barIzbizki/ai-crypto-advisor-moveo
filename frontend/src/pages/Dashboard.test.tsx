import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { DashboardPage } from './Dashboard'
import * as apiModule from '../api'
import * as authModule from '../context'

const mockUser = {
  id: 1,
  email: 'john.doe@example.com',
  name: 'John Doe',
  onboarded: true,
  created_at: '2026-09-01T00:00:00Z',
}

const mockToken = 'test-token-123'

const mockNewsData = [
  {
    content_id: 'news:1',
    headline: 'Bitcoin News',
    description: 'BTC headline',
    source: 'CryptoNews',
    date: '2026-09-04',
  },
]

const mockPricesData = [
  {
    content_id: 'price:btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 45000,
    market_cap: 900000000000,
    change_24h: 2.5,
    unavailable: false,
  },
]

const mockInsightData = {
  content_id: 'ai-insight:1:2026-09-04',
  content: 'Today is a good day for hodlers',
}

const mockMemeData = {
  content_id: 'meme:hodl',
  image_url: 'https://example.com/hodl.jpg',
  caption: 'Hold on for dear life',
}

const mockFeedbackData = [
  {
    id: 1,
    user_id: 1,
    content_id: 'news:1',
    is_upvote: true,
    created_at: '2026-09-04T00:00:00Z',
    updated_at: '2026-09-04T00:00:00Z',
  },
]

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays welcome header with user name', async () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: mockUser,
      status: 'authenticated',
      token: mockToken,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      completeOnboarding: vi.fn(),
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'empty' }), { status: 404 }),
    )

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/Welcome, John Doe!/)).toBeInTheDocument()
    })
  })

  it('displays all four sections regardless of content_types', async () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: mockUser,
      status: 'authenticated',
      token: mockToken,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      completeOnboarding: vi.fn(),
    })

    vi.spyOn(globalThis, 'fetch').mockImplementation(((url: RequestInfo | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString()
      if (urlStr.includes('/dashboard/news')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockNewsData), { status: 200 }),
        )
      }
      if (urlStr.includes('/dashboard/prices')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockPricesData), { status: 200 }),
        )
      }
      if (urlStr.includes('/dashboard/insight')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockInsightData), { status: 200 }),
        )
      }
      if (urlStr.includes('/dashboard/meme')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockMemeData), { status: 200 }),
        )
      }
      if (urlStr.includes('/feedback')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockFeedbackData), { status: 200 }),
        )
      }
      return Promise.reject(new Error('Unknown URL'))
    }))

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Market News')).toBeInTheDocument()
      expect(screen.getByText('Coin Prices')).toBeInTheDocument()
      expect(screen.getByText("Today's Insight")).toBeInTheDocument()
      expect(screen.getByText('Fun Crypto Meme')).toBeInTheDocument()
    })
  })

  it('shows loading state for sections', async () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: mockUser,
      status: 'authenticated',
      token: mockToken,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      completeOnboarding: vi.fn(),
    })

    let resolveFetch: (value: Response) => void = () => {}
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () =>
        new Promise<Response>(resolve => {
          resolveFetch = resolve
        }),
    )

    render(<DashboardPage />)

    expect(screen.getByText('Loading news...')).toBeInTheDocument()
    expect(screen.getByText('Loading prices...')).toBeInTheDocument()
    expect(screen.getByText('Generating insight...')).toBeInTheDocument()
    expect(screen.getByText('Loading meme...')).toBeInTheDocument()

    resolveFetch(new Response(JSON.stringify([]), { status: 200 }))

    await waitFor(() => {
      expect(screen.getByText('Loading news...')).toBeInTheDocument()
    })
  })

  it('renders all sections even when some data fails', async () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: mockUser,
      status: 'authenticated',
      token: mockToken,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      completeOnboarding: vi.fn(),
    })

    vi.spyOn(globalThis, 'fetch').mockImplementation(((url: RequestInfo | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString()
      if (urlStr.includes('/dashboard/news')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockNewsData), { status: 200 }),
        )
      }
      if (urlStr.includes('/dashboard/prices')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockPricesData), { status: 200 }),
        )
      }
      if (urlStr.includes('/dashboard/insight')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockInsightData), { status: 200 }),
        )
      }
      if (urlStr.includes('/dashboard/meme')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockMemeData), { status: 200 }),
        )
      }
      if (urlStr.includes('/feedback')) {
        return Promise.resolve(
          new Response(JSON.stringify([]), { status: 200 }),
        )
      }
      return Promise.reject(new Error('Unknown URL'))
    }))

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('Bitcoin News')).toBeInTheDocument()
      expect(screen.getByText('BTC - $45000.00')).toBeInTheDocument()
      expect(screen.getByText('Today is a good day for hodlers')).toBeInTheDocument()
      expect(screen.getByText('Hold on for dear life')).toBeInTheDocument()
    })
  })

  it('shows empty state when section has no data', async () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: mockUser,
      status: 'authenticated',
      token: mockToken,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      completeOnboarding: vi.fn(),
    })

    vi.spyOn(globalThis, 'fetch').mockImplementation(((url: RequestInfo | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString()
      if (urlStr.includes('/dashboard/news')) {
        return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }))
      }
      if (urlStr.includes('/dashboard/prices')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockPricesData), { status: 200 }),
        )
      }
      if (urlStr.includes('/dashboard/insight')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockInsightData), { status: 200 }),
        )
      }
      if (urlStr.includes('/dashboard/meme')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockMemeData), { status: 200 }),
        )
      }
      if (urlStr.includes('/feedback')) {
        return Promise.resolve(
          new Response(JSON.stringify([]), { status: 200 }),
        )
      }
      return Promise.reject(new Error('Unknown URL'))
    }))

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('No news available')).toBeInTheDocument()
    })
  })

  it('hydrates vote state from getFeedback', async () => {
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: mockUser,
      status: 'authenticated',
      token: mockToken,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
      completeOnboarding: vi.fn(),
    } as ReturnType<typeof authModule.useAuth>)

    vi.spyOn(apiModule, 'getFeedback').mockResolvedValue(mockFeedbackData)

    vi.spyOn(globalThis, 'fetch').mockImplementation(((url: RequestInfo | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString()
      if (urlStr.includes('/dashboard/news')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockNewsData), { status: 200 }),
        )
      }
      if (urlStr.includes('/dashboard/prices')) {
        return Promise.resolve(
          new Response(JSON.stringify([]), { status: 200 }),
        )
      }
      if (urlStr.includes('/dashboard/insight')) {
        return Promise.resolve(
          new Response(JSON.stringify(null), { status: 404 }),
        )
      }
      if (urlStr.includes('/dashboard/meme')) {
        return Promise.resolve(
          new Response(JSON.stringify(null), { status: 404 }),
        )
      }
      return Promise.reject(new Error('Unknown URL'))
    }))

    render(<DashboardPage />)

    await waitFor(() => {
      expect(apiModule.getFeedback).toHaveBeenCalledWith(['news:1'], mockToken)
    })
  })

  it('logs out user when logout button clicked', async () => {
    const mockLogout = vi.fn()
    vi.spyOn(authModule, 'useAuth').mockReturnValue({
      user: mockUser,
      status: 'authenticated',
      token: mockToken,
      login: vi.fn(),
      signup: vi.fn(),
      logout: mockLogout,
      completeOnboarding: vi.fn(),
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'empty' }), { status: 404 }),
    )

    render(<DashboardPage />)

    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /log out/i })
      expect(logoutButton).toBeInTheDocument()
    })
  })
})
