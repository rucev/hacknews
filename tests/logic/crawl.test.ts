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

let mockAdd: any
vi.mock('../../src/data/repository.ts', () => {
  return {
    __esModule: true,
    default: class MockRepository {
      addNewEntry(...args: any[]) {
        return mockAdd(...args)
      }
    },
  }
})

import { crawl } from '../../src/logic/crawl.ts'

describe('crawl', () => {
  let fetchMock: any

  beforeEach(() => {
    mockAdd = vi.fn()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    mockWalker.nextNode.mockReset()
    mockDocument.createTreeWalker.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('logs extracted text when fetch succeeds', async () => {
    mockAdd.mockReturnValueOnce(undefined)

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
  })

  it('logs error when fetch fails', async () => {
    mockAdd.mockReturnValueOnce(undefined)

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    await expect(crawl()).rejects.toThrow('Failed to fetch https://news.ycombinator.com/: 500')
  })

  it('throws when repo.addNewEntry fails', async () => {
    mockAdd.mockImplementation(() => { throw new Error('no space') })

    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: vi.fn().mockResolvedValue('<html><body>oops</body></html>'),
    })

    mockWalker.nextNode
      .mockReturnValueOnce({ nodeValue: 'oops' })
      .mockReturnValueOnce(null)

    await expect(crawl()).rejects.toThrow('error saving file:\nError: no space')
  })
})