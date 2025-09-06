import { describe, it, expect, vi, beforeEach } from 'vitest'
import fetchHtml from '../../src/logic/fetch'
import * as robotsValidator from '../../src/logic/robotsValidator'


vi.mock('../../src/logic/robotsValidator')

describe('fetchHtml', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('fetches HTML when allowed by robots.txt', async () => {
    (robotsValidator.isAllowedByRobots as vi.Mock).mockReturnValue(true)
      ; (global.fetch as unknown as vi.Mock).mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue('<html>ok</html>'),
      })

    const html = await fetchHtml()
    expect(html).toBe('<html>ok</html>')
    expect(global.fetch).toHaveBeenCalledWith('https://news.ycombinator.com/')
  })

  it('throws if robots.txt disallows', async () => {
    (robotsValidator.isAllowedByRobots as vi.Mock).mockReturnValue(false)
    await expect(fetchHtml()).rejects.toThrow('Error checking robots.txt')
  })

  it('throws if fetch response is not ok', async () => {
    (robotsValidator.isAllowedByRobots as vi.Mock).mockReturnValue(true)
      ; (global.fetch as unknown as vi.Mock).mockResolvedValue({ ok: false, status: 500 })

    await expect(fetchHtml()).rejects.toThrow('Failed to fetch')
  })
})
