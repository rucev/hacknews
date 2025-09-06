import { describe, it, expect, vi, beforeEach } from 'vitest'
import fetchCrawler from '../../src/logic/crawl'
import Repository from '../../src/data/repository'
import * as robotsValidator from '../../src/logic/robotsValidator'
import * as processors from '../../src/logic/processors'
import { JSDOM } from 'jsdom'
import type { NewsEntry } from '../../src/interfaces'

const sampleNewsEntry: NewsEntry = {
  number: 1,
  title: 'Test news title',
  points: 100,
  comments: 20,
}

vi.mock('../../src/data/repository')
vi.mock('../../src/logic/robotsValidator')
vi.mock('../../src/logic/processors')
vi.mock('jsdom')

describe('fetchCrawler', () => {
  let addNewEntryMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    addNewEntryMock = vi.fn();
    (Repository as unknown as vi.Mock).mockImplementation(() => ({
      addNewEntry: addNewEntryMock,
    }));

    (processors.formatEntry as unknown as vi.Mock).mockImplementation(
      (raw: string[]) => sampleNewsEntry
    );
    (robotsValidator.isAllowedByRobots as unknown as vi.Mock).mockReturnValue(true)


    const rowsMock = [
      { textContent: '1. Test news title' },
      { textContent: '100 points 20 comments' },
      { textContent: 'separator row' },
      { textContent: '' },
      { textContent: 'More' }
    ]

    const tbodyMock = { querySelectorAll: vi.fn().mockReturnValue(rowsMock) }
    const bigboxMock = {
      querySelector: vi.fn().mockImplementation(selector => {
        if (selector === 'tbody') return tbodyMock
        return null
      }),
    };

    (JSDOM as unknown as vi.Mock).mockImplementation(() => ({
      window: {
        document: {
          querySelector: vi.fn().mockImplementation(selector => {
            if (selector === 'tr#bigbox') return bigboxMock
            return null
          }),
        },
      },
    }))

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue('<html></html>'),
    } as any)
  })

  it('fetches, parses, formats, and saves news', async () => {
    const timestamp = await fetchCrawler()

    expect(robotsValidator.isAllowedByRobots).toHaveBeenCalled()

    expect(JSDOM).toHaveBeenCalled()

    expect(addNewEntryMock).toHaveBeenCalled()
    expect(timestamp).toBeInstanceOf(Date)

    expect(processors.formatEntry).toHaveBeenCalledTimes(1)
  })

  it('throws error if robots.txt disallows', async () => {
    (robotsValidator.isAllowedByRobots as unknown as vi.Mock).mockReturnValue(false)

    await expect(fetchCrawler()).rejects.toThrow('Error checking robots.txt')
  })

  it('throws error if fetch fails', async () => {
    (robotsValidator.isAllowedByRobots as unknown as vi.Mock).mockReturnValue(true);
    (global.fetch as unknown as vi.Mock).mockResolvedValue({ ok: false, status: 404 })

    await expect(fetchCrawler()).rejects.toThrow('Failed to fetch')
  })

  it('throws error if <tr id="bigbox"> is missing', async () => {
    (robotsValidator.isAllowedByRobots as unknown as vi.Mock).mockReturnValue(true);
    (JSDOM as unknown as vi.Mock).mockImplementation(() => ({
      window: { document: { querySelector: vi.fn().mockReturnValue(null) } },
    }))

    await expect(fetchCrawler()).rejects.toThrow('No <tr id="bigbox"> found')
  })

  it('throws error if <tbody> is missing', async () => {
    (robotsValidator.isAllowedByRobots as unknown as vi.Mock).mockReturnValue(true)
    const bigboxMock = { querySelector: vi.fn().mockReturnValue(null) };
    (JSDOM as unknown as vi.Mock).mockImplementation(() => ({
      window: { document: { querySelector: vi.fn().mockReturnValue(bigboxMock) } },
    }))

    await expect(fetchCrawler()).rejects.toThrow('No <tbody> found inside <tr id="bigbox">')
  })

  it('handles error when saving fails', async () => {
    (robotsValidator.isAllowedByRobots as unknown as vi.Mock).mockReturnValue(true);
    addNewEntryMock.mockImplementation(() => { throw new Error('write failed') })

    await expect(fetchCrawler()).rejects.toThrow('error saving file')
  })
})
