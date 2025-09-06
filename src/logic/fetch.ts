import { isAllowedByRobots } from './robotsValidator'

export default async (): Promise<string> => {
  const url: string = 'https://news.ycombinator.com/'

  try {
    const isAllowed = isAllowedByRobots(url)
    if (!isAllowed) throw new Error('Error checking robots.txt')
  } catch (error) {
    throw new Error('Error checking robots.txt')
  }

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`)
  }

  return await res.text()
}