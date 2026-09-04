export function getDisplayName(name: string | null | undefined, email: string): string {
  if (name && name.trim()) {
    return name.trim()
  }

  const localPart = email.split('@')[0]
  return capitalizeWords(localPart)
}

function capitalizeWords(text: string): string {
  return text
    .split(/[.\-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
