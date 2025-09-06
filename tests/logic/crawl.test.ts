import { describe, it, expect, vi, beforeEach } from 'vitest'
import crawl from '../../src/logic/crawl'
import Repository from '../../src/data/repository'
import fetchHtml from '../../src/logic/fetch'
import { processHtml } from '../../src/logic/processors'
import type { NewsEntry } from '../../src/interfaces'

vi.mock('../../src/data/repository')
vi.mock('../../src/logic/fetch')
vi.mock('../../src/logic/processors')

const sampleNews: NewsEntry = {
  number: 1,
  title: 'Title',
  points: 100,
  comments: 50,
}

describe('crawl', () => {
  let addNewEntryMock: ReturnType<typeof vi.fn>
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()

    addNewEntryMock = vi.fn()
      ; (Repository as unknown as vi.Mock).mockImplementation(() => ({
        addNewEntry: addNewEntryMock
      }))

      ; (fetchHtml as vi.Mock).mockResolvedValue('<html></html>')
      ; (processHtml as vi.Mock).mockReturnValue([sampleNews])

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { })
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
  })

  it('fetches, processes, and saves news', async () => {
    await crawl()

    expect(fetchHtml).toHaveBeenCalled()
    expect(processHtml).toHaveBeenCalledWith('<html></html>')
    expect(addNewEntryMock).toHaveBeenCalled()
  })

  it('throws if no news returned', async () => {
    ; (processHtml as vi.Mock).mockReturnValue(undefined)

    await expect(crawl()).rejects.toThrow('error saving file')
  })

  it('throws if repository fails to save', async () => {
    addNewEntryMock.mockImplementation(() => { throw new Error('disk full') })

    await expect(crawl()).rejects.toThrow('error saving file')
  })
})
