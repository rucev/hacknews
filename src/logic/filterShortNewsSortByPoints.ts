import Repository from '../data/repository'
import { filterShortTitles, sortByPoints } from './processors'

export default () => {
  const repo = new Repository()
  const recentEntries = repo.getMostRecentEntry()

  if (!recentEntries) throw new Error(`No entries. Run 'hacknews run [options]' first`)

  const filteredEntries = filterShortTitles(recentEntries.entries)
  const sortedEntries = sortByPoints(filteredEntries)

  repo.saveFilteredShortEntry(sortedEntries, recentEntries.timeStamp)
}