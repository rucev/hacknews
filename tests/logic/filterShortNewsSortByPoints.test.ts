import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { NewsEntry, NewsEntries } from '../../src/interfaces'
import filterShortNewsSortByPoints from '../../src/logic/filterShortNewsSortByPoints'
import Repository from '../../src/data/repository'
import * as processors from '../../src/logic/processors'

vi.mock('../../src/logic/processors', () => ({
  filterShortTitles: vi.fn((entries: NewsEntry[]) => entries),
  sortByPoints: vi.fn((entries: NewsEntry[]) => entries),
}))

describe('filterShortNewsSortByPoints', () => {
  let repoMock: Repository

  const sampleEntries: NewsEntry[] = [
    { number: 1, title: 'Short title', points: 10, comments: 5 },
    { number: 2, title: 'This is a title with more than five words', points: 20, comments: 15 },
    { number: 3, title: 'Another very long news title for testing', points: 30, comments: 25 },
  ]

  const recentNews: NewsEntries = {
    entries: sampleEntries,
    timeStamp: new Date('2025-09-05T12:00:00Z'),
  }

  beforeEach(() => {
    vi.clearAllMocks()

    repoMock = {
      getMostRecentEntry: vi.fn().mockReturnValue(recentNews),
      saveFilteredShortEntry: vi.fn(),
    } as unknown as Repository

    vi.spyOn(Repository.prototype, 'getMostRecentEntry').mockImplementation(repoMock.getMostRecentEntry)
    vi.spyOn(Repository.prototype, 'saveFilteredShortEntry').mockImplementation(repoMock.saveFilteredShortEntry)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('filters short titles, sorts by points, and saves the filtered entries', () => {
    filterShortNewsSortByPoints()

    expect(repoMock.getMostRecentEntry).toHaveBeenCalled()

    expect(processors.filterShortTitles).toHaveBeenCalledWith(sampleEntries)
    expect(processors.sortByPoints).toHaveBeenCalledWith(sampleEntries)

    expect(repoMock.saveFilteredShortEntry).toHaveBeenCalledWith(sampleEntries, recentNews.timeStamp)
  })

  it('throws if no recent entries exist', () => {
    repoMock.getMostRecentEntry = vi.fn().mockReturnValue(undefined)
    vi.spyOn(Repository.prototype, 'getMostRecentEntry').mockImplementation(repoMock.getMostRecentEntry)

    expect(() => filterShortNewsSortByPoints()).toThrow(
      `No entries. Run 'hacknews run [options]' first`
    )
  })
})
