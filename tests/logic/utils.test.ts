import { describe, it, expect, vi, beforeEach } from 'vitest'
import { filterLongTitles, filterShortTitles, sortByComments, sortByPoints, formatEntry, countWords, isAllowedByRobots } from '../../src/logic/utils'
import type { NewsEntry } from '../../src/interfaces'

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

describe('isAllowedByRobots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns true if robots.txt allows access', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(`
        User-agent: *
        Disallow:
      `),
    } as any)

    const allowed = await isAllowedByRobots('https://example.com/test')
    expect(allowed).toBe(true)
  })

  it('returns false if robots.txt disallows path', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(`
        User-agent: *
        Disallow: /test
      `),
    } as any)

    const allowed = await isAllowedByRobots('https://example.com/test/page')
    expect(allowed).toBe(false)
  })

  it('returns true if robots.txt is missing (fetch not ok)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    } as any)

    const allowed = await isAllowedByRobots('https://example.com/test')
    expect(allowed).toBe(true)
  })

  it('respects only relevant user-agent', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(`
        User-agent: Googlebot
        Disallow: /google
        User-agent: *
        Disallow: /blocked
      `),
    } as any)

    const allowed1 = await isAllowedByRobots('https://example.com/valid/page')
    expect(allowed1).toBe(true)

    const allowed2 = await isAllowedByRobots('https://example.com/blocked/page')
    expect(allowed2).toBe(false)
  })

  it('returns false on fetch/network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network fail'))
    const allowed = await isAllowedByRobots('https://example.com/test')
    expect(allowed).toBe(false)
  })
})
