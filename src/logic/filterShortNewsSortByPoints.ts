import Repository from '../data/repository'
import { filterShortTitles, sortByPoints } from './processors'

export default () => {
  const repo = new Repository()
  const recentEntries = repo.getMostRecentEntry()
  const filteredEntries = filterShortTitles(recentEntries.entries)
  const sortedEntries = sortByPoints(filteredEntries)

  repo.saveFilteredShortEntry(sortedEntries, recentEntries.timeStamp)
}