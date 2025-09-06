import fetch from './fetch'
import { processHtml } from './processors'
import { NewsEntry } from '../interfaces'

export default async (): Promise<undefined> => {
  try {
    const html = await fetch()

    const news: NewsEntry[] | undefined = processHtml(html)
    if (!news) throw new Error('No news available')

    console.log(`On TOP of Hacker News:\n"\x1b[1m${news[0].title}\x1b[0m"\n\tComments: ${news[0].comments} - Points: ${news[0].points}`)

  } catch (error) {
    throw new Error(`error fetching top entry:\n${error}`)
  }
}