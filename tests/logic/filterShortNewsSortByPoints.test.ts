import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NewsEntry, NewsEntries } from '../../src/interfaces'

import filterShortNewsSortByPoints from '../../src/logic/filterShortNewsSortByPoints'
import Repository from '../../src/data/repository'

vi.mock('../../src/logic/processors', () => ({
  filterShortTitles: vi.fn((entries: NewsEntry[]) => entries),
  sortByPoints: vi.fn((entries: NewsEntry[]) => entries),
}))

import * as utils from '../../src/logic/processors'

describe('filters short titles, sorts by pints, and calls saveFilteredShortEntry', () => {
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
    repoMock = {
      getMostRecentEntry: vi.fn().mockReturnValue(recentNews),
      saveFilteredShortEntry: vi.fn(),
    } as unknown as Repository

    vi.spyOn(Repository.prototype, 'getMostRecentEntry').mockImplementation(repoMock.getMostRecentEntry)
    vi.spyOn(Repository.prototype, 'saveFilteredShortEntry').mockImplementation(repoMock.saveFilteredShortEntry)

    vi.clearAllMocks()
  })

  it('filters short titles, sorts by points, and calls saveFilteredShortEntry', () => {
    filterShortNewsSortByPoints()

    expect(repoMock.getMostRecentEntry).toHaveBeenCalled()
    expect(utils.filterShortTitles).toHaveBeenCalledWith(sampleEntries)
    expect(utils.sortByPoints).toHaveBeenCalled()

    const expectedFiltered = sampleEntries
    expect(repoMock.saveFilteredShortEntry).toHaveBeenCalledWith(expectedFiltered, recentNews.timeStamp)
  })
})
