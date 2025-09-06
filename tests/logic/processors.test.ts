import { describe, it, expect, vi } from 'vitest'
import { filterLongTitles, filterShortTitles, sortByComments, sortByPoints, formatEntry, countWords, processHtml } from '../../src/logic/processors'
import type { NewsEntry } from '../../src/interfaces'
import { JSDOM } from 'jsdom'
import { beforeEach } from 'node:test'

vi.mock('jsdom')

const entries: NewsEntry[] = [
  { number: 1, title: 'Short title', points: 10, comments: 5 },
  { number: 2, title: 'This is a title with exactly six words', points: 20, comments: 15 },
  { number: 3, title: 'Another very long news title for testing', points: 30, comments: 25 },
  { number: 4, title: 'Tiny', points: 5, comments: 2 },
]

describe('countWords', () => {
  it('counts only real words ignoring empty strings', () => {
    expect(countWords('Hello world')).toBe(2)
    expect(countWords('')).toBe(0)
    expect(countWords('   Many   spaces  here  ')).toBe(3)
  })
})

describe('filterLongTitles', () => {
  it('filters entries with more than 5 words in the title', () => {
    const result = filterLongTitles(entries)
    expect(result).toHaveLength(2)
    expect(result.map(e => e.number)).toEqual([2, 3])
  })

  it('returns empty array if no titles are long enough', () => {
    const shortEntries = [
      { number: 5, title: 'Tiny title', points: 5, comments: 1 },
      { number: 6, title: 'Short', points: 2, comments: 0 },
    ]
    const result = filterLongTitles(shortEntries)
    expect(result).toEqual([])
  })
})

describe('filterShortTitles', () => {
  it('filters entries with 5 or fewer words in the title', () => {
    const result = filterShortTitles(entries)
    expect(result.map(e => e.number)).toEqual([1, 4])
  })

  it('returns empty array if all titles are long', () => {
    const longEntries = [
      { number: 1, title: 'This is a long title with many words', points: 10, comments: 5 },
    ]
    const result = filterShortTitles(longEntries)
    expect(result).toEqual([])
  })
})

describe('sortByComments', () => {
  it('sorts entries descending by number of comments', () => {
    const result = sortByComments([...entries])
    const comments = result.map(e => e.comments)
    expect(comments).toEqual([25, 15, 5, 2])
  })

  it('keeps entries with equal comments in relative order', () => {
    const equalComments = [
      { number: 1, title: 'A', points: 10, comments: 5 },
      { number: 2, title: 'B', points: 20, comments: 5 },
      { number: 3, title: 'C', points: 15, comments: 5 },
    ]
    const result = sortByComments([...equalComments])
    const numbers = result.map(e => e.number)
    expect(numbers).toEqual([1, 2, 3])
  })
})

describe('sortByPoints', () => {
  it('sorts entries descending by points', () => {
    const result = sortByPoints([...entries])
    const points = result.map(e => e.points)
    expect(points).toEqual([30, 20, 10, 5])
  })
})

describe('formatEntry', () => {
  it('parses a valid raw entry into NewsEntry', () => {
    const rawEntry = [
      '30. Cool Title (pauladamsmith.com)',
      '167 points by user 19 hours ago  | hide | 45 comments',
    ]
    const result = formatEntry(rawEntry)
    expect(result).toEqual({
      number: 30,
      title: 'Cool Title',
      points: 167,
      comments: 45,
    })
  })

  it('returns null if rawEntry is empty or too short', () => {
    expect(formatEntry([])).toBeNull()
    expect(formatEntry(['Only one line'])).toBeNull()
  })

  it('handles missing numbers, points, or comments gracefully', () => {
    const rawEntry = [
      'NoNumberTitle',
      'NoPointsOrComments here',
    ]
    const result = formatEntry(rawEntry)
    expect(result).toEqual({
      number: 0,
      title: 'NoNumberTitle',
      points: 0,
      comments: 0,
    })
  })

  it('removes domain in parentheses from title', () => {
    const rawEntry = [
      '12. Some news title (example.com)',
      '100 points by user | 50 comments',
    ]
    const result = formatEntry(rawEntry)
    expect(result?.title).toBe('Some news title')
  })
})

describe('processHtml', () => {
  beforeEach(() => {
    vi.clearAllMocks()
      ; (formatEntry as vi.Mock).mockReturnValue(entries)
  })

  it('parses HTML and formats multiple news entries', () => {
    const rowsMock = [
      { textContent: '1. Short title' },
      { textContent: '10 points 5 comments' },
      { textContent: 'separator' },

      { textContent: '2. This is a title with exactly six words' },
      { textContent: '20 points 15 comments' },
      { textContent: 'separator' },

      { textContent: '3. Another very long news title for testing' },
      { textContent: '30 points 25 comments' },
      { textContent: 'separator' },

      { textContent: '4. Tiny' },
      { textContent: '5 points 2 comments' },
      { textContent: 'separator' },

      { textContent: 'More' },
    ]

    const tbodyMock = { querySelectorAll: vi.fn().mockReturnValue(rowsMock) }
    const bigboxMock = { querySelector: vi.fn().mockImplementation(sel => sel === 'tbody' ? tbodyMock : null) }
    const documentMock = { querySelector: vi.fn().mockImplementation(sel => sel === 'tr#bigbox' ? bigboxMock : null) }

      ; (JSDOM as unknown as vi.Mock).mockImplementation(() => ({
        window: { document: documentMock }
      }))

    const result = processHtml('<html></html>')

    expect(result).toEqual(entries)
  })

  it('throws if <tr id="bigbox"> is missing', () => {
    ; (JSDOM as unknown as vi.Mock).mockImplementation(() => ({
      window: { document: { querySelector: vi.fn().mockReturnValue(null) } }
    }))

    expect(() => processHtml('<html></html>')).toThrow('No <tr id="bigbox"> found')
  })

  it('throws if <tbody> is missing', () => {
    const bigboxMock = { querySelector: vi.fn().mockReturnValue(null) }
      ; (JSDOM as unknown as vi.Mock).mockImplementation(() => ({
        window: { document: { querySelector: vi.fn().mockReturnValue(bigboxMock) } }
      }))

    expect(() => processHtml('<html></html>')).toThrow('No <tbody> found inside <tr id="bigbox">')
  })
})
