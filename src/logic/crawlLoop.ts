import { crawl } from "./crawl"

export const crawlLoop = async (interval: number, maxRuns?: number): Promise<NodeJS.Timeout | undefined> => {
  try {
    let count = 0
    await crawl()
    count++

    const timer = setInterval(() => {
      void crawl().catch(error => console.error(error))
      count++
      if (maxRuns && count >= maxRuns) {
        clearInterval(timer)
      }
    }, interval)

    return timer
  } catch (error) {
    console.error(error)
  }
}