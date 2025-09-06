import Repository from '../data/repository'
import { filterLongTitles, sortByComments } from './processors'

export default () => {
  const repo = new Repository()
  const recentEntries = repo.getMostRecentEntry()

  if (!recentEntries) throw new Error(`No entries. Run 'hacknews run [options]' first`)

  const filteredEntries = filterLongTitles(recentEntries.entries)
  const sortedEntries = sortByComments(filteredEntries)

  repo.saveFilteredLongEntry(sortedEntries, recentEntries.timeStamp)
}