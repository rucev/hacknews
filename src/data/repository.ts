import fs from 'fs'
import path from 'path'
import type { NewsEntries, NewsEntry } from '../interfaces/index.js'

export default class Repository {
  private filePath: string
  private folderPathLong: string
  private folderPathShort: string

  constructor() {
    this.filePath = path.join(__dirname, '../data/entries.json')
    this.folderPathLong = path.join(__dirname, '../data/long/')
    this.folderPathShort = path.join(__dirname, '../data/short/')
  }

  getOldEntries(): NewsEntries[] {
    let oldEntries: NewsEntries[] = []

    fs.mkdirSync(path.dirname(this.filePath), { recursive: true })

    if (fs.existsSync(this.filePath)) {
      const jsonOldData = fs.readFileSync(this.filePath, 'utf-8')
      try {
        oldEntries = JSON.parse(jsonOldData)
        if (!Array.isArray(oldEntries)) oldEntries = []
      } catch {
        oldEntries = []
      }
    }
    return oldEntries
  }

  addNewEntry(entries: NewsEntries) {
    let oldEntries: NewsEntries[] = this.getOldEntries()

    oldEntries.push(entries)
    fs.writeFileSync(this.filePath, JSON.stringify(oldEntries, null, 2), 'utf-8')
  }

  getMostRecentEntry(): NewsEntries {
    let oldEntries: NewsEntries[] = this.getOldEntries()

    const mostRecent = oldEntries.reduce((latest, current) => {
      return new Date(current.timeStamp) > new Date(latest.timeStamp) ? current : latest
    })

    return mostRecent
  }

  saveFilteredLongEntry(entries: NewsEntry[], timeStamp: Date) {
    fs.mkdirSync(this.folderPathLong, { recursive: true })

    const dateStr = new Date(timeStamp).toISOString().split('T')[0]
    const fileName = path.join(this.folderPathLong, `${dateStr}-${Date.now()}.json`)
    fs.writeFileSync(fileName, JSON.stringify(entries, null, 2), 'utf-8')
  }
}
