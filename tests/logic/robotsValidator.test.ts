import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isAllowedByRobots } from '../../src/logic/robotsValidator'

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
