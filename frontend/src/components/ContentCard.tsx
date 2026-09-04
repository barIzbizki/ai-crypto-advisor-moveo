import { VoteButtons } from './VoteButtons'

interface ContentCardProps {
  contentId: string
  title: string
}

export function ContentCard({ contentId, title }: ContentCardProps) {
  return (
    <article className="content-card">
      <h2>{title}</h2>
      <VoteButtons contentId={contentId} />
    </article>
  )
}
