import { VoteButtons } from './VoteButtons'

interface ContentCardProps {
  contentId: string
  title: string
  initialVote?: boolean
}

export function ContentCard({ contentId, title, initialVote }: ContentCardProps) {
  return (
    <article className="content-card">
      <h2>{title}</h2>
      <VoteButtons contentId={contentId} initialVote={initialVote} />
    </article>
  )
}
