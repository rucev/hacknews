import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../src/logic/crawl.ts', () => {
  return { crawl: vi.fn() }
})

import { crawlLoop } from '../../src/logic/crawlLoop.ts'
import { crawl } from '../../src/logic/crawl.ts'

const crawlMock = crawl as unknown as ReturnType<typeof vi.fn>

describe('crawlLoop', () => {
  let timer: NodeJS.Timeout | undefined

  beforeEach(() => {
    vi.useFakeTimers()
    crawlMock.mockReset()
    crawlMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    if (timer) clearInterval(timer)
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
    timer = undefined
  })

  it('calls crawl immediately and then on interval', async () => {
    const interval = 1000
    timer = await crawlLoop(interval)

    await vi.runAllTicks()
    expect(crawlMock).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(3 * interval)
    expect(crawlMock).toHaveBeenCalledTimes(4)
  })

  it('logs error when initial crawl fails', async () => {
    crawlMock.mockRejectedValueOnce(new Error('initial fail'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

    const result = await crawlLoop(1000)

    expect(result).toBeUndefined()
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error))
  })

  it('handles interval errors without stopping', async () => {
    const interval = 1000

    crawlMock.mockResolvedValueOnce(undefined)
    crawlMock.mockRejectedValueOnce(new Error('interval fail'))

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

    timer = await crawlLoop(interval)

    await vi.advanceTimersByTimeAsync(interval)

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error))
    expect(crawl).toHaveBeenCalledTimes(2)
  })

  it('handles multiple intervals with intermittent errors', async () => {
    const interval = 1000

    crawlMock
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('first interval'))
      .mockResolvedValueOnce(undefined)

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

    timer = await crawlLoop(interval)

    await vi.advanceTimersByTimeAsync(2 * interval)

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error))
    expect(crawlMock).toHaveBeenCalledTimes(3)
  })

  it('stops after maxRuns intervals', async () => {
    const interval = 1000
    const maxRuns = 3

    crawlMock.mockResolvedValue(undefined)

    timer = await crawlLoop(interval, maxRuns)

    await vi.runAllTicks()
    expect(crawlMock).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(2 * interval)
    expect(crawlMock).toHaveBeenCalledTimes(3)

    await vi.advanceTimersByTimeAsync(5 * interval)
    expect(crawlMock).toHaveBeenCalledTimes(3)
  })
})
