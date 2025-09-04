import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockWalker = { nextNode: vi.fn() }
const mockDocument = {
  body: {},
  createTreeWalker: vi.fn(() => mockWalker),
}
const mockDom = {
  window: {
    document: mockDocument,
    NodeFilter: { SHOW_TEXT: 4 },
  },
}

vi.mock('jsdom', () => {
  return {
    JSDOM: vi.fn(() => mockDom),
  }
})

import { crawl } from '../../logic/index.ts'

describe('crawl', () => {
  let fetchMock: any
  let consoleLogSpy: any
  let consoleErrorSpy: any

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { })
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

    mockWalker.nextNode.mockReset()
    mockDocument.createTreeWalker.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('logs extracted text when fetch succeeds', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: vi.fn().mockResolvedValue('<html><body>hello world</body></html>'),
    })

    mockWalker.nextNode
      .mockReturnValueOnce({ nodeValue: 'hello ' })
      .mockReturnValueOnce({ nodeValue: 'world' })
      .mockReturnValueOnce(null)

    await crawl()

    expect(fetchMock).toHaveBeenCalledWith('https://news.ycombinator.com/')
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Text content from https://news.ycombinator.com/')
    )
    expect(consoleLogSpy).toHaveBeenCalledWith('hello world ')
  })

  it('logs error when fetch fails', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    await crawl()

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to fetch https://news.ycombinator.com/: 500'
    )
  })
})