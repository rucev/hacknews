import { describe, it, expect, vi, beforeEach } from 'vitest'
import Repository from '../../src/data/repository'
import type { NewsEntries, NewsEntry } from '../../src/interfaces/index'

const sampleNewsEntry: NewsEntry = {
  number: 1,
  title: 'Test news title',
  points: 100,
  comments: 20,
}

const sampleNewsEntries: NewsEntries = {
  entries: [sampleNewsEntry],
  timeStamp: new Date(),
}

vi.mock('fs', () => {
  const fsMock = {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  }
  return { default: fsMock, ...fsMock }
})

import fs from 'fs'

describe('Repository', () => {
  let repo: Repository
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    repo = new Repository()
    vi.clearAllMocks()

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => { })
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
  })

  it('creates directory if missing when adding new entry', () => {
    ; (fs.existsSync as any).mockReturnValue(false)
    repo.addNewEntry(sampleNewsEntries)
    expect(fs.mkdirSync).toHaveBeenCalled()
  })

  it('writes new file if none exists', () => {
    ; (fs.existsSync as any).mockReturnValue(false)
    repo.addNewEntry(sampleNewsEntries)

    expect(fs.writeFileSync).toHaveBeenCalled()

    const writtenData = (fs.writeFileSync as any).mock.calls[0][1]
    const parsed = JSON.parse(writtenData)
    expect(parsed).toHaveLength(1)
    expect(parsed[0]).toMatchObject({
      entries: [
        {
          number: 1,
          title: 'Test news title',
          points: 100,
          comments: 20,
        },
      ],
      timeStamp: sampleNewsEntries.timeStamp.toISOString(),
    })
  })

  it('reads existing file and appends entry', () => {
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue(JSON.stringify([sampleNewsEntries]))

    repo.addNewEntry(sampleNewsEntries)

    const writtenData = (fs.writeFileSync as any).mock.calls[0][1]
    const parsed = JSON.parse(writtenData)
    expect(parsed).toHaveLength(2)
    expect(parsed[1]).toMatchObject({
      entries: [
        {
          number: 1,
          title: 'Test news title',
          points: 100,
          comments: 20,
        },
      ],
      timeStamp: sampleNewsEntries.timeStamp.toISOString(),
    })
  })

  it('handles invalid JSON gracefully', () => {
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue('INVALID JSON')

    repo.addNewEntry(sampleNewsEntries)

    const writtenData = (fs.writeFileSync as any).mock.calls[0][1]
    const parsed = JSON.parse(writtenData)
    expect(parsed).toHaveLength(1)
    expect(parsed[0]).toMatchObject({
      entries: [
        {
          number: 1,
          title: 'Test news title',
          points: 100,
          comments: 20,
        },
      ],
      timeStamp: sampleNewsEntries.timeStamp.toISOString(),
    })
  })

  it('getOldEntries returns empty array if file does not exist', () => {
    (fs.existsSync as any).mockReturnValue(false)
    const oldEntries = repo.getOldEntries()
    expect(oldEntries).toEqual([])
  })

  it('getOldEntries returns parsed entries if file exists', () => {
    ; (fs.existsSync as any).mockReturnValue(true)
      ; (fs.readFileSync as any).mockReturnValue(JSON.stringify([sampleNewsEntries]))

    const oldEntries = repo.getOldEntries()
    expect(oldEntries).toHaveLength(1)
    expect(oldEntries[0].entries[0].title).toBe('Test news title')
  })

  it('getMostRecentEntry returns the latest entry', () => {
    const oldEntries = [
      { ...sampleNewsEntries, timeStamp: new Date('2025-01-01') },
      { ...sampleNewsEntries, timeStamp: new Date('2025-12-31') },
    ];
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue(JSON.stringify(oldEntries))

    const mostRecent = repo.getMostRecentEntry()
    expect(new Date(mostRecent.timeStamp).toISOString()).toBe(new Date('2025-12-31').toISOString())
  })

  it('saveFilteredLongEntry writes a file with correct data', () => {
    const date = new Date('2025-09-05T12:00:00Z')
    repo.saveFilteredLongEntry([sampleNewsEntry], date)

    expect(fs.mkdirSync).toHaveBeenCalledWith(repo['folderPathLong'], { recursive: true })
    expect(fs.writeFileSync).toHaveBeenCalled()

    const fileName = (fs.writeFileSync as any).mock.calls[0][0]
    const writtenData = (fs.writeFileSync as any).mock.calls[0][1]
    const parsed = JSON.parse(writtenData)

    expect(parsed).toEqual([sampleNewsEntry])
    expect(fileName).toContain('2025-09-05')
    expect(fileName).toMatch(/\.json$/)
  })

  it('saveFilteredShortEntry writes a file with correct data', () => {
    const date = new Date('2025-09-05T12:00:00Z')
    repo.saveFilteredShortEntry([sampleNewsEntry], date)

    expect(fs.mkdirSync).toHaveBeenCalledWith(repo['folderPathShort'], { recursive: true })
    expect(fs.writeFileSync).toHaveBeenCalled()

    const fileName = (fs.writeFileSync as any).mock.calls[0][0]
    const writtenData = (fs.writeFileSync as any).mock.calls[0][1]
    const parsed = JSON.parse(writtenData)

    expect(parsed).toEqual([sampleNewsEntry])
    expect(fileName).toContain('2025-09-05')
    expect(fileName).toMatch(/\.json$/)
  })
})
