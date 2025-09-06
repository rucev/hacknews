import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import getNumberOne from '../../src/logic/getNumberOne'
import fetchHtml from '../../src/logic/fetch'
import { processHtml } from '../../src/logic/processors'
import type { NewsEntry } from '../../src/interfaces'

vi.mock('../../src/logic/fetch')
vi.mock('../../src/logic/processors')

describe('getNumberOne', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>

  const sampleNews: NewsEntry[] = [
    { number: 1, title: 'Breaking news!', points: 123, comments: 45 },
    { number: 2, title: 'Second news item', points: 50, comments: 10 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { })

      ; (fetchHtml as vi.Mock).mockResolvedValue('<html></html>')
      ; (processHtml as vi.Mock).mockReturnValue(sampleNews)
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
  })

  it('fetches, processes HTML, and logs the top news', async () => {
    await getNumberOne()

    expect(fetchHtml).toHaveBeenCalled()
    expect(processHtml).toHaveBeenCalledWith('<html></html>')

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(sampleNews[0].title)
    )
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Comments: ${sampleNews[0].comments}`)
    )
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Points: ${sampleNews[0].points}`)
    )
  })

  it('throws if no news is returned', async () => {
    ; (processHtml as vi.Mock).mockReturnValue(undefined)

    await expect(getNumberOne()).rejects.toThrow('error fetching top entry')
  })

  it('throws if fetch fails', async () => {
    ; (fetchHtml as vi.Mock).mockRejectedValue(new Error('network down'))

    await expect(getNumberOne()).rejects.toThrow('error fetching top entry')
  })
})
