import type { NewsEntry } from '../interfaces/index.js'
import { JSDOM } from 'jsdom'

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

export const processHtml = (html: string): NewsEntry[] | undefined => {
  const dom = new JSDOM(html)
  const document = dom.window.document

  const bigboxTr = document.querySelector('tr#bigbox') //id of the row that has all the news in the website
  if (!bigboxTr) {
    throw new Error('No <tr id="bigbox"> found in the page')
  }

  const tbody = bigboxTr.querySelector('tbody')
  if (!tbody) {
    throw new Error('No <tbody> found inside <tr id="bigbox">')
  }

  const rows = Array.from(tbody.querySelectorAll('tr'))
  const news: NewsEntry[] = []

  for (let i = 0; i < rows.length - 3; i += 3) {
    //each new has 3 rows, the last one is a separator so has no info.
    //besides, the last row has the "more" shield, so it's excluded from this loop too.
    const entryRaw = rows.slice(i, i + 2).map(tr => tr.textContent?.trim() || '')
    const entry = formatEntry(entryRaw)
    if (entry) news.push(entry)
  }

  return news
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