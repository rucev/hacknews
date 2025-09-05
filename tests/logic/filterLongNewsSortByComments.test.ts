import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NewsEntry, NewsEntries } from '../../src/interfaces'

import filterLongNewsSortByComments from '../../src/logic/filterLongNewsSortByComments'
import Repository from '../../src/data/repository'

vi.mock('../../src/logic/utils', () => ({
  filterLongTitles: vi.fn((entries: NewsEntry[]) => entries),
  sortByComments: vi.fn((entries: NewsEntry[]) => entries),
}))

import * as utils from '../../src/logic/utils'

describe('crawlLoop / processEntries', () => {
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
      saveFilteredLongEntry: vi.fn(),
    } as unknown as Repository

    vi.spyOn(Repository.prototype, 'getMostRecentEntry').mockImplementation(repoMock.getMostRecentEntry)
    vi.spyOn(Repository.prototype, 'saveFilteredLongEntry').mockImplementation(repoMock.saveFilteredLongEntry)

    vi.spyOn(console, 'error').mockImplementation(() => { })

    vi.clearAllMocks()
  })

  it('filters long titles, sorts by comments, and calls saveFilteredLongEntry', () => {
    filterLongNewsSortByComments()

    expect(repoMock.getMostRecentEntry).toHaveBeenCalled()

    expect(utils.filterLongTitles).toHaveBeenCalledWith(sampleEntries)
    expect(utils.sortByComments).toHaveBeenCalled()

    const expectedFiltered = sampleEntries
    expect(repoMock.saveFilteredLongEntry).toHaveBeenCalledWith(expectedFiltered, recentNews.timeStamp)
  })

  it('handles errors gracefully', () => {
    (repoMock.getMostRecentEntry as any).mockImplementation(() => { throw new Error('fail') })
    filterLongNewsSortByComments()
    expect(console.error).toHaveBeenCalledWith(expect.any(Error))
  })
})
