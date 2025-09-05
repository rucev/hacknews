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

export const countWords = (text: string): number => {
  return text.trim().split(' ').filter(str => str.toUpperCase() !== str.toLowerCase()).length
}

export const filterLongTitles = (entries: NewsEntry[]): NewsEntry[] => {
  return entries.filter(entry => countWords(entry.title) > 5)
}

export const filterShortTitles = (entries: NewsEntry[]): NewsEntry[] => {
  return entries.filter(entry => countWords(entry.title) <= 5)
}

export const sortByComments = (entries: NewsEntry[]): NewsEntry[] => {
  return entries.sort((news1, news2) => news2.comments - news1.comments)
}

export const sortByPoints = (entries: NewsEntry[]): NewsEntry[] => {
  return entries.sort((news1, news2) => news2.points - news1.points)
}