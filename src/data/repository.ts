import fs from 'fs'
import path from 'path'
import type { NewsEntry } from '../interfaces/index.js'

export default class Repository {
  private filePath: string

  constructor() {
    this.filePath = path.join(__dirname, '../data/entries.json')
  }

  addNewEntry(entry: NewsEntry) {
    let oldEntries: NewsEntry[] = []

    fs.mkdirSync(path.dirname(this.filePath), { recursive: true })

    if (fs.existsSync(this.filePath)) {
      const oldData = fs.readFileSync(this.filePath, 'utf-8')
      try {
        oldEntries = JSON.parse(oldData)
        if (!Array.isArray(oldEntries)) oldEntries = []
      } catch {
        oldEntries = []
      }
    }

    oldEntries.push(entry)
    fs.writeFileSync(this.filePath, JSON.stringify(oldEntries, null, 2), 'utf-8')
  }
}
