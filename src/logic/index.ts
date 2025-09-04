import { JSDOM } from 'jsdom'

export const crawl = async () => {
  const url: string = 'https://news.ycombinator.com/'

  const res = await fetch(url)
  if (!res.ok) {
    console.error(`Failed to fetch ${url}: ${res.status}`)
    return
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

  console.log(`Text content from ${url}:\n`)
  console.log(textContent)
}

