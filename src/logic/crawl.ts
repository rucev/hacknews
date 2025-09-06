import Repository from '../data/repository'
import fetch from './fetch'
import { processHtml } from './processors'
import { NewsEntry } from '../interfaces'

export default async (): Promise<undefined> => {
  console.log('wait a moment...')

  try {
    const html = await fetch()

    const news: NewsEntry[] | undefined = processHtml(html)
    if (!news) throw new Error('No news available')

    const repo = new Repository()

    const newsEntries = { entries: news, timeStamp: new Date() }
    repo.addNewEntry(newsEntries)

    console.log(`build/data/entries.json - Last data saved at [${newsEntries.timeStamp}]`)

  } catch (error) {
    throw new Error(`error saving file:\n${error}`)
  }
}