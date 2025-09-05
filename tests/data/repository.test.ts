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
  return {
    default: fsMock,
    ...fsMock,
  }
})

import fs from 'fs'

describe('Repository', () => {
  let repo: Repository

  beforeEach(() => {
    repo = new Repository()
    vi.clearAllMocks()
  })

  it('creates directory if missing', () => {
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
    ; (fs.existsSync as any).mockReturnValue(true)
      ; (fs.readFileSync as any).mockReturnValue(JSON.stringify([sampleNewsEntries]))
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
    ; (fs.existsSync as any).mockReturnValue(true)
      ; (fs.readFileSync as any).mockReturnValue('INVALID JSON')
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
})
