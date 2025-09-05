import fs from 'fs'
import path from 'path'
import type { NewsEntries, NewsEntry } from '../interfaces/index.js'

export default class Repository {
  private filePath: string

  constructor() {
    this.filePath = path.join(__dirname, '../data/entries.json')
  }

  addNewEntry(entries: NewsEntries) {
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

    oldEntries.push(entries)
    fs.writeFileSync(this.filePath, JSON.stringify(oldEntries, null, 2), 'utf-8')
  }
}
