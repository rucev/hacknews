import { describe, it, expect } from 'vitest'
import { formatEntry } from '../../src/logic/utils'

describe('formatEntry', () => {
  it('parses a normal entry correctly', () => {
    const rawEntry = [
      '30. Great Title! (website.com)',
      '167 points by user | 45 comments',
    ]

    const result = formatEntry(rawEntry)

    expect(result).toEqual({
      number: 30,
      title: 'Great Title!',
      points: 167,
      comments: 45,
    })
  })

  it('returns null if rawEntry is null or too short', () => {
    expect(formatEntry(null as any)).toBeNull()
    expect(formatEntry([])).toBeNull()
    expect(formatEntry(['Only title'])).toBeNull()
  })

  it('handles missing points and comments gracefully', () => {
    const rawEntry = [
      '1. News without points or comments',
      'by user',
    ]

    const result = formatEntry(rawEntry)
    expect(result).toEqual({
      number: 1,
      title: 'News without points or comments',
      points: 0,
      comments: 0,
    })
  })

  it('removes domain in parentheses from the title', () => {
    const rawEntry = [
      '42. Amazing news (example.com)',
      '10 points by user | 5 comments',
    ]

    const result = formatEntry(rawEntry)
    expect(result?.title).toBe('Amazing news')
  })

  it('defaults to 0 if number cannot be parsed', () => {
    const rawEntry = [
      'NoNumber. Broken entry',
      '5 points by user | 2 comments',
    ]

    const result = formatEntry(rawEntry)
    expect(result?.number).toBe(0)
  })
})
