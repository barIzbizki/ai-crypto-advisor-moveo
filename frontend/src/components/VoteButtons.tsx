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
      <div className="vote-buttons__controls">
        <button
          type="button"
          className={`vote-buttons__btn${vote === true ? ' is-selected' : ''}`}
          aria-pressed={vote === true}
          aria-label="Thumbs up"
          onClick={() => handleVote(true)}
        >
          👍
        </button>
        <button
          type="button"
          className={`vote-buttons__btn${vote === false ? ' is-selected' : ''}`}
          aria-pressed={vote === false}
          aria-label="Thumbs down"
          onClick={() => handleVote(false)}
        >
          👎
        </button>
      </div>
      {vote !== undefined && (
        <p className="vote-buttons__status">{vote ? 'You upvoted this' : 'You downvoted this'}</p>
      )}
      {error && (
        <p className="vote-buttons-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
