import type { NewsEntry } from '../interfaces/index.js'

export const formatEntry = (rawEntry: string[]): NewsEntry | null => {
  if (!rawEntry || rawEntry.length < 2) return null

  const [titleLine, metaLine] = rawEntry

  const numberMatch = titleLine.match(/^(\d+)\./)
  const number = numberMatch ? parseInt(numberMatch[1], 10) : 0

  let title = titleLine.replace(/^(\d+\.)\s*/, '')
  title = title.replace(/\s*\(.*\)$/, '').trim() //remove the domain at the end

  const pointsMatch = metaLine.match(/(\d+)\s+points?/)
  const points = pointsMatch ? parseInt(pointsMatch[1], 10) : 0

  const commentsMatch = metaLine.match(/(\d+)\s+comments?/)
  const comments = commentsMatch ? parseInt(commentsMatch[1], 10) : 0

  return { number, title, points, comments }
}