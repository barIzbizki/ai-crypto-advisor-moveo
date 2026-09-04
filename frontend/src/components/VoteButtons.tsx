import { useState } from 'react'
import { submitFeedback } from '../api'
import { useAuth } from '../context'

interface VoteButtonsProps {
  contentId: string
  initialVote?: boolean
}

export function VoteButtons({ contentId, initialVote }: VoteButtonsProps) {
  const { token } = useAuth()
  const [vote, setVote] = useState<boolean | undefined>(initialVote)
  const [error, setError] = useState<string | null>(null)

  function handleVote(nextVote: boolean) {
    if (vote === nextVote || !token) {
      return
    }

    const previousVote = vote
    setVote(nextVote)
    setError(null)

    submitFeedback(contentId, nextVote, token)
      .then((response) => {
        setVote(response.feedback.is_upvote)
      })
      .catch(() => {
        setVote(previousVote)
        setError('Could not submit your vote. Please try again.')
      })
  }

  return (
    <div className="vote-buttons">
      <button
        type="button"
        aria-pressed={vote === true}
        aria-label="Thumbs up"
        onClick={() => handleVote(true)}
      >
        👍
      </button>
      <button
        type="button"
        aria-pressed={vote === false}
        aria-label="Thumbs down"
        onClick={() => handleVote(false)}
      >
        👎
      </button>
      {error && (
        <p className="vote-buttons-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
