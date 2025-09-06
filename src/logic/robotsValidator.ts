export const isAllowedByRobots = async (url: string): Promise<boolean> => {
  try {
    const { origin, pathname } = new URL(url)
    const robotsUrl = `${origin}/robots.txt`

    const res = await fetch(robotsUrl)
    if (!res.ok) {
      console.warn('robots.txt not found, assuming allowed.')
      return true
    }

    const robotsTxt = await res.text()
    const lines = robotsTxt.split('\n').map(l => l.trim())

    let appliesToUs = false
    for (const line of lines) {
      if (line.toLowerCase().startsWith('user-agent:')) {
        appliesToUs = line.toLowerCase().includes('*')
      } else if (appliesToUs && line.toLowerCase().startsWith('disallow:')) {
        const disallowedPath = line.split(':')[1]?.trim()
        if (disallowedPath && pathname.startsWith(disallowedPath)) {
          return false
        }
      }
    }
    return true
  } catch (error) {
    return false
  }
}