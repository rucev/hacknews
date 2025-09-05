import { JSDOM } from 'jsdom'
import Repository from '../data/repository'
import { formatEntry, isAllowedByRobots } from './utils'
import { NewsEntry } from '../interfaces'

export default async (): Promise<Date | undefined> => {
  console.log('wait a moment...')

  const url: string = 'https://news.ycombinator.com/'

  try {
    const isAllowed = isAllowedByRobots(url)
    if (!isAllowed) throw new Error('Error checking robots.txt')
  } catch (error) {
    throw new Error('Error checking robots.txt')
  }

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`)
  }

  const html = await res.text()
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

  const repo = new Repository()

  try {
    const newsEntries = { entries: news, timeStamp: new Date() }
    repo.addNewEntry(newsEntries)
    console.log(`build/data/entries.json - Last data saved at [${newsEntries.timeStamp}]`)
    return newsEntries.timeStamp
  } catch (error) {
    throw new Error(`error saving file:\n${error}`)
  }
}