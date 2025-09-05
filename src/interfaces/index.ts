export interface NewsEntry {
  number: number,
  title: string,
  points: number,
  comments: number
}

export interface NewsEntries {
  entries: NewsEntry[] | [],
  timeStamp: Date
}