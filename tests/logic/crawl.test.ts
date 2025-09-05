import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { crawl } from '../../src/logic/crawl'
import { formatEntry } from '../../src/logic/utils'

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

vi.mock('../../src/logic/utils', () => ({
  formatEntry: vi.fn((arr) => ({
    number: Number(arr[0].split('.')[0]),
    title: arr[0].replace(/^\d+\./, '').replace(/\(.*\)$/, '').trim(),
    points: Number(arr[1].match(/(\d+)\s+points/)?.[1] ?? 0),
    comments: Number(arr[1].match(/(\d+)\s+comments/)?.[1] ?? 0),
  })),
}))

const mockRows = [
  { textContent: '1. First news (example.com)' },
  { textContent: '100 points by user | 10 comments' },
  { textContent: 'separator row' },
  { textContent: '2. Second news' },
  { textContent: '200 points by user | 20 comments' },
  { textContent: 'separator row' },
  { textContent: '' },
  { textContent: 'more' },
  { textContent: 'separator row' },
]

const mockTbody = {
  querySelectorAll: vi.fn((selector: string) => mockRows as unknown as NodeListOf<any>),
}

const mockBigbox = {
  querySelector: vi.fn((selector) => (selector === 'tbody' ? mockTbody : null)),
}

const mockDocument = {
  querySelector: vi.fn((selector) => (selector === 'tr#bigbox' ? mockBigbox : null)),
}


describe('crawl', () => {
  beforeEach(() => {
    mockAdd = vi.fn()
    vi.clearAllMocks()

    vi.mock('jsdom', () => {
      return {
        JSDOM: vi.fn(() => ({
          window: {
            document: mockDocument,
          },
        })),
      }
    })


    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue('<html></html>'),
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('parses rows correctly and calls formatEntry', async () => {
    await crawl()

    const rows = Array.from(mockTbody.querySelectorAll('tr'))
    expect(rows).toHaveLength(mockRows.length)
    expect(rows[0].textContent).toBe('1. First news (example.com)')
    expect(rows[1].textContent).toBe('100 points by user | 10 comments')

    expect(formatEntry).toHaveBeenNthCalledWith(1, [
      '1. First news (example.com)',
      '100 points by user | 10 comments',
    ])
    expect(formatEntry).toHaveBeenNthCalledWith(2, [
      '2. Second news',
      '200 points by user | 20 comments',
    ])

    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        entries: [
          { number: 1, title: 'First news', points: 100, comments: 10 },
          { number: 2, title: 'Second news', points: 200, comments: 20 },
        ],
        timeStamp: expect.any(Date),
      })
    )
  })

  it('throws error if fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    await expect(crawl()).rejects.toThrow('Failed to fetch https://news.ycombinator.com/: 500')
  })

  it('throws error if <tr id="bigbox"> is missing', async () => {
    mockDocument.querySelector = vi.fn(() => null)
    await expect(crawl()).rejects.toThrow('No <tr id="bigbox"> found in the page')
  })

  it('throws error if <tbody> inside bigbox is missing', async () => {
    mockDocument.querySelector = vi.fn(() => mockBigbox)
    mockBigbox.querySelector = vi.fn(() => null)
    await expect(crawl()).rejects.toThrow('No <tbody> found inside <tr id="bigbox">')
  })

  it('throws error if repository.addNewEntry fails', async () => {
    mockDocument.querySelector = vi.fn(() => mockBigbox)
    mockBigbox.querySelector = vi.fn(() => mockTbody)
    mockTbody.querySelectorAll = vi.fn(() => mockRows as unknown as NodeListOf<any>)

    mockAdd.mockImplementation(() => { throw new Error('disk full') })
    await expect(crawl()).rejects.toThrow('error saving file:\nError: disk full')
  })
})
