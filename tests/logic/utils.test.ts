import { describe, it, expect } from 'vitest'
import { filterLongTitles, sortByComments, formatEntry } from '../../src/logic/utils'
import type { NewsEntry } from '../../src/interfaces'

const entries: NewsEntry[] = [
  { number: 1, title: 'Short title', points: 10, comments: 5 },
  { number: 2, title: 'This is a title with exactly six words', points: 20, comments: 15 },
  { number: 3, title: 'Another very long news title for testing', points: 30, comments: 25 },
  { number: 4, title: 'Tiny', points: 5, comments: 2 },
]

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