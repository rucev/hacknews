import { JSDOM } from 'jsdom'
import Repository from '../data/repository'

export const crawl = async () => {
  console.log('wait a moment...')

  const url: string = 'https://news.ycombinator.com/'

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`)
  }

  const html = await res.text()

  const dom = new JSDOM(html)
  const document = dom.window.document

  const walker = document.createTreeWalker(document.body, dom.window.NodeFilter.SHOW_TEXT, null)
  let textContent = ''
  let node: Node | null
  while ((node = walker.nextNode())) {
    const text = node.nodeValue?.trim()
    if (text) textContent += text + ' '
  }

  const repo = new Repository()

  try {
    const newEntry = { content: textContent, timeStamp: new Date() }
    repo.addNewEntry(newEntry)
    console.log(`./data/entries.json - Last data saved at [${newEntry.timeStamp}]`)
  } catch (error) {
    throw new Error(`error saving file:\n${error}`)
  }
}