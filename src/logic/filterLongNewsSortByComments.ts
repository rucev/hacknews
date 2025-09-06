import Repository from '../data/repository'
import { filterLongTitles, sortByComments } from './processors'

export default () => {
  const repo = new Repository()
  const recentEntries = repo.getMostRecentEntry()
  const filteredEntries = filterLongTitles(recentEntries.entries)
  const sortedEntries = sortByComments(filteredEntries)

  repo.saveFilteredLongEntry(sortedEntries, recentEntries.timeStamp)
}